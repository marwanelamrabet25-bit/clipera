"""Sélection multi-clips sur des vidéos longues (podcast de test : 20 sujets + bavardage, voir fixtures/podcast_fr.py).

Vérifie : jusqu'à 10 clips, tous sur un vrai sujet et tous différents, aucun chevauchement, bornes sur des phrases
complètes, nombre automatique adapté à la durée, aucune « fausse bonne » sélection dans du bavardage.
"""

import sys
import time
from itertools import combinations
from pathlib import Path

import pytest

from clipera_worker.selection import Transcript, TWord, select_clips, split_sentences
from clipera_worker.selection.heuristic import propose_candidates
from clipera_worker.selection.scoring import evaluate
from clipera_worker.selection.topics import Vocabulary, cosine, segment_topics

sys.path.insert(0, str(Path(__file__).parent / "fixtures"))
from podcast_fr import chatter_only, podcast  # noqa: E402


def run(tr, requested, auto=False):
    s = split_sentences(tr)
    v = Vocabulary(s)
    tops = segment_topics(s, v)
    return s, v, select_clips(propose_candidates(s, None, v), s, requested, auto=auto, topics=tops, vocab=v)


def topic_name(marks, c, tol=3.0):
    return next((n for n, a, b in marks if a - tol <= c.start and c.end <= b + tol), None)


@pytest.fixture(scope="module")
def hour():
    tr, marks = podcast(20, 130)  # ≈ 73 min dont ≈ 17 min de contenu utile
    s, v, res = run(tr, 10)
    return tr, marks, s, v, res


def test_ten_clips_from_an_hour_each_on_a_different_real_topic(hour):
    _, marks, _, _, res = hour
    assert len(res.selected) == 10
    names = [topic_name(marks, c) for c in res.selected]
    assert all(names), f"clip hors sujet : {names}"
    assert len(set(names)) == 10  # 10 sujets différents, aucun doublon thématique


def test_no_overlap_and_no_repetition(hour):
    _, _, s, v, res = hour
    by_id = {x.id: x for x in s}

    def text(c):
        return " ".join(by_id[i].text for i in range(c.candidate.first_sentence, c.candidate.last_sentence + 1))

    for a, b in combinations(res.selected, 2):
        assert min(a.end, b.end) - max(a.start, b.start) <= 0
        assert cosine(v.vector(text(a)), v.vector(text(b))) < 0.6


def test_bounds_are_whole_sentences_within_duration_limits(hour):
    _, _, s, _, res = hour
    for c in res.selected:
        first, last = s[c.candidate.first_sentence], s[c.candidate.last_sentence]
        assert 15 <= c.duration <= 90
        assert last.text.rstrip().endswith((".", "!", "?", "…"))  # se termine sur une phrase complète
        assert c.end >= last.end  # aucun mot de la dernière phrase n'est coupé
        assert first.start - 0.16 <= c.start <= first.words[min(3, len(first.words) - 1)].start
        assert c.start >= (s[first.id - 1].end if first.id else 0)  # ne mord jamais sur la phrase précédente


@pytest.mark.parametrize("n", [3, 5, 7, 10])
def test_requested_count_is_honoured_with_quality(n):
    tr, marks = podcast(20, 130)
    _, _, res = run(tr, n)
    assert len(res.selected) == n
    assert all(c.total >= 60 for c in res.selected)
    assert all(topic_name(marks, c) for c in res.selected)


def test_auto_mode_scales_with_duration():
    tr_long, _ = podcast(20, 130)  # ≈ 73 min
    tr_mid, _ = podcast(8, 60)  # ≈ 15 min
    _, _, long_res = run(tr_long, 10, auto=True)
    _, _, mid_res = run(tr_mid, 10, auto=True)
    assert len(long_res.selected) == 10
    assert 2 <= len(mid_res.selected) <= 3 and mid_res.cap_reason.startswith("mode automatique")
    assert "automatiquement" in mid_res.explanation


def test_short_video_is_not_cut_into_ten_clips():
    tr, _ = podcast(2, 20)
    _, _, res = run(tr, 10)
    assert 1 <= len(res.selected) <= 3  # ≈ 4 min : jamais 10 clips
    assert "demandés" in res.explanation


def test_long_but_empty_video_gives_no_fake_clip():
    _, _, res = run(chatter_only(30 * 60), 10)
    assert res.selected == []


def test_fewer_good_moments_than_requested_is_explained():
    tr, _ = podcast(4, 120)  # ≈ 13 min, seulement 4 vrais sujets
    _, _, res = run(tr, 10)
    assert len(res.selected) <= 6
    assert "demandés" in res.explanation


def test_selection_of_an_hour_is_fast_and_deterministic():
    tr, _ = podcast(20, 130)
    t = time.monotonic()
    _, _, r1 = run(tr, 10)
    assert time.monotonic() - t < 15
    _, _, r2 = run(tr, 10)
    assert [(c.start, c.end) for c in r1.selected] == [(c.start, c.end) for c in r2.selected]


def test_topics_are_detected_on_an_hour(hour):
    _, _, s, v, _ = hour
    tops = segment_topics(s, v)
    assert 8 <= len(tops) <= 45
    assert sum(1 for t in tops if t.keywords) >= 10  # les passages de pur bavardage n'ont pas de mots-clés


OPENING = ("Euh, bon, alors j'ai perdu huit mille euros en publicité sur Facebook en quatre semaines. "
           "Je ciblais toute la France avec une seule vidéo et personne n'achetait sur téléphone. "
           "Le paiement ne fonctionnait pas sur mobile et je ne l'avais jamais vérifié moi-même. "
           "Depuis, je teste toujours une commande sur mon téléphone avant de dépenser un euro.")


def test_opening_hesitation_is_trimmed():
    from clipera_worker.selection import Candidate

    words, t = [], 0.0
    for w in OPENING.split(" "):
        words.append(TWord(w, round(t, 3), round(t + 0.3, 3), "A"))
        t += 0.4
    s = split_sentences(Transcript(tuple(words)))
    scores = dict.fromkeys(("hook", "interest", "context", "coherence", "ending", "standalone"), 8)
    clip = evaluate(Candidate(0, len(s) - 1, scores), s)
    # « Euh, bon, alors » sautés : le clip démarre sur le 4e mot (1,2 s), moins la petite marge d'attaque.
    assert clip.start == pytest.approx(1.2 - 0.15, abs=0.01)
    assert "hésitation d'ouverture retirée" in clip.flags
