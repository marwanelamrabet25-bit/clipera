"""Bout en bout : base Postgres réelle + stockage local + worker. Requiert CLIPERA_TEST_DB_ADMIN_URL."""

import os
import pathlib
import uuid

import psycopg
import pytest
from psycopg.rows import dict_row

from clipera_worker.queue import JobQueue
from clipera_worker.runner import process_one
from clipera_worker.storage import LocalStorage

ROOT = pathlib.Path(__file__).resolve().parents[3]
ADMIN_URL = os.environ.get("CLIPERA_TEST_DB_ADMIN_URL")
DB = "clipera_worker_it"
pytestmark = pytest.mark.skipif(not ADMIN_URL, reason="CLIPERA_TEST_DB_ADMIN_URL non défini")


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


@pytest.fixture
def env(db_url, tmp_path):
    storage = LocalStorage(tmp_path / "bucket")
    queue = JobQueue(db_url, worker_id="test-worker")
    with psycopg.connect(db_url, autocommit=True) as c:  # file vide à chaque test
        c.execute("update processing_jobs set status = 'cancelled' where status = 'queued'")
    return storage, queue, tmp_path / "work", db_url


def upload_and_enqueue(db_url, storage, file: pathlib.Path) -> uuid.UUID:
    uid = uuid.uuid4()
    key = f"sources/{uid}/{uuid.uuid4()}{file.suffix}"
    storage.upload(file, key, "video/mp4")
    with psycopg.connect(db_url, autocommit=True) as c:
        c.execute("insert into auth.users (id) values (%s)", (uid,))
        pid = c.execute("insert into projects (user_id) values (%s) returning id", (uid,)).fetchone()[0]
        vid = c.execute(
            "insert into source_videos (project_id, user_id, storage_key, original_filename, declared_size_bytes,"
            " rights_confirmed_at) values (%s, %s, %s, %s, %s, now()) returning id",
            (pid, uid, key, file.name, file.stat().st_size),
        ).fetchone()[0]
        c.execute("select enqueue_probe_job(%s)", (vid,))
        c.execute("select enqueue_probe_job(%s)", (vid,))  # double appel → un seul job
    return vid


def state(db_url, vid):
    with psycopg.connect(db_url, row_factory=dict_row) as c:
        sv = c.execute("select * from source_videos where id = %s", (vid,)).fetchone()
        jobs = c.execute("select * from processing_jobs where source_video_id = %s", (vid,)).fetchall()
    return sv, jobs


def test_valid_video_is_validated(env, media):
    storage, queue, work, url = env
    vid = upload_and_enqueue(url, storage, media["landscape_1080"])
    assert process_one(queue, storage, work, heartbeat_s=0.2) is True
    sv, jobs = state(url, vid)
    assert len(jobs) == 1
    assert jobs[0]["status"] == "completed" and jobs[0]["kind"] == "probe"
    assert sv["status"] == "validated"
    assert (sv["width"], sv["height"], float(sv["fps"])) == (1920, 1080, 30.0)
    assert 39.9 < float(sv["duration_seconds"]) < 40.1
    assert jobs[0]["metrics"]["duration_s"] >= 0
    assert not (work / str(jobs[0]["id"])).exists()  # fichiers temporaires nettoyés
    assert process_one(queue, storage, work) is False  # file vide


def test_video_without_sound_is_rejected_with_reason(env, media):
    storage, queue, work, url = env
    vid = upload_and_enqueue(url, storage, media["no_audio"])
    process_one(queue, storage, work)
    sv, jobs = state(url, vid)
    assert sv["status"] == "rejected" and "pas de son" in sv["rejection_reason"]
    assert jobs[0]["status"] == "failed" and jobs[0]["error_code"] == "no_audio"


def test_missing_file_fails_cleanly(env, media):
    storage, queue, work, url = env
    vid = upload_and_enqueue(url, storage, media["landscape_720"])
    sv, _ = state(url, vid)
    storage.delete(sv["storage_key"])
    process_one(queue, storage, work)
    _, jobs = state(url, vid)
    assert jobs[0]["status"] == "failed" and jobs[0]["error_code"] == "source_missing"


def test_unexpected_error_is_retried_then_failed(env, media, monkeypatch):
    storage, queue, work, url = env
    vid = upload_and_enqueue(url, storage, media["landscape_720"])

    def boom(*a, **k):
        raise RuntimeError("disk exploded")

    monkeypatch.setitem(__import__("clipera_worker.runner", fromlist=["HANDLERS"]).HANDLERS, "probe", boom)
    process_one(queue, storage, work)
    _, jobs = state(url, vid)
    assert jobs[0]["status"] == "queued" and jobs[0]["error_code"] == "internal_error"
    with psycopg.connect(url, autocommit=True) as c:
        c.execute("update processing_jobs set run_after = now(), attempts = max_attempts - 1 where id = %s",
                  (jobs[0]["id"],))
    process_one(queue, storage, work)
    _, jobs = state(url, vid)
    assert jobs[0]["status"] == "failed"
