"""Lien YouTube : refusé par le worker SANS aucun téléchargement (règles de YouTube, voir docs/IMPORT_YOUTUBE.md).

Protège contre un ancien job encore en file ou un appel direct à la base : la vidéo est refusée avec un message
clair qui oriente vers YouTube Studio, aucune requête réseau n'est faite, aucune nouvelle tentative n'est prévue.
Requiert CLIPERA_TEST_DB_ADMIN_URL.
"""

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
DB = "clipera_import_it"
URL = "https://www.youtube.com/watch?v=aqz-KE-bpKQ"


def test_no_youtube_download_library_installed():
    import importlib.util

    assert importlib.util.find_spec("yt_dlp") is None


# ───────────── Bout en bout (vraie base + stockage local) ─────────────

needs_db = pytest.mark.skipif(not ADMIN_URL, reason="CLIPERA_TEST_DB_ADMIN_URL non défini")


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


def import_link(db_url):
    uid = uuid.uuid4()
    with psycopg.connect(db_url, autocommit=True) as c:
        c.execute("update processing_jobs set status = 'cancelled' where status = 'queued'")
        c.execute("insert into auth.users (id) values (%s)", (uid,))
        c.execute("select set_config('request.jwt.claim.sub', %s, false)", (str(uid),))
        vid = c.execute("select source_video_id from create_url_import(%s, true)", (URL,)).fetchone()[0]
    return uid, vid


def state(db_url, vid):
    with psycopg.connect(db_url, row_factory=dict_row) as c:
        sv = c.execute("select * from source_videos where id = %s", (vid,)).fetchone()
        pr = c.execute("select * from projects where id = %s", (sv["project_id"],)).fetchone()
        jobs = c.execute("select * from processing_jobs where source_video_id = %s order by created_at",
                         (vid,)).fetchall()
    return sv, pr, jobs


class NoNetworkCloud:
    """Échoue si le worker tente le moindre téléchargement."""

    def fetch(self, *a, **k):
        raise AssertionError("aucun téléchargement ne doit avoir lieu pour YouTube")


@needs_db
def test_youtube_link_refused_without_download(db_url, tmp_path):
    storage, queue = LocalStorage(tmp_path / "bucket"), JobQueue(db_url, "w")
    _, vid = import_link(db_url)
    assert process_one(queue, storage, tmp_path / "work", deps={"cloud": NoNetworkCloud()})
    sv, _, jobs = state(db_url, vid)
    got = [(j["kind"], j["status"], j["error_code"]) for j in jobs]
    assert got == [("import_url", "failed", "youtube_not_supported")]
    assert sv["status"] == "rejected" and "YouTube Studio" in sv["rejection_reason"]
    assert not (tmp_path / "bucket").exists() or not any((tmp_path / "bucket").rglob("*"))
