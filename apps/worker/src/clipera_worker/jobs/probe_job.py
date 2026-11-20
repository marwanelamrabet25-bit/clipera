"""Job « probe » : télécharge la vidéo importée, l'analyse avec FFprobe et la valide (ou la rejette)."""

from __future__ import annotations

import json
from pathlib import Path

from ..errors import JobError
from ..media.probe import probe, validate
from ..queue import Job, JobQueue
from ..storage import Storage


def run_probe_job(job: Job, *, queue: JobQueue, storage: Storage, work: Path, cancel=None) -> dict:
    rows = queue.execute(
        "select sv.storage_key, sv.declared_size_bytes, p.max_video_seconds, p.max_upload_bytes "
        "from source_videos sv cross join lateral effective_plan(sv.user_id) ep "
        "join plans p on p.id = ep.plan_id where sv.id = %s",
        (job.source_video_id,),
    )
    if not rows:
        raise JobError("source_missing", "Vidéo introuvable.")
    meta = rows[0]
    local = work / "source"
    storage.download(meta["storage_key"], local)
    size = local.stat().st_size

    try:
        if size > meta["max_upload_bytes"]:
            raise JobError("file_too_large", "Fichier trop volumineux pour ton offre.")
        info, raw = probe(local)
        validate(info, max_duration_s=meta["max_video_seconds"])
    except JobError as e:
        if not e.retryable:
            queue.execute(
                "update source_videos set status = 'rejected', rejection_reason = %s, size_bytes = %s "
                "where id = %s",
                (e.user_message, size, job.source_video_id),
            )
        raise

    queue.execute(
        "update source_videos set status = 'validated', size_bytes = %s, duration_seconds = %s, width = %s, "
        "height = %s, fps = %s, video_codec = %s, audio_codec = %s, has_audio = %s, probe = %s::jsonb, "
        "rejection_reason = null where id = %s",
        (size, info.duration_seconds, info.width, info.height, info.fps, info.video_codec, info.audio_codec,
         info.has_audio, json.dumps({"info": info.as_dict(), "format": raw.get("format", {})}),
         job.source_video_id),
    )
    return {"probe": info.as_dict()}
