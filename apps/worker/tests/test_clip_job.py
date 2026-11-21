"""Bout en bout du job clip_generation : vraie base Postgres + stockage local + rendu FFmpeg réel.

La transcription est remplacée par la vraie réponse Deepgram enregistrée (fixture), pour ne rien dépenser.
Requiert CLIPERA_TEST_DB_ADMIN_URL.
"""

import json
import os
import pathlib
import subprocess
import time
import uuid

import psycopg
import pytest
from psycopg.rows import dict_row

from clipera_worker.media.probe import probe
from clipera_worker.queue import JobQueue
from clipera_worker.runner import process_one
from clipera_worker.selection import Transcript
from clipera_worker.storage import LocalStorage
from clipera_worker.transcription import TranscriptionResult, parse_response

ROOT = pathlib.Path(__file__).resolve().parents[3]
ADMIN_URL = os.environ.get("CLIPERA_TEST_DB_ADMIN_URL")
DB = "clipera_clipjob_it"
FIXTURE = json.loads((pathlib.Path(__file__).parent / "fixtures" / "deepgram_fr_dialogue.json").read_text())
pytestmark = pytest.mark.skipif(not ADMIN_URL, reason="CLIPERA_TEST_DB_ADMIN_URL non défini")


class FakeTranscriber:
    def __init__(self, result, on_call=None):
        self.result, self.on_call, self.calls = result, on_call, 0

    def transcribe_file(self, audio, *, language="fr"):
        assert audio.exists() and audio.stat().st_size > 0  # l'audio a bien été extrait
        self.calls += 1
        if self.on_call:
            self.on_call()
        return self.result


REAL = parse_response(FIXTURE, language="fr")
SILENT = TranscriptionResult(Transcript(()), 50.0, "x", "nova-3")


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
    return url


@pytest.fixture(scope="module")
def video(tmp_path_factory):
    d = tmp_path_factory.mktemp("clipjob")
    out = d / "talk.mp4"
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-f", "lavfi", "-i", "testsrc2=size=1280x720:rate=25:duration=50",
                    "-f", "lavfi", "-i", "sine=frequency=220:sample_rate=48000:duration=50",
                    "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac", "-shortest", str(out)], check=True)
    return out


@pytest.fixture
def env(db_url, tmp_path, video):
    storage = LocalStorage(tmp_path / "bucket")
    queue = JobQueue(db_url, worker_id="test-worker")
    with psycopg.connect(db_url, autocommit=True) as c:
        c.execute("update processing_jobs set status = 'cancelled' where status = 'queued'")
    return storage, queue, tmp_path / "work", db_url


def create_job(db_url, storage, video, requested=3, options=None):
    """Utilisateur Free + vidéo validée + job créé par la vraie fonction create_clip_job (quota réservé)."""
    uid = uuid.uuid4()
    with psycopg.connect(db_url, autocommit=True, row_factory=dict_row) as c:
        c.execute("insert into auth.users (id) values (%s)", (uid,))
        pid = c.execute("insert into projects (user_id) values (%s) returning id", (uid,)).fetchone()["id"]
        vid = uuid.uuid4()
        key = f"sources/{uid}/{vid}/source.mp4"
        storage.upload(video, key, "video/mp4")
        c.execute(
            "insert into source_videos (id, project_id, user_id, status, storage_key, original_filename,"
            " declared_size_bytes, duration_seconds, width, height, rights_confirmed_at)"
            " values (%s,%s,%s,'validated',%s,'talk.mp4',%s,50,1280,720,now())",
            (vid, pid, uid, key, video.stat().st_size))
        c.execute("select set_config('request.jwt.claim.sub', %s, false)", (str(uid),))
        job = c.execute("select * from create_clip_job(%s, %s, %s::jsonb, %s)",
                        (vid, requested, json.dumps(options or {}), f"test-{uuid.uuid4()}")).fetchone()
    return uid, job["id"]


def rows(db_url, sql, *params):
    with psycopg.connect(db_url, row_factory=dict_row) as c:
        return c.execute(sql, params).fetchall()


def test_video_becomes_real_clip(env, video):
    storage, queue, work, url = env
    uid, job_id = create_job(url, storage, video)
    tr = FakeTranscriber(REAL)
    assert process_one(queue, storage, work, heartbeat_s=0.2, deps={"transcriber": tr})
    (job,) = rows(url, "select * from processing_jobs where id = %s", job_id)
    assert job["status"] == "completed", job["error_message"]
    assert job["clips_produced"] == 1  # 48 s de dialogue = un seul vrai moment, pas de remplissage
    assert float(job["cost_estimate_usd"]) == pytest.approx(47.6 / 60 * 0.0043, abs=1e-4)
    m = job["metrics"]
    assert m["selection_method"] == "rules-v2" and m["transcription"]["words"] > 100

    steps = [r["to_status"] for r in rows(url, "select to_status from job_events where job_id = %s order by id",
                                          job_id)]
    assert steps == ["queued", "transcribing", "selecting", "rendering", "completed"]

    (clip,) = rows(url, "select * from clips where job_id = %s", job_id)
    assert clip["rank"] == 1 and clip["score_total"] >= 70
    assert clip["storage_key"] == f"clips/{uid}/{job_id}/1.mp4"
    assert (clip["width"], clip["height"]) == (720, 1280)  # offre Free : 720p, jamais agrandi
    assert clip["title"].startswith("Bienvenue") and "La leçon" in clip["transcript_excerpt"]
    assert clip["score_details"]["reasons"]["hook"] and clip["render_options"]["watermark"] is True
    assert clip["render_options"]["framing"]["mode"] == "center"  # mire de test : aucun visage → cadre centré
    assert clip["render_options"]["framing"]["profile"] == "stable"  # mode par défaut

    out = work.parent / "check.mp4"
    storage.download(clip["storage_key"], out)
    info, _ = probe(out)
    assert info.has_audio and (info.width, info.height) == (720, 1280)
    assert info.duration_seconds == pytest.approx(float(clip["end_seconds"]) - float(clip["start_seconds"]), abs=0.15)
    storage.download(clip["thumbnail_key"], work.parent / "thumb.jpg")
    words = json.loads(storage.download(f"clips/{uid}/{job_id}/transcript.json", work.parent / "t.json").read_text())
    assert len(words["words"]) == len(REAL.transcript.words)

    refunds = rows(url, "select * from usage_records where job_id = %s and kind = 'refund'", job_id)
    assert refunds == []  # clip livré → quota consommé
    assert not (work / str(job_id)).exists()


def test_wide_framing_option(env, video):
    storage, queue, work, url = env
    _, job_id = create_job(url, storage, video, options={"framing": "wide"})
    assert process_one(queue, storage, work, deps={"transcriber": FakeTranscriber(REAL)})
    (clip,) = rows(url, "select * from clips where job_id = %s", job_id)
    assert clip["render_options"]["framing"]["profile"] == "wide" and (clip["width"], clip["height"]) == (720, 1280)


def test_format_and_captions_options(env, video):
    storage, queue, work, url = env
    _, job_id = create_job(url, storage, video, options={"format": "1:1", "captions": {"enabled": False}})
    assert process_one(queue, storage, work, deps={"transcriber": FakeTranscriber(REAL)})
    (clip,) = rows(url, "select * from clips where job_id = %s", job_id)
    assert (clip["width"], clip["height"]) == (720, 720)
    assert clip["render_options"]["captions"] is False and clip["render_options"]["format"] == "1:1"


def test_no_speech_fails_honestly_and_refunds(env, video):
    storage, queue, work, url = env
    _, job_id = create_job(url, storage, video)
    assert process_one(queue, storage, work, deps={"transcriber": FakeTranscriber(SILENT)})
    (job,) = rows(url, "select * from processing_jobs where id = %s", job_id)
    assert job["status"] == "failed" and job["error_code"] == "no_good_moment"
    assert "Aucune parole" in job["error_message"]
    assert rows(url, "select * from clips where job_id = %s", job_id) == []
    assert len(rows(url, "select * from usage_records where job_id = %s and kind = 'refund'", job_id)) == 1


def test_cancel_during_processing_refunds_and_leaves_no_clip(env, video):
    storage, queue, work, url = env
    _, job_id = create_job(url, storage, video)

    def user_cancels():
        with psycopg.connect(url, autocommit=True) as c:
            c.execute("update processing_jobs set cancel_requested = true where id = %s", (job_id,))
        time.sleep(0.5)  # le battement de cœur (0,1 s) transmet la demande au worker

    assert process_one(queue, storage, work, heartbeat_s=0.1, deps={"transcriber": FakeTranscriber(REAL, user_cancels)})
    (job,) = rows(url, "select * from processing_jobs where id = %s", job_id)
    assert job["status"] == "cancelled"
    assert rows(url, "select * from clips where job_id = %s", job_id) == []
    assert len(rows(url, "select * from usage_records where job_id = %s and kind = 'refund'", job_id)) == 1


def test_missing_transcription_key_is_retried_later(env, video):
    storage, queue, work, url = env
    _, job_id = create_job(url, storage, video)
    assert process_one(queue, storage, work, deps={})
    (job,) = rows(url, "select * from processing_jobs where id = %s", job_id)
    assert job["status"] == "queued" and job["error_code"] == "transcription_not_configured"
