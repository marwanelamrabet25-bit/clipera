"""Fusion, validation, dédoublonnage et sélection finale des passages. Jamais de remplissage.

Sélection « diversifiée » (rules-v3) : on retient les passages un par un, en choisissant à chaque fois celui qui
combine la meilleure note ET le plus de nouveauté par rapport aux clips déjà retenus (méthode MMR, Carbonell &
Goldstein 1998) :
- même sujet (chapitre) qu'un clip retenu : pénalité, croissante ;
- vocabulaire proche d'un clip retenu (cosinus TF-IDF) : pénalité proportionnelle ; quasi identique : écarté ;
- la note de qualité minimale s'applique toujours à la note propre du passage (la diversité ne fait jamais entrer
  un passage médiocre, elle ne fait que changer l'ordre de choix).

Nombre de clips :
- « jusqu'à N » : au plus N, jamais de remplissage ;
- mode automatique : un objectif tiré de la durée de parole (≈ 1 clip par 6 min, plafonné par l'offre) ;
- dans tous les cas, au plus 1 clip par minute de parole : une vidéo courte n'est pas découpée en 10 clips.
"""

from __future__ import annotations

import math

from .models import LLM_CRITERIA, Candidate, Clip, SelectionResult, Sentence
from .scoring import evaluate
from .topics import Topic, Vocabulary, cosine, segment_topics, topic_of

MIN_TOTAL = 60  # en dessous, un passage n'est pas jugé publiable
SAME_MOMENT = 0.5  # recouvrement (part du plus court) au-delà duquel deux propositions sont le même moment
MAX_SHARED_S = 2.0  # deux clips livrés ne peuvent pas partager plus de 2 s

SAME_CONTENT_SIM = 0.6  # au-delà : le passage redit la même chose qu'un clip retenu → écarté
SIM_PENALTY = 40.0  # points retirés (pour l'ordre de choix) par unité de ressemblance au-delà de SIM_FREE
SIM_FREE = 0.12  # ressemblance « normale » entre deux passages d'une même conversation
TOPIC_PENALTY = 6.0  # par clip déjà retenu dans le même sujet
AUTO_SECONDS_PER_CLIP = 6 * 60
SECONDS_PER_CLIP_MAX = 60.0


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


def speech_seconds(sentences: list[Sentence]) -> float:
    return sum(s.end - s.start for s in sentences)


def clip_cap(sentences: list[Sentence], requested: int, auto: bool) -> tuple[int, str | None]:
    """Nombre maximal de clips pour cette vidéo, et pourquoi il est inférieur à la demande le cas échéant."""
    speech = speech_seconds(sentences)
    density = max(1, round(speech / SECONDS_PER_CLIP_MAX))
    cap, reason = requested, None
    if auto:
        target = max(1, math.ceil(speech / AUTO_SECONDS_PER_CLIP))
        if target < cap:
            cap, reason = target, f"mode automatique : {target} clip{'s' if target > 1 else ''} visé" \
                f"{'s' if target > 1 else ''} pour {round(speech / 60)} min de parole"
    if density < cap:
        cap, reason = density, (f"vidéo courte ({round(speech / 60, 1):g} min de parole) : au-delà de {density} "
                                f"clip{'s' if density > 1 else ''}, ils se répéteraient ou se recouperaient")
    return cap, reason


def select_clips(candidates: list[Candidate], sentences: list[Sentence], requested: int,
                 min_total: int = MIN_TOTAL, *, auto: bool = False, topics: list[Topic] | None = None,
                 vocab: Vocabulary | None = None) -> SelectionResult:
    if requested < 1:
        raise ValueError("requested doit être ≥ 1")
    ids = {s.id for s in sentences}
    by_id = {s.id: s for s in sentences}
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

    vocab = vocab or Vocabulary(sentences)
    topics = topics if topics is not None else segment_topics(sentences, vocab)
    text = {id(c): " ".join(by_id[i].text for i in range(c.candidate.first_sentence, c.candidate.last_sentence + 1))
            for c in unique}
    vec = {id(c): vocab.vector(text[id(c)]) for c in unique}
    topic = {}
    for c in unique:
        mid = (c.candidate.first_sentence + c.candidate.last_sentence) // 2
        t = topic_of(topics, mid)
        topic[id(c)] = t.index if t else -1
        if t:
            c.topic = ", ".join(t.keywords)

    cap, cap_reason = clip_cap(sentences, requested, auto)
    selected: list[Clip] = []
    pool = list(unique)
    while pool:
        best, best_adj, best_sim = None, -math.inf, 0.0
        for clip in pool:
            if any(overlap(s, clip) > MAX_SHARED_S for s in selected):
                continue
            sim = max((cosine(vec[id(clip)], vec[id(s)]) for s in selected), default=0.0)
            if sim > SAME_CONTENT_SIM:
                continue
            same_topic = sum(1 for s in selected if topic[id(s)] == topic[id(clip)] and topic[id(clip)] >= 0)
            adj = clip.total - SIM_PENALTY * max(0.0, sim - SIM_FREE) - TOPIC_PENALTY * same_topic
            if adj > best_adj or (adj == best_adj and best is not None and clip.start < best.start):
                best, best_adj, best_sim = clip, adj, sim
        if best is None or len(selected) >= cap:
            break
        best.diversity = {"similarity_to_selected": round(best_sim, 2), "adjusted_score": round(best_adj, 1)}
        selected.append(best)
        pool.remove(best)

    # Tout ce qui n'est pas retenu reçoit une raison claire.
    for clip in pool:
        if any(overlap(s, clip) > MAX_SHARED_S for s in selected):
            clip.rejected_reason = "chevauche un passage déjà retenu"
        elif selected and max(cosine(vec[id(clip)], vec[id(s)]) for s in selected) > SAME_CONTENT_SIM:
            clip.rejected_reason = "redit la même chose qu'un clip déjà retenu"
        else:
            clip.rejected_reason = "au-delà du nombre de clips demandés" if cap == requested else \
                f"au-delà du nombre de clips adapté à cette vidéo ({cap_reason})"
        rejected.append(clip)

    selected.sort(key=lambda k: -k.total)
    return SelectionResult(selected=selected, rejected=rejected, requested=requested, cap=cap, cap_reason=cap_reason,
                           auto=auto, topics=topics)
