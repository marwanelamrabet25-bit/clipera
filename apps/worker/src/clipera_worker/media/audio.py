"""Extraction de l'audio pour la transcription : mono 16 kHz Opus 32 kb/s ≈ 22 Mo par heure (mesuré).

24 kb/s en mode « voip » dégradait la transcription française (mots perdus, mesuré sur Deepgram) : 32 kb/s
en mode standard donne le même résultat que l'audio non compressé."""

from __future__ import annotations

from pathlib import Path

from .ffmpeg import ffmpeg


def extract_speech_audio(src: Path, dst: Path, *, timeout: float = 900) -> Path:
    ffmpeg(
        ["-i", str(src), "-map", "0:a:0", "-vn", "-ac", "1", "-ar", "16000",
         "-c:a", "libopus", "-b:a", "32k", str(dst)],
        timeout=timeout,
        error_code="audio_extraction_failed",
        user_message="Impossible d'extraire le son de la vidéo.",
    )
    return dst
