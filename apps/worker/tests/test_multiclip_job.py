"""Bout en bout multi-clips : vraie base + stockage local + FFmpeg réel, sur une vidéo d'une heure.

Transcription : podcast de test (fixtures/podcast_fr.py), aucun service payant appelé.
Vérifie : 10 clips montés en parallèle, statut par clip, échec isolé, reprise après interruption, archive ZIP,
mode automatique, quotas. Requiert CLIPERA_TEST_DB_ADMIN_URL.
"""

import json
import os
import pathlib
import subprocess
import sys
import time
import uuid
import zipfile
from itertools import combinations

import psycopg
import pytest
from psycopg.rows import dict_row

from clipera_worker.jobs import clip_job
from clipera_worker.media.probe import probe
from clipera_worker.queue import JobQueue
from clipera_worker.runner import process_one
from clipera_worker.storage import LocalStorage
from clipera_worker.transcription import TranscriptionResult

sys.path.insert(0, str(pathlib.Path(__file__).parent / "fixtures"))
from podcast_fr import podcast  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[3]
ADMIN_URL = os.environ.get("CLIPERA_TEST_DB_ADMIN_URL")
DB = "clipera_multiclip_it"
pytestmark = pytest.mark.skipif(not ADMIN_URL, reason="CLIPERA_TEST_DB_ADMIN_URL non défini")

HOUR, _ = podcast(20, 130)  # ≈ 73 min
SHORT, _ = podcast(2, 20)  # ≈ 4 min
MID, _ = podcast(8, 60)  # ≈ 15 min


class Fake:
    def __init__(self, tr):
        self.tr = tr

    def transcribe_file(self, audio, *, language="fr"):
        return TranscriptionResult(self.tr, self.tr.duration, "test", "fixture")


@pytest.fixture(scope="module")
def db_url():
    with psycopg.connect(ADMIN_URL, autocommit=True) as c:
        c.execute(f"drop database if exists {DB} with (force)")
        c.execute(f"create database {DB}")
    url = psycopg.conninfo.make_conninfo(ADMIN_URL, dbname=DB)
    with psycopg.connect(url, autocommit=True) as c:
        c.execute((ROOT / "supabase/tests/supabase_stub.sql").read_text())
        for f in sorted((ROOT / "supabase/migrations").glob("*.sql")):
            c.execute(f.read_text())
        # Base de test isolée : l'offre Free reçoit les limites d'une offre payante pour accepter 1 h et 10 clips.
        c.execute("update plans set max_clips_per_video = 10, max_video_seconds = 4 * 3600, "
                  "monthly_source_seconds = 100 * 3600, monthly_source_videos = 100 where id = 'free'")
    return url


def make_video(path: pathlib.Path, seconds: float) -> pathlib.Path:
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-f", "lavfi", "-i", f"testsrc2=size=640x360:rate=10:duration={seconds:.0f}",
                    "-f", "lavfi", "-i", f"sine=frequency=200:sample_rate=16000:duration={seconds:.0f}",
                    "-c:v", "libx264", "-preset", "ultrafast", "-g", "50", "-c:a", "aac", "-b:a", "32k",
                    "-shortest", str(path)], check=True)
    return path


@pytest.fixture(scope="module")
def videos(tmp_path_factory):
    d = tmp_path_factory.mktemp("multi")
    return {name: make_video(d / f"{name}.mp4", tr.duration + 5)
            for name, tr in (("hour", HOUR), ("short", SHORT), ("mid", MID))}


def create_job(url, storage, video, requested, options=None):
    info, _ = probe(video)
    uid = uuid.uuid4()
    with psycopg.connect(url, autocommit=True, row_factory=dict_row) as c:
        c.execute("update processing_jobs set status = 'cancelled' where status = 'queued'")
        c.execute("insert into auth.users (id) values (%s)", (uid,))
        pid = c.execute("insert into projects (user_id) values (%s) returning id", (uid,)).fetchone()["id"]
        vid = uuid.uuid4()
        key = f"sources/{uid}/{vid}/source.mp4"
        storage.upload(video, key, "video/mp4")
        c.execute("insert into source_videos (id, project_id, user_id, status, storage_key, original_filename,"
                  " declared_size_bytes, duration_seconds, width, height, rights_confirmed_at)"
                  " values (%s,%s,%s,'validated',%s,'v.mp4',%s,%s,640,360,now())",
                  (vid, pid, uid, key, video.stat().st_size, info.duration_seconds))
        c.execute("select set_config('request.jwt.claim.sub', %s, false)", (str(uid),))
        job = c.execute("select * from create_clip_job(%s, %s, %s::jsonb, %s)",
                        (vid, requested, json.dumps(options or {}), f"t-{uuid.uuid4()}")).fetchone()
    return uid, job["id"]


def rows(url, sql, *params):
    with psycopg.connect(url, row_factory=dict_row) as c:
        return c.execute(sql, params).fetchall()


@pytest.fixture
def env(db_url, tmp_path, monkeypatch):
    monkeypatch.setenv("CLIPERA_RENDER_CONCURRENCY", "3")
    return LocalStorage(tmp_path / "bucket"), JobQueue(db_url, worker_id="w"), tmp_path / "work", db_url


def test_hour_long_video_gives_ten_clips_rendered_in_parallel(env, videos):
    storage, queue, work, url = env
    uid, job_id = create_job(url, storage, videos["hour"], 10)
    t = time.monotonic()
    assert process_one(queue, storage, work, heartbeat_s=0.5, deps={"transcriber": Fake(HOUR)})
    elapsed = time.monotonic() - t
    (job,) = rows(url, "select * from processing_jobs where id = %s", job_id)
    assert job["status"] == "completed", job["error_message"]
    assert job["clips_produced"] == 10
    m = job["metrics"]
    assert m["render_concurrency"] == 3 and m["selection"]["selected"] == 10 and len(m["selection"]["topics"]) >= 8
    print(f"\n1 h → 10 clips en {elapsed:.0f} s (montage {m['timings']['render_s']} s, sélection "
          f"{m['timings']['selection_s']} s)")

    clips = rows(url, "select * from clips where job_id = %s order by rank", job_id)
    assert [c["rank"] for c in clips] == list(range(1, 11)) and {c["status"] for c in clips} == {"ready"}
    for a, b in combinations(clips, 2):
        assert min(a["end_seconds"], b["end_seconds"]) <= max(a["start_seconds"], b["start_seconds"])
    assert len({c["score_details"]["topic"] for c in clips}) >= 8
    for c in clips[:3]:  # durée réelle du fichier = bornes en base (synchronisation)
        out = work.parent / f"c{c['rank']}.mp4"
        storage.download(c["storage_key"], out)
        info, _ = probe(out)
        assert info.has_audio
        assert info.duration_seconds == pytest.approx(float(c["end_seconds"]) - float(c["start_seconds"]), abs=0.2)

    # Suivi visible : la progression « k/10 » a bien été publiée pendant le montage.
    details = [r["message"] for r in rows(url, "select message from job_events where job_id = %s", job_id)]
    assert any(d and d.startswith("Montage : 0/10") for d in details)

    # Archive : les 10 clips, nommés dans l'ordre.
    z = storage.download(m["zip_key"], work.parent / "all.zip")
    with zipfile.ZipFile(z) as f:
        assert f.namelist() == [f"clipera-clip-{i:02d}.mp4" for i in range(1, 11)]
    assert rows(url, "select * from usage_records where job_id = %s and kind = 'refund'", job_id) == []


def test_one_failing_clip_does_not_block_the_others(env, videos, monkeypatch):
    storage, queue, work, url = env
    real = clip_job.render_clip

    def flaky(spec, info):
        if spec.output.name == "clip-3.mp4":
            raise subprocess.CalledProcessError(1, "ffmpeg")
        return real(spec, info)

    monkeypatch.setattr(clip_job, "render_clip", flaky)
    _, job_id = create_job(url, storage, videos["hour"], 5)
    assert process_one(queue, storage, work, deps={"transcriber": Fake(HOUR)})
    (job,) = rows(url, "select * from processing_jobs where id = %s", job_id)
    assert job["status"] == "completed" and job["clips_produced"] == 4
    clips = rows(url, "select rank, status, score_details from clips where job_id = %s order by rank", job_id)
    assert [c["status"] for c in clips] == ["ready", "ready", "failed", "ready", "ready"]
    assert clips[2]["score_details"]["render_error"]
    (f,) = job["metrics"]["render_failures"]
    assert f["rank"] == 3 and f["error"] == clips[2]["score_details"]["render_error"]
    assert "ffmpeg" in f["last"]["detail"]  # le message d'erreur exact est conservé pour le diagnostic


def test_clip_failing_only_under_load_succeeds_when_retried_alone(env, videos, monkeypatch):
    storage, queue, work, url = env
    real = clip_job.render_clip
    seen = {"clip-2.mp4": 0}

    def busy_once(spec, info):
        if spec.output.name in seen and seen[spec.output.name] == 0:
            seen[spec.output.name] += 1
            raise subprocess.CalledProcessError(-9, "ffmpeg")  # tué une fois (manque de mémoire)
        return real(spec, info)

    monkeypatch.setattr(clip_job, "render_clip", busy_once)
    _, job_id = create_job(url, storage, videos["mid"], 3)
    assert process_one(queue, storage, work, deps={"transcriber": Fake(MID)})
    (job,) = rows(url, "select * from processing_jobs where id = %s", job_id)
    assert job["status"] == "completed" and job["metrics"]["render_failures"] == []
    statuses = [r["status"] for r in rows(url, "select status from clips where job_id = %s order by rank", job_id)]
    assert statuses and set(statuses) == {"ready"} and job["clips_produced"] == len(statuses)


def test_crash_mid_render_is_cleaned_then_retried_successfully(env, videos, monkeypatch):
    storage, queue, work, url = env
    real = clip_job.render_clip
    calls = {"n": 0}

    def crash_once(spec, info):
        calls["n"] += 1
        if calls["n"] == 2:
            raise RuntimeError("serveur interrompu")  # erreur imprévue : tout le job est repris
        return real(spec, info)

    monkeypatch.setattr(clip_job, "render_clip", crash_once)
    monkeypatch.setenv("CLIPERA_RENDER_CONCURRENCY", "1")
    _, job_id = create_job(url, storage, videos["mid"], 3)
    assert process_one(queue, storage, work, deps={"transcriber": Fake(MID)})
    (job,) = rows(url, "select * from processing_jobs where id = %s", job_id)
    assert job["status"] == "queued" and job["error_code"] == "internal_error"  # nouvelle tentative prévue
    assert rows(url, "select * from clips where job_id = %s", job_id) == []  # rien de livré à moitié
    with psycopg.connect(url, autocommit=True) as c:
        c.execute("update processing_jobs set run_after = now() where id = %s", (job_id,))
    assert process_one(queue, storage, work, deps={"transcriber": Fake(MID)})
    (job,) = rows(url, "select * from processing_jobs where id = %s", job_id)
    assert job["status"] == "completed" and job["clips_produced"] >= 2


def test_auto_mode_adapts_to_a_15_minute_video(env, videos):
    storage, queue, work, url = env
    _, job_id = create_job(url, storage, videos["mid"], 10, {"auto": True})
    assert process_one(queue, storage, work, deps={"transcriber": Fake(MID)})
    (job,) = rows(url, "select * from processing_jobs where id = %s", job_id)
    assert job["status"] == "completed" and 2 <= job["clips_produced"] <= 3
    assert job["metrics"]["selection"]["auto"] is True


def test_short_video_is_not_turned_into_ten_clips(env, videos):
    storage, queue, work, url = env
    _, job_id = create_job(url, storage, videos["short"], 10)
    assert process_one(queue, storage, work, deps={"transcriber": Fake(SHORT)})
    (job,) = rows(url, "select * from processing_jobs where id = %s", job_id)
    assert job["status"] == "completed" and 1 <= job["clips_produced"] <= 3
    assert "demandés" in job["metrics"]["selection"]["explanation"]


def test_requesting_more_than_the_plan_allows_is_refused(db_url, tmp_path, videos):
    storage = LocalStorage(tmp_path / "b")
    with pytest.raises(psycopg.Error, match="requested_clips_out_of_range"):
        create_job(db_url, storage, videos["short"], 11)
