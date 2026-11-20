"""Job « clip_generation » : vidéo validée → transcription → sélection → rendu → clips enregistrés.

Étapes visibles par l'utilisateur (statut du job) : transcribing → selecting → rendering → completed.
Aucun clip n'est inventé : si aucun passage n'atteint le niveau requis, le job échoue avec une explication
claire et le quota est remboursé automatiquement (trigger SQL, aucun clip produit).
"""

from __future__ import annotations

import json
import logging
import subprocess
import time
from dataclasses import asdict
from pathlib import Path
from typing import Protocol

from ..captions.ass import CaptionOptions, Word, build_ass
from ..errors import JobCancelled, JobError
from ..media.audio import extract_speech_audio
from ..media.probe import probe
from ..media.render import RenderSpec, compute_geometry, render_clip
from ..queue import Job, JobQueue
from ..selection import Clip, Transcript, select_clips, split_sentences
from ..selection.heuristic import METHOD, propose_candidates
from ..storage import Storage
from ..transcription import TranscriptionResult

log = logging.getLogger("clipera.clip_job")

ASSETS = Path(__file__).resolve().parents[3] / "assets"
DEEPGRAM_USD_PER_MIN = 0.0043  # tarif public Nova-3 pré-enregistré (COST_MODEL.md §7)
FORMATS = ("9:16", "1:1", "16:9")
CAPTION_STYLES = ("classic", "highlight", "modern", "minimal")


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
        "max_short_side": int(o.get("export_max_height") or 720),
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

    # 2. Sélection
    queue.set_status(job.id, "selecting", "Recherche des meilleurs passages")
    t = time.monotonic()
    sentences = split_sentences(tr.transcript)
    result = select_clips(propose_candidates(sentences), sentences, requested=requested)
    timings["selection_s"] = round(time.monotonic() - t, 3)
    metrics["selection"] = {"sentences": len(sentences), "selected": len(result.selected),
                            "rejected": len(result.rejected), "explanation": result.explanation}
    if not result.selected:
        msg = ("Aucune parole détectée dans cette vidéo." if not tr.transcript.words else
               "Aucun passage de cette vidéo n'atteint notre niveau de qualité : nous préférons ne pas "
               "générer de clip médiocre. Ton quota a été recrédité.")
        raise JobError("no_good_moment", msg, detail=result.explanation)
    _check(cancel)

    # 3. Rendu de chaque clip (un échec isolé n'annule pas les autres)
    queue.set_status(job.id, "rendering", f"Montage de {len(result.selected)} clip(s)")
    t = time.monotonic()
    geo = compute_geometry(info.width, info.height, opts["format"], opts["max_short_side"])
    produced, failures, uploaded = 0, [], []
    try:
        produced = _render_all(job, queue, storage, work, cancel, source, result.selected, tr.transcript, info,
                               geo, opts, base, failures, uploaded)
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
        raise JobError("render_failed", "Le montage des clips a échoué. Ton quota a été recrédité.",
                       retryable=True, detail=json.dumps(failures))

    metrics.update(timings=timings, render_failures=failures, clips_produced=produced, cost_usd=cost)
    return metrics


def _render_all(job, queue, storage, work, cancel, source, selected, transcript, info, geo, opts, base, failures,
                uploaded) -> int:
    produced = 0
    for rank, c in enumerate(selected, start=1):
        _check(cancel)
        out = work / f"clip-{rank}.mp4"
        ass = None
        if opts["captions"]:
            ass = work / f"clip-{rank}.ass"
            ass.write_text(build_ass(clip_words(transcript, c.start, c.end), width=geo.out_w, height=geo.out_h,
                                     opts=CaptionOptions(style=opts["caption_style"])))
        spec = RenderSpec(source=source, output=out, start=c.start, end=min(c.end, info.duration_seconds),
                          aspect=opts["format"], max_short_side=opts["max_short_side"], ass_file=ass,
                          watermark_file=ASSETS / "watermark.png" if opts["watermark"] else None)
        try:
            r = render_clip(spec, info)
            thumb = _thumbnail(out, work / f"clip-{rank}.jpg", min(1.0, r.duration / 2))
        except (JobError, subprocess.SubprocessError) as e:
            log.warning("clip %s failed: %r", rank, e)
            failures.append({"rank": rank, "error": getattr(e, "code", repr(e))})
            continue
        key, tkey = f"{base}/{rank}.mp4", f"{base}/{rank}.jpg"
        storage.upload(out, key, "video/mp4")
        uploaded.append(key)
        storage.upload(thumb, tkey, "image/jpeg")
        uploaded.append(tkey)
        cand = c.candidate
        queue.execute(
            "insert into clips (user_id, project_id, job_id, source_video_id, rank, start_seconds, end_seconds,"
            " title, transcript_excerpt, score_total, score_details, render_options, storage_key, thumbnail_key,"
            " width, height, size_bytes) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s::jsonb,%s::jsonb,%s,%s,%s,%s,%s)",
            (job.user_id, job.project_id, job.id, job.source_video_id, rank, c.start, spec.end, cand.title,
             _excerpt(transcript, c), c.total,
             json.dumps({"criteria": c.criteria, "reasons": cand.reasons, "flags": c.flags, "method": METHOD}),
             json.dumps({k: opts[k] for k in ("format", "captions", "caption_style", "watermark")}),
             key, tkey, r.width, r.height, r.size_bytes),
        )
        produced += 1
        out.unlink(missing_ok=True)
    return produced
