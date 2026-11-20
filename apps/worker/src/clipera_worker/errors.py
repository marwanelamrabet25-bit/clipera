"""Erreurs typées : chaque échec a un code stable, un message pour l'utilisateur et une politique de reprise."""

from __future__ import annotations


class JobError(Exception):
    """Échec d'un job.

    code:          identifiant stable stocké en base (ex. "no_video_stream").
    user_message:  message clair affiché à l'utilisateur, en français.
    retryable:     True si une nouvelle tentative a une chance de réussir (réseau, service saturé…).
    """

    def __init__(self, code: str, user_message: str, *, retryable: bool = False, detail: str | None = None):
        super().__init__(f"{code}: {detail or user_message}")
        self.code = code
        self.user_message = user_message
        self.retryable = retryable
        self.detail = detail


class JobCancelled(Exception):
    """L'utilisateur a demandé l'annulation pendant le traitement."""
