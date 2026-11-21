"""Téléchargement d'une vidéo YouTube (yt-dlp) avec contrôles AVANT téléchargement et erreurs claires.

Le lien est déjà validé et normalisé par la base (create_url_import) : seul https://www.youtube.com/watch?v=<id>
arrive ici. On lit d'abord les métadonnées (durée, direct, disponibilité) pour refuser sans rien télécharger.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ..errors import JobError

URL_RE = re.compile(r"^https://www\.youtube\.com/watch\?v=[A-Za-z0-9_-]{11}$")
MAX_HEIGHT = 1080  # au-delà, inutile pour des clips (et plus lourd à traiter)

# Messages de yt-dlp → (code, message utilisateur, nouvelle tentative utile ?)
_ERRORS: list[tuple[re.Pattern, str, str, bool]] = [
    (re.compile(r"not a bot|429|too many requests|rate.limit", re.I), "youtube_blocked",
     "YouTube refuse temporairement le téléchargement depuis nos serveurs. Réessaie plus tard, ou importe le "
     "fichier vidéo directement.", True),
    (re.compile(r"private video", re.I), "youtube_private",
     "Cette vidéo est privée : elle ne peut pas être importée.", False),
    (re.compile(r"members.only|join this channel", re.I), "youtube_members_only",
     "Cette vidéo est réservée aux membres de la chaîne : elle ne peut pas être importée.", False),
    (re.compile(r"age.restricted|confirm your age|inappropriate for some users", re.I), "youtube_age_restricted",
     "Cette vidéo est soumise à une limite d'âge : elle ne peut pas être importée.", False),
    (re.compile(r"available in your country|geo.?restrict", re.I), "youtube_geo_blocked",
     "Cette vidéo n'est pas disponible depuis nos serveurs (restriction géographique).", False),
    (re.compile(r"copyright", re.I), "youtube_copyright",
     "Cette vidéo a été retirée de YouTube pour atteinte aux droits d'auteur.", False),
    (re.compile(r"video unavailable|has been removed|does not exist|is not a valid url", re.I), "youtube_unavailable",
     "Cette vidéo est introuvable ou n'est plus disponible sur YouTube.", False),
    (re.compile(r"premiere|live event will begin|is upcoming", re.I), "youtube_not_started",
     "Cette vidéo n'est pas encore diffusée.", False),
]


def classify_error(message: str) -> JobError:
    for pattern, code, user_message, retryable in _ERRORS:
        if pattern.search(message):
            return JobError(code, user_message, retryable=retryable, detail=message[:500])
    return JobError("youtube_download_failed", "Le téléchargement depuis YouTube a échoué. Réessaie plus tard, ou "
                    "importe le fichier vidéo directement.", retryable=True, detail=message[:500])


@dataclass(frozen=True)
class VideoMeta:
    id: str
    title: str
    duration_s: float | None
    is_live: bool
    channel: str | None

    @staticmethod
    def from_info(info: dict[str, Any]) -> VideoMeta:
        return VideoMeta(
            id=str(info.get("id") or ""),
            title=str(info.get("title") or "Vidéo YouTube").strip(),
            duration_s=float(info["duration"]) if info.get("duration") else None,
            is_live=bool(info.get("is_live") or info.get("live_status") in ("is_live", "is_upcoming")),
            channel=info.get("channel") or info.get("uploader"),
        )


def check_meta(meta: VideoMeta, *, max_seconds: int) -> None:
    if meta.is_live:
        raise JobError("youtube_live", "Les directs ne peuvent pas être importés. Attends la fin de la diffusion.")
    if meta.duration_s is None:
        raise JobError("youtube_unknown_duration", "Impossible de connaître la durée de cette vidéo.")
    if meta.duration_s > max_seconds:
        raise JobError("video_too_long",
                       f"Vidéo trop longue pour ton offre ({round(meta.duration_s / 60)} min, maximum "
                       f"{max_seconds // 60} min).")
    if meta.duration_s < 20:
        raise JobError("video_too_short", "Vidéo trop courte (moins de 20 secondes).")


class YtDlpDownloader:
    """Implémentation réelle (yt-dlp + Deno pour les protections de YouTube)."""

    def _opts(self, **extra) -> dict[str, Any]:
        return {
            "quiet": True,
            "no_warnings": True,
            "noplaylist": True,
            "socket_timeout": 30,
            "retries": 3,
            "fragment_retries": 3,
            "cachedir": False,
            **extra,
        }

    def info(self, url: str) -> VideoMeta:
        import yt_dlp

        if not URL_RE.match(url):
            raise JobError("invalid_url", "Lien invalide.")
        try:
            with yt_dlp.YoutubeDL(self._opts(skip_download=True)) as ydl:
                return VideoMeta.from_info(ydl.extract_info(url, download=False))
        except yt_dlp.utils.DownloadError as e:
            raise classify_error(str(e)) from e

    def download(self, url: str, dest_dir: Path, *, max_bytes: int) -> Path:
        import yt_dlp

        h = MAX_HEIGHT
        opts = self._opts(
            # MP4 (H.264/AAC) en priorité : pas de réencodage ; sinon meilleure qualité ≤ 1080p, fusionnée en MP4.
            format=(f"bv*[height<={h}][vcodec^=avc1]+ba[ext=m4a]/b[height<={h}][ext=mp4]/"
                    f"bv*[height<={h}]+ba/b[height<={h}]"),
            merge_output_format="mp4",
            outtmpl=str(dest_dir / "download.%(ext)s"),
            max_filesize=max_bytes,
            concurrent_fragment_downloads=4,
        )
        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                ydl.download([url])
        except yt_dlp.utils.DownloadError as e:
            raise classify_error(str(e)) from e
        files = [p for p in dest_dir.glob("download.*") if p.suffix not in (".part", ".ytdl")]
        if not files:
            raise JobError("file_too_large", "Vidéo trop volumineuse pour ton offre.",
                           detail="yt-dlp n'a produit aucun fichier (taille maximale dépassée ?)")
        return max(files, key=lambda p: p.stat().st_size)
