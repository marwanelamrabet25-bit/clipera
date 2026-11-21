"""Job « import_url » : récupère la vidéo (Google Drive, Dropbox ou YouTube), la dépose dans le stockage,
puis lance la vérification habituelle (format, durée, son)."""

from __future__ import annotations

import re
import time
from pathlib import Path
from typing import Protocol

from ..errors import JobCancelled, JobError
from ..media.cloud import CloudDownloader
from ..media.youtube import VideoMeta, YtDlpDownloader, check_meta
from ..queue import Job, JobQueue
from ..storage import Storage

VIDEO_EXT = re.compile(r"\.(mp4|mov|m4v|mkv|webm|avi)$", re.I)


class Downloader(Protocol):
    def info(self, url: str) -> VideoMeta: ...
    def download(self, url: str, dest_dir: Path, *, max_bytes: int) -> Path: ...


def run_import_job(job: Job, *, queue: JobQueue, storage: Storage, work: Path, cancel=None,
                   downloader: Downloader | None = None, cloud: CloudDownloader | None = None, **_) -> dict:
    opts = job.options or {}
    url, provider = opts.get("url", ""), opts.get("provider", "youtube")
    rows = queue.execute(
        "select sv.storage_key, sv.status, p.max_video_seconds, p.max_upload_bytes "
        "from source_videos sv cross join lateral effective_plan(sv.user_id) ep "
        "join plans p on p.id = ep.plan_id where sv.id = %s",
        (job.source_video_id,),
    )
    if not rows or rows[0]["status"] != "importing":
        raise JobError("source_not_importing", "Cette vidéo n'est plus en cours d'import.")
    row = rows[0]

    t0 = time.monotonic()
    metrics: dict = {"provider": provider}
    try:
        if provider == "youtube":
            dl = downloader or YtDlpDownloader()
            meta = dl.info(url)
            check_meta(meta, max_seconds=row["max_video_seconds"])
            if cancel is not None and cancel.is_set():
                raise JobCancelled()
            queue.set_status(job.id, "uploading", "Téléchargement depuis YouTube")
            path = dl.download(url, work, max_bytes=row["max_upload_bytes"])
            title = meta.title
            metrics.update(youtube_id=meta.id, duration_s_source=meta.duration_s, channel=meta.channel)
        elif provider in ("gdrive", "dropbox"):
            queue.set_status(job.id, "uploading",
                             "Téléchargement depuis " + ("Google Drive" if provider == "gdrive" else "Dropbox"))
            got = (cloud or CloudDownloader()).fetch(provider, url, work, max_bytes=row["max_upload_bytes"])
            path = got.path
            title = VIDEO_EXT.sub("", got.filename or "") or ("Vidéo Google Drive" if provider == "gdrive"
                                                               else "Vidéo Dropbox")
        else:
            raise JobError("invalid_url", "Fournisseur non pris en charge.")
        size = path.stat().st_size
        if size > row["max_upload_bytes"]:
            raise JobError("file_too_large", "Vidéo trop volumineuse pour ton offre.")
        metrics.update(size_bytes=size, download_s=round(time.monotonic() - t0, 2))
        if cancel is not None and cancel.is_set():
            raise JobCancelled()
        storage.upload(path, row["storage_key"], "video/mp4")
    except JobError as e:
        if not e.retryable or job.attempts >= job.max_attempts:
            _reject(queue, job, e.user_message)
        raise

    title = (title or "Vidéo importée").strip()[:120]
    queue.execute(
        "update source_videos set status = 'uploaded', original_filename = %s, declared_size_bytes = %s, "
        "size_bytes = %s where id = %s",
        (f"{title[:200]}.mp4", size, size, job.source_video_id),
    )
    queue.execute("update projects set title = %s where id = %s", (title, job.project_id))
    # La vérification (ffprobe) contrôle ensuite le vrai format, la durée maximale de l'offre et le son.
    queue.execute("select enqueue_probe_job(%s)", (job.source_video_id,))
    return metrics


def _reject(queue: JobQueue, job: Job, reason: str) -> None:
    queue.execute(
        "update source_videos set status = 'rejected', rejection_reason = %s where id = %s and status = 'importing'",
        (reason, job.source_video_id),
    )
