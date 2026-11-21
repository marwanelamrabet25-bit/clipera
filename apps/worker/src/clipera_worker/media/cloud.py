"""Téléchargement d'un fichier partagé sur Google Drive ou Dropbox.

Sécurité : le lien arrive déjà normalisé par la base. Chaque redirection est vérifiée : seuls les domaines de
Google Drive et Dropbox sont suivis (aucune requête vers un autre serveur). Taille plafonnée pendant le
téléchargement (le fichier n'est jamais lu en mémoire).
"""

from __future__ import annotations

import re
import urllib.parse
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path

import requests

from ..errors import JobError

DRIVE_RE = re.compile(r"^https://drive\.google\.com/file/d/([A-Za-z0-9_-]{20,100})$")
DROPBOX_RE = re.compile(r"^https://www\.dropbox\.com/(s|scl/fi)/[A-Za-z0-9_./%-]{1,255}(\?rlkey=[A-Za-z0-9]{1,100})?$")

ALLOWED_HOSTS = (
    "drive.google.com", "drive.usercontent.google.com", "docs.google.com",
    "www.dropbox.com", "dropbox.com", "dl.dropboxusercontent.com",
)
ALLOWED_SUFFIXES = (".googleusercontent.com", ".dropboxusercontent.com")
MAX_REDIRECTS = 8
CHUNK = 1024 * 1024
UA = "Mozilla/5.0 (compatible; CliperaImporter/1.0; +https://clipera.fr)"


def host_allowed(url: str) -> bool:
    p = urllib.parse.urlsplit(url)
    host = (p.hostname or "").lower()
    return p.scheme == "https" and (host in ALLOWED_HOSTS or host.endswith(ALLOWED_SUFFIXES))


def download_url(provider: str, url: str) -> str:
    """Adresse de téléchargement direct à partir du lien de partage canonique."""
    if provider == "gdrive":
        m = DRIVE_RE.match(url)
        if not m:
            raise JobError("invalid_url", "Lien invalide.")
        return f"https://drive.usercontent.google.com/download?id={m.group(1)}&export=download&confirm=t"
    if provider == "dropbox":
        if not DROPBOX_RE.match(url):
            raise JobError("invalid_url", "Lien invalide.")
        return url + ("&" if "?" in url else "?") + "dl=1"
    raise JobError("invalid_url", "Fournisseur non pris en charge.")


def _filename(resp: requests.Response) -> str | None:
    cd = resp.headers.get("Content-Disposition", "")
    m = re.search(r"filename\*=UTF-8''([^;]+)", cd) or re.search(r'filename="?([^";]+)"?', cd)
    return urllib.parse.unquote(m.group(1)).strip() if m else None


NOT_SHARED = {
    "gdrive": "Impossible d'accéder à ce fichier Google Drive. Vérifie qu'il est partagé : Partager → Accès général → "
              "« Tous les utilisateurs disposant du lien ». Si c'est déjà le cas, Google limite peut-être "
              "temporairement les téléchargements de ce fichier : réessaie plus tard.",
    "dropbox": "Ce lien Dropbox ne donne pas accès au fichier (lien expiré, supprimé ou dossier). Crée un lien de "
               "partage vers le fichier vidéo lui-même.",
}


@dataclass(frozen=True)
class Fetched:
    path: Path
    filename: str | None
    size: int


class CloudDownloader:
    def __init__(self, session_factory: Callable[[], requests.Session] = requests.Session, timeout: float = 30):
        self._session_factory = session_factory
        self._timeout = timeout

    def fetch(self, provider: str, url: str, dest_dir: Path, *, max_bytes: int) -> Fetched:
        target = download_url(provider, url)
        with self._session_factory() as s:
            s.headers["User-Agent"] = UA
            resp = self._follow(s, target, provider)
            with resp:
                ctype = resp.headers.get("Content-Type", "").lower()
                if resp.status_code in (401, 403, 404, 410):
                    raise JobError("cloud_not_shared", NOT_SHARED[provider], detail=f"HTTP {resp.status_code}")
                if resp.status_code == 429:
                    raise JobError("cloud_rate_limited", "Ce fichier a été trop téléchargé récemment. Réessaie dans "
                                   "quelques heures.", retryable=True)
                if resp.status_code >= 500:
                    raise JobError("cloud_unavailable", "Le service de partage ne répond pas. Réessaie plus tard.",
                                   retryable=True, detail=f"HTTP {resp.status_code}")
                if resp.status_code != 200:
                    raise JobError("cloud_download_failed", "Le téléchargement a échoué.",
                                   detail=f"HTTP {resp.status_code}")
                if "text/html" in ctype:
                    # Page web au lieu du fichier : non partagé, quota Google dépassé, ou lien vers un dossier.
                    raise JobError("cloud_not_shared", NOT_SHARED[provider], detail=f"HTML reçu ({ctype})")
                declared = int(resp.headers.get("Content-Length") or 0)
                if declared > max_bytes:
                    raise JobError("file_too_large", "Vidéo trop volumineuse pour ton offre.")
                name = _filename(resp)
                out = dest_dir / "download.bin"
                size = 0
                with out.open("wb") as f:
                    for chunk in resp.iter_content(CHUNK):
                        size += len(chunk)
                        if size > max_bytes:
                            raise JobError("file_too_large", "Vidéo trop volumineuse pour ton offre.")
                        f.write(chunk)
        if size == 0:
            raise JobError("cloud_empty", "Le fichier téléchargé est vide.")
        return Fetched(out, name, size)

    def _follow(self, s: requests.Session, url: str, provider: str) -> requests.Response:
        for _ in range(MAX_REDIRECTS + 1):
            host = (urllib.parse.urlsplit(url).hostname or "").lower()
            if host == "accounts.google.com" or (host == "www.dropbox.com" and "/login" in url):
                # Redirection vers une page de connexion : le fichier n'est pas partagé publiquement.
                raise JobError("cloud_not_shared", NOT_SHARED[provider], detail=f"connexion demandée : {url[:200]}")
            if not host_allowed(url):
                raise JobError("cloud_bad_redirect", NOT_SHARED[provider], detail=f"redirection refusée : {url[:200]}")
            try:
                resp = s.get(url, stream=True, allow_redirects=False, timeout=self._timeout)
            except requests.RequestException as e:
                raise JobError("cloud_unavailable", "Le service de partage ne répond pas. Réessaie plus tard.",
                               retryable=True, detail=repr(e)) from e
            if resp.status_code in (301, 302, 303, 307, 308) and resp.headers.get("Location"):
                url = urllib.parse.urljoin(url, resp.headers["Location"])
                resp.close()
                continue
            return resp
        raise JobError("cloud_download_failed", "Trop de redirections.")
