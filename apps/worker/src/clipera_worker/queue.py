"""Accès à la file de traitements (table processing_jobs). Toute la logique d'exclusivité est en SQL."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any
from uuid import UUID

import psycopg
from psycopg.rows import dict_row


@dataclass
class Job:
    id: UUID
    kind: str
    user_id: UUID
    project_id: UUID
    source_video_id: UUID
    status: str
    options: dict
    requested_clips: int | None
    attempts: int
    max_attempts: int


class JobQueue:
    def __init__(self, database_url: str, worker_id: str):
        self.url = database_url
        self.worker_id = worker_id

    def _conn(self) -> psycopg.Connection:
        return psycopg.connect(self.url, autocommit=True, row_factory=dict_row)

    def claim(self, kinds: list[str]) -> Job | None:
        with self._conn() as c:
            row = c.execute(
                "select * from claim_next_job(%s, %s::job_kind[])", (self.worker_id, kinds)
            ).fetchone()
        if not row or row["id"] is None:
            return None
        return Job(**{k: row[k] for k in Job.__dataclass_fields__})

    def heartbeat(self, job_id: UUID) -> bool:
        """Retourne True si l'utilisateur a demandé l'annulation."""
        with self._conn() as c:
            return bool(c.execute("select heartbeat_job(%s, %s) as c", (job_id, self.worker_id)).fetchone()["c"])

    def set_status(self, job_id: UUID, status: str, detail: str | None = None) -> None:
        with self._conn() as c:
            c.execute(
                "update processing_jobs set status = %s, status_detail = %s, heartbeat_at = now() "
                "where id = %s and locked_by = %s",
                (status, detail, job_id, self.worker_id),
            )

    def complete(self, job_id: UUID, *, metrics: dict[str, Any], clips_produced: int = 0,
                 cost_usd: float | None = None) -> None:
        with self._conn() as c:
            c.execute(
                "update processing_jobs set status = 'completed', status_detail = null, clips_produced = %s, "
                "metrics = metrics || %s::jsonb, cost_estimate_usd = %s, locked_by = null "
                "where id = %s and locked_by = %s",
                (clips_produced, json.dumps(metrics), cost_usd, job_id, self.worker_id),
            )

    def fail(self, job: Job, *, code: str, message: str, retryable: bool, metrics: dict | None = None) -> str:
        """Échec : nouvelle tentative différée si possible, sinon échec définitif (le trigger SQL rembourse)."""
        final = not retryable or job.attempts >= job.max_attempts
        status = "failed" if final else "queued"
        with self._conn() as c:
            c.execute(
                "update processing_jobs set status = %s, status_detail = %s, error_code = %s, error_message = %s, "
                "metrics = metrics || %s::jsonb, locked_by = null, "
                "run_after = now() + make_interval(secs => 30 * attempts) where id = %s and locked_by = %s",
                (status, message, code, message, json.dumps(metrics or {}), job.id, self.worker_id),
            )
        return status

    def cancelled(self, job_id: UUID) -> None:
        with self._conn() as c:
            c.execute(
                "update processing_jobs set status = 'cancelled', status_detail = 'cancelled by user', "
                "locked_by = null where id = %s and locked_by = %s",
                (job_id, self.worker_id),
            )

    def execute(self, sql: str, params: tuple) -> list[dict]:
        with self._conn() as c:
            cur = c.execute(sql, params)
            return cur.fetchall() if cur.description else []
