"""Modèles de données du moteur de sélection des passages."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class TWord:
    """Un mot de la transcription, avec ses horodatages en secondes (vidéo source)."""

    text: str
    start: float
    end: float
    speaker: str | None = None
    confidence: float | None = None


@dataclass(frozen=True)
class Transcript:
    words: tuple[TWord, ...]
    language: str = "fr"

    @property
    def duration(self) -> float:
        return self.words[-1].end if self.words else 0.0


@dataclass(frozen=True)
class Sentence:
    id: int  # numéro global, stable sur toute la vidéo
    start: float
    end: float
    text: str
    speaker: str | None
    words: tuple[TWord, ...]


# Critères notés par l'IA (0–10), d'après le cahier des charges §5.4.
LLM_CRITERIA = (
    "hook",  # qualité de l'accroche (les premières secondes donnent-elles envie de rester ?)
    "interest",  # intérêt du contenu
    "context",  # le passage se comprend-il sans le reste de la vidéo ?
    "coherence",  # cohérence narrative du début à la fin
    "ending",  # qualité de la conclusion (chute, conseil final, punchline…)
    "standalone",  # valeur autonome : peut-on le publier tel quel ?
)

CRITERIA_LABELS = {
    "hook": "Accroche",
    "interest": "Intérêt",
    "context": "Contexte",
    "coherence": "Cohérence",
    "ending": "Conclusion",
    "standalone": "Autonomie",
    "duration": "Durée",
}

CONTENT_TYPES = (
    "histoire", "conseil", "humour", "réaction", "opinion", "débat", "explication", "anecdote", "surprise",
)


@dataclass
class Candidate:
    """Passage proposé (par l'IA), exprimé en numéros de phrases — jamais en horodatages libres."""

    first_sentence: int
    last_sentence: int
    scores: dict[str, float]  # critères LLM_CRITERIA, 0–10
    reasons: dict[str, str] = field(default_factory=dict)
    content_type: str | None = None
    title: str | None = None
    hook_text: str | None = None
    window: int | None = None  # fenêtre d'analyse d'origine


@dataclass
class Clip:
    """Passage retenu ou écarté, avec bornes finales et note expliquée."""

    candidate: Candidate
    start: float
    end: float
    total: int  # 0–100
    criteria: dict[str, float]  # notes finales 0–10 (après contrôles objectifs)
    flags: list[str] = field(default_factory=list)  # contrôles objectifs déclenchés (explications)
    rejected_reason: str | None = None

    @property
    def duration(self) -> float:
        return round(self.end - self.start, 3)


@dataclass
class SelectionResult:
    selected: list[Clip]
    rejected: list[Clip]
    requested: int

    @property
    def explanation(self) -> str:
        n = len(self.selected)
        if n >= self.requested:
            return f"{n} passages de qualité sélectionnés."
        if n == 0:
            return "Aucun passage n'atteint le niveau de qualité requis dans cette vidéo."
        return (f"{n} passage{'s' if n > 1 else ''} de qualité trouvé{'s' if n > 1 else ''} sur {self.requested} "
                "demandés : nous ne générons pas de clips médiocres pour atteindre un nombre.")
