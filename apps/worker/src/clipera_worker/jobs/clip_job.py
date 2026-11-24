"""Job « clip_generation » : vidéo validée → transcription → sélection → rendu → clips enregistrés.

Étapes visibles par l'utilisateur (statut du job) : transcribing → selecting → rendering → completed.
Aucun clip n'est inventé : si aucun passage n'atteint le niveau requis, le job échoue avec une explication
claire et le quota est remboursé automatiquement (trigger SQL, aucun clip produit).
"""

from __future__ import annotations

import json
import logging
import os
import subprocess
import threading
import time
import zipfile
from concurrent.futures import ThreadPoolExecutor
from dataclasses import asdict
from pathlib import Path
from typing import Protocol

from ..captions.ass import CaptionOptions, Word, build_ass
from ..errors import JobCancelled, JobError
from ..media.audio import extract_speech_audio
from ..media.loudness import Energy, loudness_series
from ..media.probe import probe
from ..media.reframe import ReframeResult, reframe
from ..media.render import RenderSpec, compute_geometry, render_clip
from ..queue import Job, JobQueue
from ..selection import Clip, Transcript, select_clips, split_sentences
from ..selection.heuristic import METHOD, propose_candidates
from ..selection.topics import Vocabulary, segment_topics
from ..storage import Storage
from ..transcription import TranscriptionResult

log = logging.getLogger("clipera.clip_job")

ASSETS = Path(__file__).resolve().parents[3] / "assets"
DEEPGRAM_USD_PER_MIN = 0.0043  # tarif public Nova-3 pré-enregistré (COST_MODEL.md §7)
FORMATS = ("9:16", "1:1", "16:9")
CAPTION_STYLES = ("classic", "highlight", "modern", "minimal")
FRAMINGS = ("stable", "speaker", "wide")


def _read(path: str) -> str | None:
    try:
        with open(path) as f:
            return f.read().strip()
    except OSError:
        return None


def container_limits() -> tuple[float | None, int | None]:
    """Processeurs et mémoire réellement alloués au conteneur (cgroups v2 puis v1). None si inconnu.

    os.cpu_count() renvoie les cœurs de la machine HÔTE : sur un hébergeur (Railway…), c'est souvent 16 ou 32
    alors que le conteneur n'a droit qu'à une fraction. S'y fier lance trop de montages en même temps.
    """
    cpus = None
    raw = _read("/sys/fs/cgroup/cpu.max")
    if raw and not raw.startswith("max"):
        quota, period = raw.split()[:2]
        cpus = int(quota) / int(period)
    else:
        q, per = _read("/sys/fs/cgroup/cpu/cpu.cfs_quota_us"), _read("/sys/fs/cgroup/cpu/cpu.cfs_period_us")
        if q and per and int(q) > 0:
            cpus = int(q) / int(per)
    mem = None
    for path in ("/sys/fs/cgroup/memory.max", "/sys/fs/cgroup/memory/memory.limit_in_bytes"):
        raw = _read(path)
        if raw and raw.isdigit() and int(raw) < 1 << 50:
            mem = int(raw)
            break
    return cpus, mem


RENDER_MEMORY_BYTES = 900 * 1024**2  # un montage 1080p (fond flouté, sous-titres) : marge large


def render_concurrency() -> int:
    """Clips montés en même temps : borné par les processeurs ET la mémoire du conteneur (FFmpeg est multicœur).

    Inconnu → 1 (prudence). Forçable avec CLIPERA_RENDER_CONCURRENCY.
    """
    env = os.environ.get("CLIPERA_RENDER_CONCURRENCY")
    if env and env.isdigit() and int(env) >= 1:
        return min(int(env), 6)
    cpus, mem = container_limits()
    if cpus is None:
        try:
            cpus = float(len(os.sched_getaffinity(0)))
        except (AttributeError, OSError):
            cpus = None
    if cpus is None or mem is None:
        return 1
    by_cpu = int(cpus // 2)  # chaque FFmpeg exploite au moins 2 cœurs
    by_mem = int(mem // RENDER_MEMORY_BYTES) - 1  # on garde de la place pour le reste du worker
    return max(1, min(3, by_cpu, by_mem))


class Transcriber(Protocol):
    def transcribe_file(self, audio: Path, *, language: str | None = "fr") -> TranscriptionResult: ...


def _check(cancel) -> None:
    if cancel is not None and cancel.is_set():
        raise JobCancelled()


def _options(job: Job) -> dict:
    o = job.options or {}
    fmt = o.get("format", "9:16")
    captions = o.get("captions") or {}
    style = captions.get("style", "classic")
    return {
        "format": fmt if fmt in FORMATS else "9:16",
        "captions": bool(captions.get("enabled", True)),
        "caption_style": style if style in CAPTION_STYLES else "classic",
        "language": o.get("language") or "fr",
        "watermark": bool(o.get("watermark", True)),  # par défaut : filigrane (offre Free)
        "framing": o.get("framing") if o.get("framing") in FRAMINGS else "stable",
        "max_short_side": int(o.get("export_max_height") or 720),
        "auto": bool(o.get("auto", False)),
    }


def clip_words(transcript: Transcript, start: float, end: float) -> list[Word]:
    """Mots du clip, horodatés relativement au début du clip et bornés à sa durée."""
    out = []
    for w in transcript.words:
        if w.end <= start or w.start >= end:
            continue
        out.append(Word(w.text, round(max(w.start, start) - start, 3), round(min(w.end, end) - start, 3)))
    return out


def _thumbnail(video: Path, dst: Path, at: float) -> Path:
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{at:.3f}", "-i", str(video),
                    "-frames:v", "1", "-q:v", "4", str(dst)], check=True, timeout=60)
    return dst


def _excerpt(transcript: Transcript, c: Clip, limit: int = 1200) -> str:
    text = " ".join(w.text for w in transcript.words if c.start <= w.start < c.end)
    return text if len(text) <= limit else text[: limit - 1].rsplit(" ", 1)[0] + "…"


def run_clip_job(job: Job, *, queue: JobQueue, storage: Storage, work: Path, cancel=None,
                 transcriber: Transcriber | None = None, **_) -> dict:
    if transcriber is None:
        raise JobError("transcription_not_configured", "La transcription est momentanément indisponible.",
                       retryable=True, detail="DEEPGRAM_API_KEY absente")
    rows = queue.execute("select storage_key, status from source_videos where id = %s", (job.source_video_id,))
    if not rows or rows[0]["status"] != "validated":
        raise JobError("source_not_ready", "La vidéo n'est plus disponible.")
    opts = _options(job)
    requested = job.requested_clips or 3
    metrics: dict = {"selection_method": METHOD, "options": opts}
    timings: dict[str, float] = {}

    # Reprise après échec : on repart de zéro pour ce job (mêmes clés de stockage, écrasées).
    queue.execute("delete from clips where job_id = %s", (job.id,))

    t = time.monotonic()
    source = storage.download(rows[0]["storage_key"], work / "source")
    info, _raw = probe(source)
    _check(cancel)

    # 1. Transcription
    audio = extract_speech_audio(source, work / "speech.opus")
    tr = transcriber.transcribe_file(audio, language=opts["language"])
    timings["transcription_s"] = round(time.monotonic() - t, 2)
    metrics["transcription"] = {"model": tr.model, "audio_seconds": tr.duration_s, "words": len(tr.transcript.words),
                                "request_id": tr.request_id}
    cost = round(tr.duration_s / 60 * DEEPGRAM_USD_PER_MIN, 5)
    base = f"clips/{job.user_id}/{job.id}"
    tjson = work / "transcript.json"
    tjson.write_text(json.dumps({"language": tr.transcript.language,
                                 "words": [asdict(w) for w in tr.transcript.words]}, ensure_ascii=False))
    storage.upload(tjson, f"{base}/transcript.json", "application/json")
    _check(cancel)

    # 2. Sélection : vue d'ensemble (vocabulaire, sujets), propositions, notes, choix diversifié.
    queue.set_status(job.id, "selecting", "Analyse des sujets et recherche des meilleurs passages")
    t = time.monotonic()
    sentences = split_sentences(tr.transcript)
    try:
        energy = Energy(loudness_series(audio))
    except Exception:  # noqa: BLE001 — signal d'appoint : sans lui, la sélection fonctionne quand même
        log.warning("loudness failed", exc_info=True)
        energy = None
    vocab = Vocabulary(sentences) if sentences else None
    topics = segment_topics(sentences, vocab) if sentences else []
    result = select_clips(propose_candidates(sentences, energy, vocab), sentences, requested=requested,
                          auto=opts["auto"], topics=topics, vocab=vocab)
    timings["selection_s"] = round(time.monotonic() - t, 3)
    metrics["selection"] = {
        "sentences": len(sentences), "selected": len(result.selected), "rejected": len(result.rejected),
        "explanation": result.explanation, "requested": requested, "auto": opts["auto"], "cap": result.cap,
        "cap_reason": result.cap_reason,
        "topics": [{"start": round(tp.start, 1), "end": round(tp.end, 1), "keywords": list(tp.keywords)}
                   for tp in topics],
    }
    if not result.selected:
        msg = ("Aucune parole détectée dans cette vidéo." if not tr.transcript.words else
               "Aucun passage de cette vidéo n'atteint notre niveau de qualité : nous préférons ne pas "
               "générer de clip médiocre. Ton quota a été recrédité.")
        raise JobError("no_good_moment", msg, detail=result.explanation)
    _check(cancel)

    # 3. Montage : chaque clip a sa ligne (statut « rendering » → « ready » ou « failed »), plusieurs en parallèle.
    #    Un échec isolé n'annule pas les autres.
    t = time.monotonic()
    geo = compute_geometry(info.width, info.height, opts["format"], opts["max_short_side"])
    plan = _insert_pending(job, queue, result.selected, tr.transcript, opts)
    queue.set_status(job.id, "rendering", f"Montage : 0/{len(plan)} clip(s) prêt(s)")
    failures: list[dict] = []
    uploaded: list[str] = []
    try:
        produced = _render_all(job, queue, storage, work, cancel, source, plan, tr.transcript, info, geo, opts, base,
                               failures, uploaded)
    except BaseException:
        # Annulation ou erreur imprévue : on ne laisse aucun clip à moitié livré.
        queue.execute("delete from clips where job_id = %s", (job.id,))
        for key in uploaded:
            try:
                storage.delete(key)
            except Exception:  # noqa: BLE001
                log.warning("cleanup failed for %s", key, exc_info=True)
        raise
    timings["render_s"] = round(time.monotonic() - t, 2)
    if produced == 0:
        queue.execute("delete from clips where job_id = %s", (job.id,))
        raise JobError("render_failed", "Le montage des clips a échoué. Ton quota a été recrédité.",
                       retryable=True, detail=json.dumps(failures))

    # 4. Archive de tous les clips (téléchargement en une fois). Facultative : son échec n'annule rien.
    zip_key = None
    if produced > 1:
        try:
            zip_key = _zip_clips(queue, storage, work, job, base)
        except Exception:  # noqa: BLE001
            log.warning("zip failed", exc_info=True)

    metrics.update(timings=timings, render_failures=failures, clips_produced=produced, cost_usd=cost,
                   zip_key=zip_key, render_concurrency=render_concurrency(),
                   container={"cpus": container_limits()[0], "memory_bytes": container_limits()[1]})
    return metrics


def _insert_pending(job, queue, selected: list[Clip], transcript, opts) -> list[tuple[int, Clip, str]]:
    """Crée une ligne par clip à monter (statut « rendering ») pour que l'interface suive chaque clip."""
    plan = []
    for rank, c in enumerate(selected, start=1):
        cand = c.candidate
        details = {"criteria": c.criteria, "reasons": cand.reasons, "flags": c.flags, "method": METHOD,
                   "topic": c.topic, "content_type": cand.content_type, "diversity": c.diversity}
        row = queue.execute(
            "insert into clips (user_id, project_id, job_id, source_video_id, status, rank, start_seconds, "
            "end_seconds, title, transcript_excerpt, score_total, score_details, render_options) "
            "values (%s,%s,%s,%s,'rendering',%s,%s,%s,%s,%s,%s,%s::jsonb,%s::jsonb) returning id",
            (job.user_id, job.project_id, job.id, job.source_video_id, rank, c.start, c.end, cand.title,
             _excerpt(transcript, c), c.total, json.dumps(details),
             json.dumps({k: opts[k] for k in ("format", "captions", "caption_style", "watermark")})),
        )
        plan.append((rank, c, str(row[0]["id"])))
    return plan


def _zip_clips(queue, storage, work: Path, job, base: str) -> str:
    rows = queue.execute("select rank, storage_key from clips where job_id = %s and status = 'ready' order by rank",
                         (job.id,))
    out = work / "clips.zip"
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_STORED) as z:  # MP4 déjà compressé : on stocke tel quel
        for r in rows:
            local = work / f"zip-{r['rank']}.mp4"
            storage.download(r["storage_key"], local)
            z.write(local, f"clipera-clip-{r['rank']:02d}.mp4")
            local.unlink(missing_ok=True)
    key = f"{base}/clips.zip"
    storage.upload(out, key, "application/zip")
    out.unlink(missing_ok=True)
    return key


def _framing(source: Path, start: float, end: float, crop_fraction: float, mode: str) -> ReframeResult:
    """Cadrage intelligent ; en cas de problème imprévu, cadre centré (le clip est quand même livré)."""
    try:
        return reframe(source, start, end, crop_fraction=crop_fraction, mode=mode)
    except Exception:  # noqa: BLE001 — le recadrage est une amélioration, jamais une cause d'échec
        log.warning("reframe failed, falling back to center", exc_info=True)
        return ReframeResult((), "center", 0.0, 0, 0, mode)


def _render_all(job, queue, storage, work, cancel, source, plan, transcript, info, geo, opts, base, failures,
                uploaded) -> int:
    lock = threading.Lock()
    done = {"ready": 0}
    total = len(plan)

    def attempt(rank, c, *, simple):
        try:
            return _render_one(rank, c, source, transcript, info, geo, opts, base, work, storage, uploaded, lock,
                               simple=simple), None
        except (JobError, subprocess.SubprocessError, OSError) as e:
            detail = getattr(e, "detail", None) or repr(e)
            log.warning("clip %s failed (simple=%s): %s", rank, simple, detail)
            return None, {"code": getattr(e, "code", type(e).__name__), "detail": str(detail)[-600:]}

    def ok(item, out) -> None:
        rank, c, clip_id = item
        r, key, tkey, framing = out
        queue.execute(
            "update clips set status = 'ready', end_seconds = %s, storage_key = %s, thumbnail_key = %s, width = %s, "
            "height = %s, size_bytes = %s, render_options = render_options || %s::jsonb where id = %s",
            (min(c.end, info.duration_seconds), key, tkey, r.width, r.height, r.size_bytes,
             json.dumps({"framing": framing.as_dict()}), clip_id),
        )
        with lock:
            done["ready"] += 1
            msg = f"Montage : {done['ready']}/{total} clip(s) prêt(s)"
        queue.set_status(job.id, "rendering", msg)

    retry: list[tuple] = []

    def first_pass(item) -> None:
        _check(cancel)
        out, err = attempt(item[0], item[1], simple=False)
        if out:
            ok(item, out)
        else:
            with lock:
                retry.append((item, err))

    workers = min(render_concurrency(), total)
    if workers == 1:
        for item in plan:
            first_pass(item)
    else:
        with ThreadPoolExecutor(max_workers=workers, thread_name_prefix="render") as pool:
            for f in [pool.submit(first_pass, item) for item in plan]:
                f.result()  # remonte une annulation ou une erreur imprévue

    # 2e essai, SEUL (plus aucun autre montage en cours : écarte un manque de mémoire ou de processeur), avec le
    # cadrage le plus simple.
    for item, first_err in sorted(retry, key=lambda x: x[0][0]):
        _check(cancel)
        rank, _, clip_id = item
        out, err = attempt(rank, item[1], simple=True)
        if out:
            ok(item, out)
            continue
        failures.append({"rank": rank, "error": err["code"], "first": first_err, "last": err})
        queue.execute("update clips set status = 'failed', score_details = score_details || %s::jsonb "
                      "where id = %s", (json.dumps({"render_error": err["code"]}), clip_id))
    return done["ready"]


def _render_one(rank, c: Clip, source, transcript, info, geo, opts, base, work, storage, uploaded, lock, *,
                simple: bool):
    out = work / f"clip-{rank}.mp4"
    ass = None
    if opts["captions"]:
        ass = work / f"clip-{rank}.ass"
        ass.write_text(build_ass(clip_words(transcript, c.start, c.end), width=geo.out_w, height=geo.out_h,
                                 opts=CaptionOptions(style=opts["caption_style"])))
    end = min(c.end, info.duration_seconds)
    if opts["framing"] == "wide":
        framing = ReframeResult((), "wide", 0.0, 0, 0, "wide")
    elif simple:
        framing = ReframeResult((), "center", 0.0, 0, 0, opts["framing"])
    else:
        framing = _framing(source, c.start, end, geo.crop_w / info.width, opts["framing"])
    spec = RenderSpec(source=source, output=out, start=c.start, end=end, crop_track=framing.keyframes,
                      layout="fit" if opts["framing"] == "wide" else "crop",
                      aspect=opts["format"], max_short_side=opts["max_short_side"], ass_file=ass,
                      watermark_file=ASSETS / "watermark.png" if opts["watermark"] else None)
    r = render_clip(spec, info)
    thumb = _thumbnail(out, work / f"clip-{rank}.jpg", min(1.0, r.duration / 2))
    key, tkey = f"{base}/{rank}.mp4", f"{base}/{rank}.jpg"
    storage.upload(out, key, "video/mp4")
    with lock:
        uploaded.append(key)
    storage.upload(thumb, tkey, "image/jpeg")
    with lock:
        uploaded.append(tkey)
    out.unlink(missing_ok=True)
    return r, key, tkey, framing
