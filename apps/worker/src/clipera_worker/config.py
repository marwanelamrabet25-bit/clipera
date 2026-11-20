"""Configuration du worker, lue uniquement depuis les variables d'environnement (jamais de secret dans le code)."""

from __future__ import annotations

import os
import socket
import uuid
from dataclasses import dataclass
from pathlib import Path


def _req(name: str) -> str:
    val = os.environ.get(name)
    if not val:
        raise RuntimeError(f"Variable d'environnement manquante : {name} (voir docs/ENVIRONMENT.md)")
    return val


@dataclass(frozen=True)
class Settings:
    database_url: str
    storage_backend: str  # "r2" | "local"
    work_dir: Path
    worker_id: str
    poll_interval_s: float
    heartbeat_interval_s: float
    s3_endpoint: str | None
    r2_account_id: str | None
    r2_access_key_id: str | None
    r2_secret_access_key: str | None
    r2_bucket: str | None
    local_storage_dir: Path | None
    max_free_video_seconds: int

    @staticmethod
    def from_env() -> Settings:
        backend = os.environ.get("CLIPERA_STORAGE_BACKEND", "r2")
        return Settings(
            database_url=_req("CLIPERA_DATABASE_URL"),
            storage_backend=backend,
            work_dir=Path(os.environ.get("CLIPERA_WORK_DIR", "/tmp/clipera-work")),
            worker_id=os.environ.get("CLIPERA_WORKER_ID") or f"{socket.gethostname()}-{uuid.uuid4().hex[:6]}",
            poll_interval_s=float(os.environ.get("CLIPERA_POLL_INTERVAL_S", "2")),
            heartbeat_interval_s=float(os.environ.get("CLIPERA_HEARTBEAT_INTERVAL_S", "20")),
            s3_endpoint=os.environ.get("S3_ENDPOINT") or None,
            r2_account_id=(os.environ.get("R2_ACCOUNT_ID") if os.environ.get("S3_ENDPOINT") else _req("R2_ACCOUNT_ID"))
            if backend == "r2" else None,
            r2_access_key_id=_req("R2_ACCESS_KEY_ID") if backend == "r2" else None,
            r2_secret_access_key=_req("R2_SECRET_ACCESS_KEY") if backend == "r2" else None,
            r2_bucket=_req("R2_BUCKET") if backend == "r2" else None,
            local_storage_dir=Path(_req("CLIPERA_LOCAL_STORAGE_DIR")) if backend == "local" else None,
            max_free_video_seconds=int(os.environ.get("CLIPERA_MAX_VIDEO_SECONDS", str(3 * 3600))),
        )
