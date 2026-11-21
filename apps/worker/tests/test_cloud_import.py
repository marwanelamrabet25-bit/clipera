"""Import Google Drive / Dropbox : liens, redirections sûres, pages d'erreur, taille, puis enchaînement complet.

Le réseau est simulé (Drive et Dropbox ne sont pas joignables depuis l'environnement de test) en reproduisant
leurs vraies réponses : redirections vers les serveurs de contenu, page HTML si le fichier n'est pas partagé.
"""

import os
import pathlib
import subprocess
import uuid

import psycopg
import pytest
from psycopg.rows import dict_row

from clipera_worker.errors import JobError
from clipera_worker.media.cloud import CloudDownloader, download_url, host_allowed
from clipera_worker.queue import JobQueue
from clipera_worker.runner import process_one
from clipera_worker.storage import LocalStorage

DRIVE = "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345"
DRIVE_DL = "https://drive.usercontent.google.com/download?id=1AbCdEfGhIjKlMnOpQrStUvWxYz012345&export=download&confirm=t"
DROPBOX = "https://www.dropbox.com/scl/fi/abc123xyz/podcast%20episode.mp4?rlkey=k9k9k9"


class Resp:
    def __init__(self, status=200, headers=None, body=b""):
        self.status_code, self.headers, self.body = status, headers or {}, body

    def iter_content(self, n):
        for i in range(0, len(self.body), n):
            yield self.body[i:i + n]

    def close(self):
        pass

    def __enter__(self):
        return self

    def __exit__(self, *a):
        pass


class FakeSession:
    def __init__(self, routes):
        self.routes, self.headers, self.calls = routes, {}, []

    def get(self, url, **kw):
        assert kw["allow_redirects"] is False and kw["stream"] is True
        self.calls.append(url)
        r = self.routes.get(url)
        if isinstance(r, Exception):
            raise r
        return r or Resp(404)

    def __enter__(self):
        return self

    def __exit__(self, *a):
        pass


def downloader(routes):
    s = FakeSession(routes)
    return CloudDownloader(session_factory=lambda: s), s


VIDEO = b"\x00\x00\x00\x18ftypmp42" + b"x" * 5000
MP4 = {"Content-Type": "video/mp4", "Content-Length": str(len(VIDEO))}


def test_download_urls():
    assert download_url("gdrive", DRIVE) == DRIVE_DL
    assert download_url("dropbox", DROPBOX) == DROPBOX + "&dl=1"
    assert download_url("dropbox", "https://www.dropbox.com/s/abc/v.mp4") == "https://www.dropbox.com/s/abc/v.mp4?dl=1"
    with pytest.raises(JobError):
        download_url("gdrive", "https://evil.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345")


def test_only_google_and_dropbox_hosts_allowed():
    for ok in (DRIVE_DL, "https://doc-0s-5g-docs.googleusercontent.com/x", "https://uc123.dl.dropboxusercontent.com/cd/0/x"):
        assert host_allowed(ok)
    for bad in ("http://drive.google.com/x", "https://evil.com/", "https://169.254.169.254/latest/meta-data",
                "https://googleusercontent.com.evil.com/", "https://localhost:5432/", "https://dropbox.com@evil.com/"):
        assert not host_allowed(bad)


def test_drive_follows_redirect_and_keeps_filename(tmp_path):
    content = "https://doc-0k-9s-docs.googleusercontent.com/docs/securesc/abc"
    dl, s = downloader({
        DRIVE_DL: Resp(303, {"Location": content}),
        content: Resp(200, {**MP4, "Content-Disposition": "attachment; filename*=UTF-8''%C3%89pisode%2012.mp4"},
                      VIDEO),
    })
    got = dl.fetch("gdrive", DRIVE, tmp_path, max_bytes=10_000)
    assert got.path.read_bytes() == VIDEO and got.size == len(VIDEO)
    assert got.filename == "Épisode 12.mp4"
    assert s.calls == [DRIVE_DL, content]


def test_dropbox_direct_download(tmp_path):
    cdn = "https://uc8f.dl.dropboxusercontent.com/cd/0/inline/abc"
    dl, _ = downloader({DROPBOX + "&dl=1": Resp(302, {"Location": cdn}),
                        cdn: Resp(200, {**MP4, "Content-Disposition": 'attachment; filename="podcast episode.mp4"'},
                                  VIDEO)})
    assert dl.fetch("dropbox", DROPBOX, tmp_path, max_bytes=10_000).filename == "podcast episode.mp4"


def test_unshared_drive_file_explains_how_to_share(tmp_path):
    # Google renvoie une page de connexion HTML quand le fichier n'est pas public.
    dl, _ = downloader({DRIVE_DL: Resp(302, {"Location": "https://accounts.google.com/ServiceLogin?x"})})
    with pytest.raises(JobError) as e:
        dl.fetch("gdrive", DRIVE, tmp_path, max_bytes=10_000)
    assert e.value.code == "cloud_not_shared" and "Tous les utilisateurs disposant du lien" in e.value.user_message

    dl, _ = downloader({DRIVE_DL: Resp(200, {"Content-Type": "text/html; charset=utf-8"}, b"<html>")})
    with pytest.raises(JobError) as e:
        dl.fetch("gdrive", DRIVE, tmp_path, max_bytes=10_000)
    assert e.value.code == "cloud_not_shared" and not e.value.retryable


def test_redirect_to_other_server_is_never_followed(tmp_path):
    dl, s = downloader({DRIVE_DL: Resp(302, {"Location": "https://169.254.169.254/latest/meta-data"})})
    with pytest.raises(JobError) as e:
        dl.fetch("gdrive", DRIVE, tmp_path, max_bytes=10_000)
    assert e.value.code == "cloud_bad_redirect" and s.calls == [DRIVE_DL]


def test_size_limit_announced_and_while_streaming(tmp_path):
    dl, _ = downloader({DRIVE_DL: Resp(200, {**MP4, "Content-Length": "999999"}, VIDEO)})
    with pytest.raises(JobError, match="file_too_large"):
        dl.fetch("gdrive", DRIVE, tmp_path, max_bytes=10_000)
    dl, _ = downloader({DRIVE_DL: Resp(200, {"Content-Type": "video/mp4"}, VIDEO * 3)})  # taille non annoncée
    with pytest.raises(JobError, match="file_too_large"):
        dl.fetch("gdrive", DRIVE, tmp_path, max_bytes=10_000)


@pytest.mark.parametrize("resp,code,retryable", [
    (Resp(404), "cloud_not_shared", False),
    (Resp(429), "cloud_rate_limited", True),
    (Resp(503), "cloud_unavailable", True),
    (__import__("requests").ConnectionError("reset"), "cloud_unavailable", True),
])
def test_http_errors(tmp_path, resp, code, retryable):
    dl, _ = downloader({DRIVE_DL: resp})
    with pytest.raises(JobError) as e:
        dl.fetch("gdrive", DRIVE, tmp_path, max_bytes=10_000)
    assert (e.value.code, e.value.retryable) == (code, retryable)


# ───────────── Bout en bout : lien Drive → stockage → vérification ─────────────

ADMIN_URL = os.environ.get("CLIPERA_TEST_DB_ADMIN_URL")
ROOT = pathlib.Path(__file__).resolve().parents[3]
DB = "clipera_cloud_it"


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


@pytest.mark.skipif(not ADMIN_URL, reason="CLIPERA_TEST_DB_ADMIN_URL non défini")
def test_drive_link_to_validated_video(db_url, tmp_path):
    video = tmp_path / "v.mov"
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-f", "lavfi", "-i", "testsrc2=size=1920x1080:rate=30:duration=25",
                    "-f", "lavfi", "-i", "sine=frequency=300:sample_rate=48000:duration=25",
                    "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac", "-shortest", str(video)], check=True)
    content = "https://doc-1.googleusercontent.com/x"
    cloud, _ = downloader({DRIVE_DL: Resp(303, {"Location": content}),
                           content: Resp(200, {"Content-Type": "video/quicktime",
                                               "Content-Disposition": 'attachment; filename="Interview Paul.mov"'},
                                         video.read_bytes())})
    uid = uuid.uuid4()
    with psycopg.connect(db_url, autocommit=True) as c:
        c.execute("insert into auth.users (id) values (%s)", (uid,))
        c.execute("select set_config('request.jwt.claim.sub', %s, false)", (str(uid),))
        vid = c.execute("select source_video_id from create_url_import(%s, true)",
                        ("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345/view?usp=sharing",)
                        ).fetchone()[0]
    storage, queue = LocalStorage(tmp_path / "bucket"), JobQueue(db_url, "w")
    assert process_one(queue, storage, tmp_path / "work", deps={"cloud": cloud})  # import
    assert process_one(queue, storage, tmp_path / "work")  # vérification
    with psycopg.connect(db_url, row_factory=dict_row) as c:
        sv = c.execute("select * from source_videos where id = %s", (vid,)).fetchone()
        pr = c.execute("select title from projects where id = %s", (sv["project_id"],)).fetchone()
        jobs = c.execute("select kind, status, metrics from processing_jobs where source_video_id = %s "
                         "order by created_at", (vid,)).fetchall()
    assert [(j["kind"], j["status"]) for j in jobs] == [("import_url", "completed"), ("probe", "completed")]
    assert jobs[0]["metrics"]["provider"] == "gdrive"
    assert sv["status"] == "validated" and (sv["width"], sv["height"]) == (1920, 1080)
    assert pr["title"] == "Interview Paul"
