"""Note explicable d'un passage : critères notés par l'IA + contrôles objectifs calculés ici.

Total (0–100) = moyenne pondérée des critères (0–10) × 10. Les pondérations sont fixes et documentées :
aucune note n'est un chiffre arbitraire.
"""

from __future__ import annotations

import re

from .models import LLM_CRITERIA, Candidate, Clip, Sentence
from .sentences import ends_cleanly

WEIGHTS = {
    "hook": 0.20,
    "interest": 0.20,
    "context": 0.15,
    "coherence": 0.15,
    "ending": 0.10,
    "standalone": 0.10,
    "duration": 0.10,
}
assert abs(sum(WEIGHTS.values()) - 1) < 1e-9

# Durées (secondes) : idéal pour TikTok / Shorts / Reels, et bornes dures.
IDEAL = (25.0, 60.0)
HARD = (15.0, 90.0)
LONG_SILENCE_S = 2.5
LEAD_IN_S = 0.15  # petite marge avant le premier mot (évite une attaque coupée)
TAIL_S = 0.35  # petite marge après le dernier mot (évite une fin brutale)

# Débuts qui trahissent un contexte manquant (le passage dépend de ce qui précède).
# Volontairement limité aux connecteurs logiques : « Il y a trois ans… » ou « Alors voilà… » ouvrent très bien
# une histoire et ne doivent pas être pénalisés.
CONNECTOR_START = re.compile(
    r"^(et|mais|donc|du coup|parce que|car|puis|ensuite|sinon|or|bref|par contre|"
    r"c'est pour ça|c'est pourquoi|du coup)\b",
    re.IGNORECASE,
)


def duration_score(d: float) -> float:
    lo, hi = IDEAL
    if lo <= d <= hi:
        return 10.0
    if HARD[0] <= d < lo:
        return round(6 + 4 * (d - HARD[0]) / (lo - HARD[0]), 2)
    if hi < d <= HARD[1]:
        return round(6 + 4 * (HARD[1] - d) / (HARD[1] - hi), 2)
    return 0.0


LEADING_FILLERS = frozenset({"euh", "heu", "hum", "bon", "ben", "bah", "alors", "donc", "voilà", "ouais", "hein"})


def speech_start(sentence: Sentence) -> float:
    """Début du premier vrai mot : on saute jusqu'à 3 hésitations d'ouverture (« Euh, bon, … »)."""
    words = sentence.words
    k = 0
    while k < min(3, len(words) - 1) and words[k].text.lower().strip(" ,.…!?;:") in LEADING_FILLERS:
        k += 1
    return words[k].start if words else sentence.start


def evaluate(candidate: Candidate, sentences: list[Sentence]) -> Clip:
    """Calcule les bornes finales, applique les contrôles objectifs et la note totale."""
    by_id = {s.id: s for s in sentences}
    first, last = by_id[candidate.first_sentence], by_id[candidate.last_sentence]
    span = [s for s in sentences if first.id <= s.id <= last.id]

    prev_end = by_id[first.id - 1].end if first.id - 1 in by_id else 0.0
    next_start = by_id[last.id + 1].start if last.id + 1 in by_id else last.end + TAIL_S
    trimmed = speech_start(first)
    start = round(max(trimmed - LEAD_IN_S, prev_end, 0.0), 3)
    end = round(min(last.end + TAIL_S, next_start), 3)

    criteria = {k: float(max(0.0, min(10.0, candidate.scores.get(k, 0.0)))) for k in LLM_CRITERIA}
    flags: list[str] = []

    words = [w for s in span for w in s.words]
    gaps = [b.start - a.end for a, b in zip(words, words[1:], strict=False)]
    long_gaps = [g for g in gaps if g > LONG_SILENCE_S]
    if long_gaps:
        criteria["coherence"] = max(0.0, criteria["coherence"] - 2 * len(long_gaps))
        flags.append(f"{len(long_gaps)} silence(s) de plus de {LONG_SILENCE_S:g} s")

    if CONNECTOR_START.match(first.text.strip(" «\"'")):
        criteria["context"] = max(0.0, criteria["context"] - 3)
        flags.append(f"commence par « {first.text.split()[0]} » : contexte probablement manquant")

    if not ends_cleanly(last):
        criteria["ending"] = max(0.0, criteria["ending"] - 3)
        flags.append("se termine sans fin de phrase nette")

    if trimmed > first.start + 0.05:
        flags.append("hésitation d'ouverture retirée")
    d = end - start
    criteria["duration"] = duration_score(d)
    total = round(sum(WEIGHTS[k] * criteria[k] for k in WEIGHTS) * 10)

    clip = Clip(candidate=candidate, start=start, end=end, total=int(total), criteria=criteria, flags=flags)
    if d < HARD[0]:
        clip.rejected_reason = f"trop court ({d:.0f} s, minimum {HARD[0]:.0f} s)"
    elif d > HARD[1]:
        clip.rejected_reason = f"trop long ({d:.0f} s, maximum {HARD[1]:.0f} s)"
    return clip
