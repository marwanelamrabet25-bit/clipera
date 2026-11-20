"""Fusion, validation, dédoublonnage et sélection finale des passages. Jamais de remplissage."""

from __future__ import annotations

from .models import LLM_CRITERIA, Candidate, Clip, SelectionResult, Sentence
from .scoring import evaluate

MIN_TOTAL = 60  # en dessous, un passage n'est pas jugé publiable
SAME_MOMENT = 0.5  # recouvrement (part du plus court) au-delà duquel deux propositions sont le même moment
MAX_SHARED_S = 2.0  # deux clips livrés ne peuvent pas partager plus de 2 s


def overlap(a: Clip, b: Clip) -> float:
    return max(0.0, min(a.end, b.end) - max(a.start, b.start))


def validate(c: Candidate, sentence_ids: set[int]) -> str | None:
    """Rejette les propositions incohérentes de l'IA (numéros inventés, bornes inversées, notes manquantes)."""
    if c.first_sentence not in sentence_ids or c.last_sentence not in sentence_ids:
        return "numéros de phrases inexistants"
    if c.last_sentence < c.first_sentence:
        return "fin avant le début"
    missing = [k for k in LLM_CRITERIA if not isinstance(c.scores.get(k), int | float)]
    if missing:
        return f"notes manquantes : {', '.join(missing)}"
    return None


def select_clips(candidates: list[Candidate], sentences: list[Sentence], requested: int,
                 min_total: int = MIN_TOTAL) -> SelectionResult:
    if requested < 1:
        raise ValueError("requested doit être ≥ 1")
    ids = {s.id for s in sentences}
    rejected: list[Clip] = []
    scored: list[Clip] = []

    for c in candidates:
        problem = validate(c, ids)
        if problem:
            # Proposition inutilisable : on la trace sans bornes fiables.
            rejected.append(Clip(candidate=c, start=0.0, end=0.0, total=0, criteria={}, rejected_reason=problem))
            continue
        clip = evaluate(c, sentences)
        if clip.rejected_reason is None and clip.total < min_total:
            clip.rejected_reason = f"note insuffisante ({clip.total}/100, minimum {min_total})"
        (rejected if clip.rejected_reason else scored).append(clip)

    # Meilleurs d'abord ; à note égale, le plus tôt dans la vidéo (ordre déterministe).
    scored.sort(key=lambda k: (-k.total, k.start))

    # Même moment proposé deux fois (fenêtres qui se recouvrent) : on garde la meilleure version.
    unique: list[Clip] = []
    for clip in scored:
        dup = next((u for u in unique if overlap(u, clip) / max(min(u.duration, clip.duration), 1e-6) > SAME_MOMENT),
                   None)
        if dup:
            clip.rejected_reason = "doublon d'un passage mieux noté"
            rejected.append(clip)
        else:
            unique.append(clip)

    selected: list[Clip] = []
    for clip in unique:
        if len(selected) >= requested:
            clip.rejected_reason = "au-delà du nombre de clips demandés"
        elif any(overlap(s, clip) > MAX_SHARED_S for s in selected):
            clip.rejected_reason = "chevauche un passage déjà retenu"
        if clip.rejected_reason:
            rejected.append(clip)
        else:
            selected.append(clip)

    selected.sort(key=lambda k: -k.total)
    return SelectionResult(selected=selected, rejected=rejected, requested=requested)
