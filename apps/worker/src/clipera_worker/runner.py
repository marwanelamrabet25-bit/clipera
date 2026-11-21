"""Boucle du worker : réserve un job, l'exécute avec un battement de cœur, enregistre le résultat."""

from __future__ import annotations

import json
import logging
import shutil
import threading
import time
from collections.abc import Callable
from pathlib import Path

from .errors import JobCancelled, JobError
from .jobs.clip_job import run_clip_job
from .jobs.import_job import run_import_job
from .jobs.probe_job import run_probe_job
from .queue import Job, JobQueue
from .storage import Storage

log = logging.getLogger("clipera.worker")

Handler = Callable[..., dict]

# Seuls les types de job réellement implémentés sont réclamés : aucun job n'est « simulé ».
HANDLERS: dict[str, Handler] = {
    "probe": run_probe_job,
    "clip_generation": run_clip_job,
    "import_url": run_import_job,
}


class Heartbeat(threading.Thread):
    def __init__(self, queue: JobQueue, job: Job, interval: float):
        super().__init__(daemon=True)
        self.queue, self.job, self.interval = queue, job, interval
        self.stop_event = threading.Event()
        self.cancel_requested = threading.Event()

    def run(self):
        while not self.stop_event.wait(self.interval):
            try:
                if self.queue.heartbeat(self.job.id):
                    self.cancel_requested.set()
            except Exception:  # noqa: BLE001 — un battement raté n'arrête pas le job
                log.warning("heartbeat failed", exc_info=True)


def log_event(event: str, **fields):
    log.info(json.dumps({"event": event, **{k: str(v) for k, v in fields.items()}}))


def process_one(queue: JobQueue, storage: Storage, work_root: Path, *, heartbeat_s: float = 20,
                deps: dict | None = None) -> bool:
    """deps : services injectés dans les jobs (ex. transcriber), pour pouvoir les remplacer en test."""
    job = queue.claim(list(HANDLERS))
    if job is None:
        return False
    work = work_root / str(job.id)
    work.mkdir(parents=True, exist_ok=True)
    hb = Heartbeat(queue, job, heartbeat_s)
    hb.start()
    t0 = time.monotonic()
    log_event("job_started", job=job.id, kind=job.kind, attempt=job.attempts)
    try:
        metrics = HANDLERS[job.kind](job, queue=queue, storage=storage, work=work, cancel=hb.cancel_requested,
                                       **(deps or {}))
        metrics["duration_s"] = round(time.monotonic() - t0, 2)
        queue.complete(job.id, metrics=metrics, clips_produced=metrics.get("clips_produced", 0),
                       cost_usd=metrics.get("cost_usd"))
        log_event("job_completed", job=job.id, duration_s=metrics["duration_s"])
    except JobCancelled:
        queue.cancelled(job.id)
        log_event("job_cancelled", job=job.id)
    except JobError as e:
        status = queue.fail(job, code=e.code, message=e.user_message, retryable=e.retryable,
                            metrics={"duration_s": round(time.monotonic() - t0, 2), "detail": e.detail})
        log_event("job_failed", job=job.id, code=e.code, next_status=status, detail=e.detail)
    except Exception as e:  # erreur imprévue : on réessaie, puis échec définitif
        log.exception("unexpected error")
        queue.fail(job, code="internal_error", message="Erreur interne. Notre équipe a été notifiée.",
                   retryable=True, metrics={"detail": repr(e)[:500]})
    finally:
        hb.stop_event.set()
        shutil.rmtree(work, ignore_errors=True)
    return True


def run_forever(queue: JobQueue, storage: Storage, work_root: Path, *, poll_s: float, heartbeat_s: float,
                stop: threading.Event | None = None, deps: dict | None = None):
    stop = stop or threading.Event()
    log_event("worker_started", worker=queue.worker_id, kinds=",".join(HANDLERS))
    last_sweep = 0.0
    while not stop.is_set():
        if time.monotonic() - last_sweep > 60:
            n = queue.execute("select requeue_stale_jobs() as n", ())[0]["n"]
            if n:
                log_event("stale_jobs_requeued", count=n)
            last_sweep = time.monotonic()
        if not process_one(queue, storage, work_root, heartbeat_s=heartbeat_s, deps=deps):
            stop.wait(poll_s)
