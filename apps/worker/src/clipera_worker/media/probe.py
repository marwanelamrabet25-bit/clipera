"""Analyse technique d'une vidéo (FFprobe) et validation avant tout traitement coûteux."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from fractions import Fraction
from pathlib import Path

from ..errors import JobError
from .ffmpeg import FFPROBE, run

# Codecs que notre FFmpeg décode de façon fiable (vérifié sur le build du worker).
SUPPORTED_VIDEO_CODECS = {"h264", "hevc", "vp8", "vp9", "av1", "mpeg4", "prores", "mjpeg"}
SUPPORTED_CONTAINERS = {"mov", "mp4", "m4a", "3gp", "3g2", "mj2", "matroska", "webm"}
MIN_DURATION_S = 20.0
MIN_SHORT_SIDE = 240
MAX_LONG_SIDE = 4096


@dataclass(frozen=True)
class VideoInfo:
    duration_seconds: float
    size_bytes: int
    container: str
    width: int  # dimensions d'affichage (rotation appliquée)
    height: int
    fps: float
    video_codec: str
    audio_codec: str | None
    has_audio: bool
    rotation: int
    bit_rate: int | None
    # Couleur et qualité de la source (pour adapter le rendu : HDR → SDR, matrice de couleurs, débit).
    pix_fmt: str | None = None
    color_transfer: str | None = None
    color_primaries: str | None = None
    color_space: str | None = None
    video_bit_rate: int | None = None
    audio_sample_rate: int | None = None
    audio_channels: int | None = None

    @property
    def is_hdr(self) -> bool:
        """HDR (iPhone : HLG ; caméras / Android : PQ) → doit être converti en SDR pour les réseaux sociaux."""
        return self.color_transfer in ("arib-std-b67", "smpte2084")

    @property
    def bit_depth(self) -> int:
        return 10 if self.pix_fmt and ("10" in self.pix_fmt or "12" in self.pix_fmt) else 8

    def as_dict(self) -> dict:
        return {**asdict(self), "is_hdr": self.is_hdr, "bit_depth": self.bit_depth}


def _fps(stream: dict) -> float:
    for key in ("avg_frame_rate", "r_frame_rate"):
        val = stream.get(key) or "0/0"
        try:
            f = Fraction(val)
        except (ValueError, ZeroDivisionError):
            continue
        if f > 0:
            return round(float(f), 3)
    return 0.0


def _rotation(stream: dict) -> int:
    for sd in stream.get("side_data_list", []) or []:
        if "rotation" in sd:
            return int(sd["rotation"]) % 360
    tag = (stream.get("tags") or {}).get("rotate")
    return int(tag) % 360 if tag else 0


def probe(path: Path, *, timeout: float = 60) -> tuple[VideoInfo, dict]:
    """Retourne (infos normalisées, sortie brute ffprobe). Lève JobError si le fichier est illisible."""
    proc = run(
        [FFPROBE, "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(path)],
        timeout=timeout,
        error_code="unreadable_file",
        user_message="Ce fichier n'a pas pu être lu. Vérifie qu'il s'agit bien d'une vidéo (MP4, MOV…).",
    )
    raw = json.loads(proc.stdout or b"{}")
    fmt = raw.get("format") or {}
    streams = raw.get("streams") or []
    video = next(
        (s for s in streams if s.get("codec_type") == "video"
         and not (s.get("disposition") or {}).get("attached_pic")),
        None,
    )
    audio = next((s for s in streams if s.get("codec_type") == "audio"), None)
    if video is None:
        raise JobError("no_video_stream", "Ce fichier ne contient pas de piste vidéo.")

    rotation = _rotation(video)
    w, h = int(video.get("width") or 0), int(video.get("height") or 0)
    if rotation in (90, 270):
        w, h = h, w
    duration = float(fmt.get("duration") or video.get("duration") or 0)
    info = VideoInfo(
        duration_seconds=round(duration, 3),
        size_bytes=int(fmt.get("size") or path.stat().st_size),
        container=str(fmt.get("format_name") or ""),
        width=w,
        height=h,
        fps=_fps(video),
        video_codec=str(video.get("codec_name") or ""),
        audio_codec=audio.get("codec_name") if audio else None,
        has_audio=audio is not None,
        rotation=rotation,
        bit_rate=int(fmt["bit_rate"]) if fmt.get("bit_rate") else None,
        pix_fmt=video.get("pix_fmt"),
        color_transfer=video.get("color_transfer"),
        color_primaries=video.get("color_primaries"),
        color_space=video.get("color_space"),
        video_bit_rate=int(video["bit_rate"]) if str(video.get("bit_rate") or "").isdigit() else None,
        audio_sample_rate=int(audio["sample_rate"]) if audio and str(audio.get("sample_rate") or "").isdigit()
        else None,
        audio_channels=int(audio["channels"]) if audio and audio.get("channels") else None,
    )
    return info, raw


def validate(info: VideoInfo, *, max_duration_s: float) -> None:
    """Règles métier. Les messages sont destinés à l'utilisateur."""
    if not set(info.container.split(",")) & SUPPORTED_CONTAINERS:
        raise JobError("unsupported_container", "Format de fichier non pris en charge. Utilise MP4 ou MOV.")
    if info.video_codec not in SUPPORTED_VIDEO_CODECS:
        raise JobError("unsupported_codec", f"Codec vidéo « {info.video_codec} » non pris en charge.")
    if not info.has_audio:
        raise JobError("no_audio", "Cette vidéo n'a pas de son : Clipera a besoin de la parole pour trouver les "
                       "meilleurs passages.")
    if info.duration_seconds < MIN_DURATION_S:
        raise JobError("too_short", "Vidéo trop courte (minimum 20 secondes).")
    if info.duration_seconds > max_duration_s:
        raise JobError("too_long", f"Vidéo trop longue pour ton offre (maximum {int(max_duration_s // 60)} min).")
    if min(info.width, info.height) < MIN_SHORT_SIDE:
        raise JobError("resolution_too_low", "Résolution trop faible (minimum 240p).")
    if max(info.width, info.height) > MAX_LONG_SIDE:
        raise JobError("resolution_too_high", "Résolution trop élevée (maximum 4K).")
    if info.fps <= 0 or info.fps > 120:
        raise JobError("invalid_framerate", "Fréquence d'images invalide.")
