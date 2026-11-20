"""Stockage objet. Production : Cloudflare R2 (API S3). Tests / dev hors ligne : dossier local."""

from __future__ import annotations

import shutil
from pathlib import Path
from typing import Protocol

from .errors import JobError


class Storage(Protocol):
    def download(self, key: str, dest: Path) -> Path: ...
    def upload(self, src: Path, key: str, content_type: str) -> None: ...
    def delete(self, key: str) -> None: ...


def _safe_key(key: str) -> str:
    if not key or key.startswith("/") or ".." in key.split("/"):
        raise ValueError(f"clé de stockage invalide : {key!r}")
    return key


class LocalStorage:
    def __init__(self, root: Path):
        self.root = root.resolve()

    def _path(self, key: str) -> Path:
        return self.root / _safe_key(key)

    def download(self, key: str, dest: Path) -> Path:
        src = self._path(key)
        if not src.exists():
            raise JobError("source_missing", "Le fichier importé est introuvable. Réimporte la vidéo.")
        shutil.copyfile(src, dest)
        return dest

    def upload(self, src: Path, key: str, content_type: str) -> None:
        dst = self._path(key)
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)

    def delete(self, key: str) -> None:
        self._path(key).unlink(missing_ok=True)


class R2Storage:
    def __init__(self, account_id: str | None, access_key_id: str, secret_access_key: str, bucket: str,
                 endpoint_url: str | None = None):
        """endpoint_url remplace l'adresse R2 (faux S3 local pour les tests uniquement)."""
        import boto3
        from botocore.config import Config

        self.bucket = bucket
        self.s3 = boto3.client(
            "s3",
            endpoint_url=endpoint_url or f"https://{account_id}.r2.cloudflarestorage.com",
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name="auto",
            config=Config(retries={"max_attempts": 5, "mode": "adaptive"}, signature_version="s3v4"),
        )

    def download(self, key: str, dest: Path) -> Path:
        from botocore.exceptions import ClientError

        try:
            self.s3.download_file(self.bucket, _safe_key(key), str(dest))
        except ClientError as e:
            code = e.response.get("Error", {}).get("Code")
            if code in ("404", "NoSuchKey"):
                raise JobError("source_missing", "Le fichier importé est introuvable. Réimporte la vidéo.") from e
            raise JobError("storage_error", "Erreur temporaire de stockage.", retryable=True, detail=str(e)) from e
        return dest

    def upload(self, src: Path, key: str, content_type: str) -> None:
        self.s3.upload_file(str(src), self.bucket, _safe_key(key), ExtraArgs={"ContentType": content_type})

    def delete(self, key: str) -> None:
        self.s3.delete_object(Bucket=self.bucket, Key=_safe_key(key))
