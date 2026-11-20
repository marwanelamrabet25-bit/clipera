"""Exécution sûre de FFmpeg / FFprobe : arguments en liste (jamais de shell), timeout, erreurs lisibles."""

from __future__ import annotations

import shutil
import subprocess
from collections.abc import Sequence

from ..errors import JobError

FFMPEG = shutil.which("ffmpeg") or "ffmpeg"
FFPROBE = shutil.which("ffprobe") or "ffprobe"


def run(cmd: Sequence[str], *, timeout: float, error_code: str, user_message: str) -> subprocess.CompletedProcess:
    try:
        proc = subprocess.run(list(cmd), capture_output=True, timeout=timeout, check=False)
    except subprocess.TimeoutExpired as e:
        raise JobError(error_code, user_message, retryable=True, detail=f"timeout after {timeout}s") from e
    if proc.returncode != 0:
        tail = proc.stderr.decode("utf-8", "replace")[-1500:]
        raise JobError(error_code, user_message, detail=f"exit {proc.returncode}: {tail}")
    return proc


def ffmpeg(args: Sequence[str], *, timeout: float, error_code: str, user_message: str):
    return run(
        [FFMPEG, "-hide_banner", "-nostdin", "-loglevel", "error", "-y", *args],
        timeout=timeout,
        error_code=error_code,
        user_message=user_message,
    )
