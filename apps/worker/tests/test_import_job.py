"""Import par lien YouTube : contrôles avant téléchargement, erreurs claires, enchaînement avec la vérification.

Le téléchargement réel (yt-dlp) est remplacé par un faux qui fournit une vraie vidéo générée par FFmpeg :
le test réel contre YouTube se fait sur le serveur (YouTube n'est pas joignable depuis l'environnement de test).
Requiert CLIPERA_TEST_DB_ADMIN_URL pour les tests de bout en bout.
"""

import os
import pathlib
import shutil
import subprocess
import uuid

import psycopg
import pytest
from psycopg.rows import dict_row

from clipera_worker.errors import JobError
from clipera_worker.media.youtube import URL_RE, VideoMeta, check_meta, classify_error
from clipera_worker.queue import JobQueue
from clipera_worker.runner import process_one
from clipera_worker.storage import LocalStorage

ROOT = pathlib.Path(__file__).resolve().parents[3]
ADMIN_URL = os.environ.get("CLIPERA_TEST_DB_ADMIN_URL")
DB = "clipera_import_it"
URL = "https://www.youtube.com/watch?v=aqz-KE-bpKQ"


# ───────────── Contrôles et messages (sans base) ─────────────


@pytest.mark.parametrize(
    "message,code,retryable",
    [
        ("ERROR: [youtube] x: Sign in to confirm you're not a bot. Use --cookies", "youtube_blocked", True),
        ("ERROR: [youtube] x: Private video. Sign in if you've been granted access", "youtube_private", False),
        ("ERROR: [youtube] x: Join this channel to get access to members-only content", "youtube_members_only", False),
        ("ERROR: [youtube] x: Sign in to confirm your age. This video may be inappropriate", "youtube_age_restricted",
         False),
        ("ERROR: [youtube] x: Video unavailable. This video has been removed by the uploader", "youtube_unavailable",
         False),
        ("ERROR: [youtube] x: The uploader has not made this video available in your country", "youtube_geo_blocked",
         False),
        ("ERROR: HTTP Error 429: Too Many Requests", "youtube_blocked", True),
        ("ERROR: something new and unexpected", "youtube_download_failed", True),
    ],
)
def test_youtube_errors_become_clear_messages(message, code, retryable):
    e = classify_error(message)
    assert (e.code, e.retryable) == (code, retryable)
    assert "ERROR" not in e.user_message and e.user_message.endswith(".")


@pytest.mark.parametrize(
    "meta,code",
    [
        (VideoMeta("x", "t", 3600, False, None), "video_too_long"),
        (VideoMeta("x", "t", 10, False, None), "video_too_short"),
        (VideoMeta("x", "t", None, True, None), "youtube_live"),
        (VideoMeta("x", "t", None, False, None), "youtube_unknown_duration"),
    ],
)
def test_checks_before_download(meta, code):
    with pytest.raises(JobError) as e:
        check_meta(meta, max_seconds=900)
    assert e.value.code == code


def test_too_long_message_gives_limit():
    with pytest.raises(JobError) as e:
        check_meta(VideoMeta("x", "t", 3600, False, None), max_seconds=900)
    assert "60 min" in e.value.user_message and "15 min" in e.value.user_message


def test_only_canonical_urls_reach_the_downloader():
    assert URL_RE.match(URL)
    for bad in ("https://youtu.be/aqz-KE-bpKQ", URL + "&list=x", "https://evil.com/watch?v=aqz-KE-bpKQ"):
        assert not URL_RE.match(bad)


# ───────────── Bout en bout (vraie base + stockage local) ─────────────

needs_db = pytest.mark.skipif(not ADMIN_URL, reason="CLIPERA_TEST_DB_ADMIN_URL non défini")


class FakeDownloader:
    def __init__(self, video: pathlib.Path, meta: VideoMeta, fail_with: str | None = None):
        self.video, self.meta, self.fail_with = video, meta, fail_with
        self.downloads = 0

    def info(self, url):
        assert URL_RE.match(url)
        if self.fail_with:
            raise classify_error(self.fail_with)
        return self.meta

    def download(self, url, dest_dir, *, max_bytes):
        self.downloads += 1
        out = dest_dir / "download.mp4"
        shutil.copy(self.video, out)
        return out


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
    out = tmp_path_factory.mktemp("yt") / "v.mp4"
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-f", "lavfi", "-i", "testsrc2=size=1280x720:rate=30:duration=30",
                    "-f", "lavfi", "-i", "sine=frequency=300:sample_rate=48000:duration=30",
                    "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac", "-shortest", str(out)], check=True)
    return out


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


@needs_db
def test_link_import_then_probe_validates_video(db_url, video, tmp_path):
    storage, queue = LocalStorage(tmp_path / "bucket"), JobQueue(db_url, "w")
    uid, vid = import_link(db_url)
    fake = FakeDownloader(video, VideoMeta("aqz-KE-bpKQ", "Mon podcast épisode 12", 30, False, "Ma chaîne"))
    assert process_one(queue, storage, tmp_path / "work", deps={"downloader": fake})
    sv, pr, jobs = state(db_url, vid)
    assert [(j["kind"], j["status"]) for j in jobs] == [("import_url", "completed"), ("probe", "queued")]
    assert sv["status"] == "uploaded" and sv["size_bytes"] == video.stat().st_size
    assert pr["title"] == "Mon podcast épisode 12"
    assert (tmp_path / "bucket" / sv["storage_key"]).exists()

    assert process_one(queue, storage, tmp_path / "work")  # la vérification habituelle enchaîne
    sv, _, jobs = state(db_url, vid)
    assert sv["status"] == "validated" and (sv["width"], sv["height"]) == (1280, 720)


@needs_db
def test_too_long_refused_without_downloading(db_url, video, tmp_path):
    storage, queue = LocalStorage(tmp_path / "bucket"), JobQueue(db_url, "w")
    _, vid = import_link(db_url)
    fake = FakeDownloader(video, VideoMeta("x", "Long", 5 * 3600, False, None))
    process_one(queue, storage, tmp_path / "work", deps={"downloader": fake})
    sv, _, jobs = state(db_url, vid)
    assert fake.downloads == 0
    assert jobs[0]["status"] == "failed" and jobs[0]["error_code"] == "video_too_long"
    assert sv["status"] == "rejected" and "trop longue" in sv["rejection_reason"]


@needs_db
def test_private_video_rejected_with_clear_reason(db_url, video, tmp_path):
    storage, queue = LocalStorage(tmp_path / "bucket"), JobQueue(db_url, "w")
    _, vid = import_link(db_url)
    fake = FakeDownloader(video, None, fail_with="ERROR: [youtube] x: Private video. Sign in")
    process_one(queue, storage, tmp_path / "work", deps={"downloader": fake})
    sv, _, jobs = state(db_url, vid)
    assert jobs[0]["status"] == "failed" and sv["status"] == "rejected"
    assert sv["rejection_reason"] == "Cette vidéo est privée : elle ne peut pas être importée."


@needs_db
def test_youtube_block_retried_once_then_explained(db_url, video, tmp_path):
    storage, queue = LocalStorage(tmp_path / "bucket"), JobQueue(db_url, "w")
    _, vid = import_link(db_url)
    fake = FakeDownloader(video, None, fail_with="Sign in to confirm you're not a bot")
    process_one(queue, storage, tmp_path / "work", deps={"downloader": fake})
    sv, _, jobs = state(db_url, vid)
    assert jobs[0]["status"] == "queued" and sv["status"] == "importing"  # 2e tentative prévue
    with psycopg.connect(db_url, autocommit=True) as c:
        c.execute("update processing_jobs set run_after = now() where id = %s", (jobs[0]["id"],))
    process_one(queue, storage, tmp_path / "work", deps={"downloader": fake})
    sv, _, jobs = state(db_url, vid)
    assert jobs[0]["status"] == "failed" and sv["status"] == "rejected"
    assert "importe le fichier vidéo directement" in sv["rejection_reason"]
