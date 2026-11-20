"""Point d'entrée : `python -m clipera_worker`."""

from __future__ import annotations

import logging
import signal
import threading

from .config import Settings
from .queue import JobQueue
from .runner import run_forever
from .storage import LocalStorage, R2Storage


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
    s = Settings.from_env()
    s.work_dir.mkdir(parents=True, exist_ok=True)
    if s.storage_backend == "local":
        storage = LocalStorage(s.local_storage_dir)
    else:
        storage = R2Storage(s.r2_account_id, s.r2_access_key_id, s.r2_secret_access_key, s.r2_bucket,
                            endpoint_url=s.s3_endpoint)
    stop = threading.Event()
    signal.signal(signal.SIGTERM, lambda *_: stop.set())
    signal.signal(signal.SIGINT, lambda *_: stop.set())
    run_forever(JobQueue(s.database_url, s.worker_id), storage, s.work_dir,
                poll_s=s.poll_interval_s, heartbeat_s=s.heartbeat_interval_s, stop=stop)


if __name__ == "__main__":
    main()
