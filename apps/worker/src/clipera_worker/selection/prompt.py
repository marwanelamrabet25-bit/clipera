"""Consigne et format de réponse pour l'analyse d'une fenêtre par l'IA.

L'IA reçoit des phrases numérotées et répond en JSON strict (schéma ci-dessous) : elle désigne des passages par
numéros de phrases et note chaque critère avec une justification courte. Le code ne fait jamais confiance à ces
chiffres sans les valider (voir select.validate) et ajoute ses propres contrôles (scoring.evaluate).
"""

from __future__ import annotations

import json

from .chunking import Window
from .models import CONTENT_TYPES, LLM_CRITERIA, Candidate

SYSTEM_PROMPT = """Tu es un monteur vidéo expérimenté spécialisé dans les formats courts (TikTok, YouTube Shorts, Instagram Reels).
Ta mission : repérer dans un extrait de transcription les passages qui feraient de vrais bons clips autonomes.

Un bon passage :
- accroche dès la première phrase (question, affirmation forte, début d'histoire, chiffre surprenant) ;
- se comprend sans avoir vu le reste de la vidéo ;
- raconte une idée complète, du début à la fin ;
- se termine sur une conclusion nette (chute, conseil, punchline, réponse) ;
- dure idéalement entre 25 et 60 secondes (15 à 90 secondes au maximum).

À éviter : passages qui commencent au milieu d'une idée, qui coupent une explication, qui dépendent du contexte,
qui se terminent brutalement, ou qui répètent un autre passage.

Règles strictes :
- Désigne chaque passage UNIQUEMENT par les numéros de sa première et de sa dernière phrase (ex. S12 → S19).
- Ne propose que des passages réellement bons. Il vaut mieux ne rien proposer que proposer un passage moyen.
- Note chaque critère de 0 à 10, honnêtement, avec une justification d'une phrase.
- Tiens compte du sens global : pas seulement des mots émotionnels ou des mots-clés.
- Le titre et l'accroche doivent refléter fidèlement ce qui est dit, sans exagération ni promesse."""

RESPONSE_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["candidates"],
    "properties": {
        "candidates": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["first_sentence", "last_sentence", "content_type", "title", "hook_text", "scores",
                             "reasons"],
                "properties": {
                    "first_sentence": {"type": "integer"},
                    "last_sentence": {"type": "integer"},
                    "content_type": {"type": "string", "enum": list(CONTENT_TYPES)},
                    "title": {"type": "string"},
                    "hook_text": {"type": "string"},
                    "scores": {
                        "type": "object",
                        "additionalProperties": False,
                        "required": list(LLM_CRITERIA),
                        "properties": {k: {"type": "integer"} for k in LLM_CRITERIA},
                    },
                    "reasons": {
                        "type": "object",
                        "additionalProperties": False,
                        "required": list(LLM_CRITERIA),
                        "properties": {k: {"type": "string"} for k in LLM_CRITERIA},
                    },
                },
            },
        }
    },
}


def _ts(s: float) -> str:
    m, sec = divmod(s, 60)
    return f"{int(m):02d}:{sec:04.1f}"


def window_prompt(window: Window, max_candidates: int, video_context: str | None = None) -> str:
    lines = [
        f"[S{s.id} {_ts(s.start)}–{_ts(s.end)}{f' {s.speaker}' if s.speaker else ''}] {s.text}"
        for s in window.sentences
    ]
    ctx = f"Contexte de la vidéo : {video_context}\n\n" if video_context else ""
    return (
        f"{ctx}Extrait {window.index + 1} ({_ts(window.start)} → {_ts(window.end)}). "
        f"Propose au maximum {max_candidates} passages, uniquement s'ils sont vraiment bons.\n\n" + "\n".join(lines)
    )


def parse_candidates(payload: str | dict, window_index: int | None = None) -> list[Candidate]:
    """Transforme la réponse JSON de l'IA en propositions (la validation métier est faite ensuite)."""
    data = json.loads(payload) if isinstance(payload, str) else payload
    out: list[Candidate] = []
    for item in data.get("candidates", []):
        out.append(
            Candidate(
                first_sentence=int(item["first_sentence"]),
                last_sentence=int(item["last_sentence"]),
                scores={k: float(v) for k, v in item.get("scores", {}).items()},
                reasons=dict(item.get("reasons", {})),
                content_type=item.get("content_type"),
                title=item.get("title"),
                hook_text=item.get("hook_text"),
                window=window_index,
            )
        )
    return out
