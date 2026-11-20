"""Sélection de base, sans IA : propose des passages à partir de règles simples sur la transcription.

Mode gratuit, utilisé tant qu'aucune IA n'est branchée. Il produit les mêmes `Candidate` que l'IA ; ils passent
ensuite par les mêmes contrôles objectifs, la même note et la même sélection (`select_clips`).

Ce que ces règles savent juger : la forme (phrases complètes, durée, silences, début et fin nets, tours de parole,
questions, chiffres, mots d'accroche, conclusion explicite, qualité du son).
Ce qu'elles ne savent PAS juger : si l'histoire est vraiment intéressante ou drôle. C'est le rôle de l'IA ;
l'interface l'indique honnêtement (« sélection automatique de base »).
"""

from __future__ import annotations

import re

from .models import Candidate, Sentence
from .scoring import CONNECTOR_START, IDEAL, evaluate
from .sentences import ends_cleanly

METHOD = "rules-v1"
MIN_S, MAX_S = 20.0, IDEAL[1]  # durée visée des propositions
TURN_PAUSE_S = 0.8  # pause qui marque un nouveau moment

HOOK_WORDS = re.compile(
    r"\b(secret|erreur|jamais|personne|problème|vérité|pourquoi|comment|astuce|conseil|leçon|incroyable|"
    r"histoire|argent|euros?|dollars?|choqu\w*|surpris\w*|honnêtement|franchement|imagine[zs]?|"
    r"le pire|le mieux|personne ne|tout le monde)\b",
    re.IGNORECASE,
)
NUMBER = re.compile(r"\b(\d+|zéro|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|vingt|cent|mille|million\w*)\b",
                    re.IGNORECASE)
CONCLUSION = re.compile(
    r"\b(la leçon|en résumé|au final|finalement|voilà|retiens|retenez|le secret c'est|en fait c'est|"
    r"c'est simple|moralité|conclusion|la clé|ce qu'il faut retenir)\b",
    re.IGNORECASE,
)


def _starts_turn(sentences: list[Sentence], i: int) -> bool:
    if i == 0:
        return True
    prev, cur = sentences[i - 1], sentences[i]
    return prev.speaker != cur.speaker or cur.start - prev.end >= TURN_PAUSE_S


def _ends_turn(sentences: list[Sentence], j: int) -> bool:
    if j == len(sentences) - 1:
        return True
    cur, nxt = sentences[j], sentences[j + 1]
    return nxt.speaker != cur.speaker or nxt.start - cur.end >= TURN_PAUSE_S


def score_span(sentences: list[Sentence], i: int, j: int) -> tuple[dict[str, float], dict[str, str]]:
    first, last, span = sentences[i], sentences[j], sentences[i : j + 1]
    text = " ".join(s.text for s in span)
    words = [w for s in span for w in s.words]
    reasons: dict[str, str] = {}

    hook, why = 5.0, []
    if first.text.rstrip().endswith(("?", "!")):
        hook += 2
        why.append("ouvre sur une question ou une exclamation")
    if HOOK_WORDS.search(first.text):
        hook += 1.5
        why.append("mot d'accroche dès la première phrase")
    if len(first.words) <= 14:
        hook += 0.5
    if _starts_turn(sentences, i):
        hook += 1
        why.append("commence à un nouveau moment")
    reasons["hook"] = ", ".join(why) or "accroche neutre"

    markers = len(HOOK_WORDS.findall(text)) + len(NUMBER.findall(text)) + text.count("?") + text.count("!")
    interest = 5.0 + min(3.0, markers / 2)
    dur = max(last.end - first.start, 1e-6)
    rate = len(words) / dur
    if 1.8 <= rate <= 4.2:
        interest += 1
    conf = [w.confidence for w in words if w.confidence is not None]
    low_audio = bool(conf) and sum(conf) / len(conf) < 0.7
    if low_audio:
        interest -= 2
    reasons["interest"] = f"{markers} marqueur(s) (chiffres, questions, mots forts), débit {rate:.1f} mots/s" + (
        ", son peu clair" if low_audio else "")

    turn_start, turn_end = _starts_turn(sentences, i), _ends_turn(sentences, j)
    context = 7.0 + (1 if turn_start else 0)
    reasons["context"] = "début de prise de parole" if turn_start else "commence en cours de prise de parole"
    coherence = 7.0
    reasons["coherence"] = "phrases complètes et consécutives"

    ending = 6.0
    if CONCLUSION.search(last.text):
        ending += 2
        reasons["ending"] = "se termine sur une conclusion explicite"
    elif last.text.rstrip().endswith("!"):
        ending += 1.5
        reasons["ending"] = "se termine sur une exclamation"
    else:
        reasons["ending"] = "fin de phrase nette" if ends_cleanly(last) else "fin peu marquée"
    if turn_end:
        ending += 1

    standalone = 6.0 + (1 if turn_start and turn_end else 0)
    reasons["standalone"] = "moment complet (début et fin de prise de parole)" if turn_start and turn_end else \
        "extrait d'un échange plus long"

    scores = {"hook": hook, "interest": interest, "context": context, "coherence": coherence,
              "ending": ending, "standalone": standalone}
    return {k: round(min(10.0, max(0.0, v)), 2) for k, v in scores.items()}, reasons


def _title(first: Sentence, max_words: int = 9) -> str:
    words = first.text.split()
    t = " ".join(words[:max_words]).rstrip(",;:")
    return t + ("…" if len(words) > max_words else "")


def propose_candidates(sentences: list[Sentence]) -> list[Candidate]:
    """Pour chaque début de phrase plausible, garde la meilleure fin (entre 20 et 60 s)."""
    out: list[Candidate] = []
    for i, first in enumerate(sentences):
        if CONNECTOR_START.match(first.text.strip(" «\"'")):
            continue  # « Mais… », « Donc… » : le passage dépend de ce qui précède
        best: tuple[int, Candidate] | None = None
        for j in range(i, len(sentences)):
            d = sentences[j].end - first.start
            if d > MAX_S:
                break
            if d < MIN_S:
                continue
            scores, reasons = score_span(sentences, i, j)
            cand = Candidate(i, j, scores, reasons, content_type=None, title=_title(first), hook_text=first.text)
            total = evaluate(cand, sentences).total
            if best is None or total > best[0]:
                best = (total, cand)
        if best:
            out.append(best[1])
    return out
