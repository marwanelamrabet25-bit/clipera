"""Job « import_url » : télécharge la vidéo YouTube, la dépose dans le stockage, puis lance la vérification."""

from __future__ import annotations

import time
from pathlib import Path
from typing import Protocol

from ..errors import JobCancelled, JobError
from ..media.youtube import VideoMeta, YtDlpDownloader, check_meta
from ..queue import Job, JobQueue
from ..storage import Storage


class Downloader(Protocol):
    def info(self, url: str) -> VideoMeta: ...
    def download(self, url: str, dest_dir: Path, *, max_bytes: int) -> Path: ...


def run_import_job(job: Job, *, queue: JobQueue, storage: Storage, work: Path, cancel=None,
                   downloader: Downloader | None = None, **_) -> dict:
    dl = downloader or YtDlpDownloader()
    url = (job.options or {}).get("url", "")
    rows = queue.execute(
        "select sv.storage_key, sv.status, p.max_video_seconds, p.max_upload_bytes "
        "from source_videos sv cross join lateral effective_plan(sv.user_id) ep "
        "join plans p on p.id = ep.plan_id where sv.id = %s",
        (job.source_video_id,),
    )
    if not rows or rows[0]["status"] != "importing":
        raise JobError("source_not_importing", "Cette vidéo n'est plus en cours d'import.")
    meta_row = rows[0]

    try:
        t0 = time.monotonic()
        meta = dl.info(url)
        check_meta(meta, max_seconds=meta_row["max_video_seconds"])
        if cancel is not None and cancel.is_set():
            raise JobCancelled()
        queue.set_status(job.id, "uploading", "Téléchargement depuis YouTube")
        path = dl.download(url, work, max_bytes=meta_row["max_upload_bytes"])
        size = path.stat().st_size
        if size > meta_row["max_upload_bytes"]:
            raise JobError("file_too_large", "Vidéo trop volumineuse pour ton offre.")
        download_s = round(time.monotonic() - t0, 2)
        storage.upload(path, meta_row["storage_key"], "video/mp4")
    except JobError as e:
        if not e.retryable or job.attempts >= job.max_attempts:
            _reject(queue, job, e.user_message)
        raise

    title = meta.title[:120] or "Vidéo YouTube"
    queue.execute(
        "update source_videos set status = 'uploaded', original_filename = %s, declared_size_bytes = %s, "
        "size_bytes = %s where id = %s",
        (f"{title[:200]}.mp4", size, size, job.source_video_id),
    )
    queue.execute("update projects set title = %s where id = %s", (title, job.project_id))
    queue.execute("select enqueue_probe_job(%s)", (job.source_video_id,))
    return {"youtube_id": meta.id, "duration_s_source": meta.duration_s, "size_bytes": size,
            "download_s": download_s, "channel": meta.channel}


def _reject(queue: JobQueue, job: Job, reason: str) -> None:
    queue.execute(
        "update source_videos set status = 'rejected', rejection_reason = %s where id = %s and status = 'importing'",
        (reason, job.source_video_id),
    )
