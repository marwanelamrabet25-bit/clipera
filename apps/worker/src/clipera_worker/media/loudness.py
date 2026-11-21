"""Énergie de la voix : niveau sonore toutes les 100 ms, pour repérer les passages animés (rires, montées de ton).

Calculé sur l'audio déjà extrait pour la transcription (aucun coût supplémentaire).
"""

from __future__ import annotations

import subprocess
from pathlib import Path

import numpy as np

RATE = 8000
STEP_S = 0.1
SILENCE_DB = -45.0


def loudness_series(audio: Path, *, timeout: float = 600) -> np.ndarray:
    """Niveau en dB (RMS) par tranche de 100 ms."""
    raw = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(audio), "-ac", "1", "-ar", str(RATE),
         "-f", "s16le", "-"], capture_output=True, check=True, timeout=timeout).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0
    n = int(RATE * STEP_S)
    frames = x[: len(x) // n * n].reshape(-1, n)
    rms = np.sqrt((frames ** 2).mean(axis=1) + 1e-12)
    return 20 * np.log10(rms)


class Energy:
    """Énergie d'un passage comparée au reste de la vidéo (en dB au-dessus ou en dessous de la médiane)."""

    def __init__(self, series: np.ndarray):
        self.series = series
        speech = series[series > SILENCE_DB]
        self.median = float(np.median(speech)) if len(speech) else SILENCE_DB
        self.spread = float(np.percentile(speech, 90) - np.percentile(speech, 50)) if len(speech) > 10 else 0.0

    def relative(self, start: float, end: float) -> float:
        a, b = int(start / STEP_S), max(int(start / STEP_S) + 1, int(end / STEP_S))
        seg = self.series[a:b]
        seg = seg[seg > SILENCE_DB]
        if len(seg) < 5 or self.spread <= 0:
            return 0.0
        # Moyenne des 30 % de tranches les plus fortes : les temps forts comptent plus que la moyenne brute.
        top = np.sort(seg)[-max(1, len(seg) * 3 // 10):]
        return float((top.mean() - self.median) / self.spread)
