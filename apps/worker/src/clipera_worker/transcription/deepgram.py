"""Transcription Deepgram (pré-enregistré) → `Transcript` du moteur de sélection.

Aucune dépendance ajoutée : appel HTTP standard (urllib). La clé est lue dans l'environnement
(`DEEPGRAM_API_KEY`), jamais écrite dans le code ni dans les journaux.
"""

from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ..errors import JobError
from ..selection.models import Transcript, TWord

API_URL = "https://api.deepgram.com/v1/listen"
MODEL = "nova-3"

MIMETYPES = {".opus": "audio/ogg", ".ogg": "audio/ogg", ".wav": "audio/wav", ".mp3": "audio/mpeg", ".m4a": "audio/mp4"}

FR_PUNCT = re.compile(r"(?<=\w)([?!:;])$")


@dataclass(frozen=True)
class TranscriptionResult:
    transcript: Transcript
    duration_s: float  # durée facturée par Deepgram
    request_id: str
    model: str


def build_params(language: str | None) -> dict[str, str]:
    params = {
        "model": MODEL,
        "smart_format": "false",  # garde « zéro commande » (et non « 0 commande ») dans les sous-titres
        "punctuate": "true",
        "diarize": "true",  # locuteurs
        "filler_words": "false",
        # Les audios des utilisateurs ne servent pas à entraîner les modèles de Deepgram (sans surcoût, mars 2026).
        "mip_opt_out": "true",
    }
    if language:
        params["language"] = language
    else:
        params["detect_language"] = "true"
    return params


def parse_response(payload: dict[str, Any], *, language: str | None = None) -> TranscriptionResult:
    """Normalise la réponse Deepgram. Un audio sans parole donne une transcription vide (pas une erreur)."""
    try:
        meta = payload["metadata"]
        channel = payload["results"]["channels"][0]
        alt = channel["alternatives"][0]
    except (KeyError, IndexError, TypeError) as e:
        raise JobError("transcription_bad_response", "La transcription a échoué. Réessaie plus tard.",
                       retryable=True, detail=f"réponse Deepgram inattendue : {e!r}") from e

    lang = language or channel.get("detected_language") or "fr"
    french = lang.startswith("fr")

    words: list[TWord] = []
    for w in alt.get("words", []):
        start, end = float(w["start"]), float(w["end"])
        if end < start:
            continue
        text = (w.get("punctuated_word") or w.get("word") or "").strip()
        if not text:
            continue
        if french:  # typographie française : « début ? » (espace fine insécable), pas « début? »
            text = FR_PUNCT.sub("\u202f\\1", text)
        speaker = w.get("speaker")
        words.append(TWord(
            text=text,
            start=round(start, 3),
            end=round(end, 3),
            speaker=None if speaker is None else f"S{int(speaker) + 1}",
            confidence=None if w.get("confidence") is None else round(float(w["confidence"]), 4),
        ))
    words.sort(key=lambda w: (w.start, w.end))

    model = next(iter(meta.get("model_info", {}).values()), {}).get("name", MODEL)
    return TranscriptionResult(
        transcript=Transcript(tuple(words), language=lang),
        duration_s=float(meta.get("duration", 0.0)),
        request_id=str(meta.get("request_id", "")),
        model=model,
    )


class DeepgramClient:
    def __init__(self, api_key: str, *, api_url: str = API_URL, timeout_s: float = 600, retries: int = 3):
        if not api_key:
            raise RuntimeError("DEEPGRAM_API_KEY manquante (voir docs/ENVIRONMENT.md)")
        self._key = api_key
        self._url = api_url
        self._timeout = timeout_s
        self._retries = retries

    def transcribe_file(self, audio: Path, *, language: str | None = "fr") -> TranscriptionResult:
        mimetype = MIMETYPES.get(audio.suffix.lower(), "application/octet-stream")
        url = f"{self._url}?{urllib.parse.urlencode(build_params(language))}"
        body = audio.read_bytes()  # audio compressé : ~22 Mo par heure
        payload = self._post(url, body, mimetype)
        return parse_response(payload, language=language)

    def _post(self, url: str, body: bytes, mimetype: str) -> dict[str, Any]:
        last: Exception | None = None
        for attempt in range(self._retries + 1):
            req = urllib.request.Request(url, data=body, method="POST", headers={
                "Authorization": f"Token {self._key}",
                "Content-Type": mimetype,
            })
            try:
                with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                    return json.loads(resp.read())
            except urllib.error.HTTPError as e:
                detail = e.read()[:500].decode("utf-8", "replace")
                if e.code in (401, 403):
                    raise JobError("transcription_auth", "La transcription est momentanément indisponible.",
                                   retryable=False, detail=f"Deepgram {e.code} : {detail}") from e
                if e.code in (400, 413, 415):
                    raise JobError("transcription_rejected", "Le son de cette vidéo n'a pas pu être transcrit.",
                                   retryable=False, detail=f"Deepgram {e.code} : {detail}") from e
                last = JobError("transcription_unavailable",
                                "Le service de transcription est saturé. Réessaie plus tard.",
                                retryable=True, detail=f"Deepgram {e.code} : {detail}")
            except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
                last = JobError("transcription_unavailable",
                                "Le service de transcription est injoignable. Réessaie plus tard.",
                                retryable=True, detail=repr(e))
            if attempt < self._retries:
                time.sleep(min(2 ** attempt * 2, 30))
        assert last is not None
        raise last
