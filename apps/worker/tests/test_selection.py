"""Tests du moteur de sélection, sur des transcriptions construites à la main (horodatages connus)."""

import json

import pytest

from clipera_worker.selection import (
    RESPONSE_SCHEMA,
    Candidate,
    Transcript,
    TWord,
    make_windows,
    parse_candidates,
    select_clips,
    split_sentences,
    window_prompt,
)
from clipera_worker.selection.scoring import duration_score, evaluate


def build(script: list[tuple[str, float]], wps: float = 2.5, start: float = 0.0, speaker: str | None = None):
    """script : liste de (phrase, pause après en s). Débit de parole : wps mots/s."""
    words, t = [], start
    for text, pause in script:
        for w in text.split():
            words.append(TWord(w, round(t, 3), round(t + 1 / wps - 0.05, 3), speaker))
            t += 1 / wps
        t += pause
    return Transcript(tuple(words))


def long_talk(n: int, seconds_each: float = 6.0):
    """n phrases d'environ seconds_each secondes chacune."""
    words_per = int(seconds_each * 2.5)
    return build([(" ".join(["mot"] * (words_per - 1)) + f" phrase{i}.", 0.3) for i in range(n)])


GOOD = {"hook": 9, "interest": 9, "context": 9, "coherence": 9, "ending": 9, "standalone": 9}
POOR = {"hook": 3, "interest": 4, "context": 5, "coherence": 5, "ending": 4, "standalone": 3}


# ───────────── Phrases ─────────────


def test_sentences_split_on_punctuation_pause_and_speaker():
    t = Transcript((
        TWord("Bonjour", 0, 0.4, "A"), TWord("à", 0.45, 0.6, "A"), TWord("tous.", 0.65, 1.0, "A"),
        TWord("Aujourd'hui", 1.2, 1.8, "A"), TWord("on", 1.85, 2.0, "A"),  # pas de point…
        TWord("parle", 4.0, 4.3, "A"),  # …mais pause de 2 s
        TWord("Exactement.", 4.4, 5.0, "B"),  # changement de locuteur
    ))
    s = split_sentences(t)
    assert [x.text for x in s] == ["Bonjour à tous.", "Aujourd'hui on", "parle", "Exactement."]
    assert [x.id for x in s] == [0, 1, 2, 3]
    assert s[0].start == 0 and s[0].end == 1.0 and s[3].speaker == "B"


# ───────────── Fenêtres ─────────────


def test_windows_cover_everything_with_overlap_and_global_ids():
    sentences = split_sentences(long_talk(400))  # ~40 min
    windows = make_windows(sentences, window_s=600, overlap_s=90)
    assert len(windows) >= 4
    covered = {s.id for w in windows for s in w.sentences}
    assert covered == {s.id for s in sentences}  # aucune phrase oubliée
    for a, b in zip(windows, windows[1:], strict=False):
        assert b.start < a.end  # recouvrement réel
        assert a.end - b.start >= 60
        assert a.end - a.start <= 600 + 6
    assert windows[0].sentences[0].id == 0


def test_short_video_single_window():
    sentences = split_sentences(long_talk(20))
    assert len(make_windows(sentences)) == 1


# ───────────── Notation ─────────────


@pytest.mark.parametrize(
    "d,score", [(10, 0), (15, 6), (20, 8), (25, 10), (45, 10), (60, 10), (75, 8), (90, 6), (95, 0)]
)
def test_duration_score(d, score):
    assert duration_score(d) == pytest.approx(score)


def test_bounds_snap_to_sentences_with_margins_not_overlapping_neighbours():
    sentences = split_sentences(long_talk(30))
    clip = evaluate(Candidate(5, 11, GOOD), sentences)
    assert clip.start == pytest.approx(max(sentences[5].start - 0.15, sentences[4].end))
    assert clip.end == pytest.approx(min(sentences[11].end + 0.35, sentences[12].start))
    assert clip.start >= sentences[4].end and clip.end <= sentences[12].start  # jamais de mot voisin coupé


def test_total_is_weighted_and_explained():
    sentences = split_sentences(long_talk(30))
    clip = evaluate(Candidate(5, 11, GOOD), sentences)  # ~42 s → durée idéale
    assert clip.criteria["duration"] == 10
    assert clip.total == round((0.9 * 9 + 0.1 * 10) * 10)  # 91
    assert clip.flags == []


def test_objective_checks_penalise_and_explain():
    t = build([
        ("Introduction de la vidéo sur le sujet du jour.", 0.3),
        ("Mais le vrai problème c'est que personne ne vérifie ses chiffres avant de publier.", 3.5),
        ("Et quand on regarde les données de près on découvre une tout autre histoire", 0.3),
        ("qui change complètement la manière de voir les choses et la conclusion finale", 0.3),
    ], wps=1.0)
    sentences = split_sentences(t)
    clip = evaluate(Candidate(1, len(sentences) - 1, GOOD), sentences)
    assert any("commence par « Mais »" in f for f in clip.flags)
    assert any("silence" in f for f in clip.flags)
    assert any("fin de phrase" in f for f in clip.flags)
    assert clip.criteria["context"] == 6 and clip.criteria["ending"] == 6 and clip.criteria["coherence"] == 7


def test_story_opening_with_pronoun_not_penalised():
    t = build([("Il y a trois ans j'ai tout perdu en une seule journée.", 0.3)] * 6)
    sentences = split_sentences(t)
    clip = evaluate(Candidate(0, 5, GOOD), sentences)
    assert not any("contexte" in f for f in clip.flags)


# ───────────── Sélection ─────────────


def test_never_pads_to_reach_requested_count():
    sentences = split_sentences(long_talk(100))
    cands = [Candidate(0, 6, GOOD), Candidate(20, 26, GOOD), Candidate(40, 46, POOR), Candidate(60, 66, POOR)]
    res = select_clips(cands, sentences, requested=5)
    assert len(res.selected) == 2
    assert all(c.total >= 60 for c in res.selected)
    assert "2 passages de qualité trouvés sur 5" in res.explanation
    assert sorted(r.rejected_reason.startswith("note insuffisante") for r in res.rejected) == [True, True]


def test_respects_requested_maximum_and_keeps_best():
    sentences = split_sentences(long_talk(100))
    scores = [dict(GOOD, hook=h) for h in (6, 10, 8, 7, 9, 10)]
    cands = [Candidate(i * 15, i * 15 + 6, s) for i, s in enumerate(scores)]
    res = select_clips(cands, sentences, requested=3)
    assert len(res.selected) == 3
    assert [c.candidate.scores["hook"] for c in res.selected] == [10, 10, 9]
    assert sum(r.rejected_reason == "au-delà du nombre de clips demandés" for r in res.rejected) == 3


def test_duplicates_from_overlapping_windows_are_merged():
    sentences = split_sentences(long_talk(60))
    a = Candidate(10, 16, dict(GOOD, hook=8), window=0)
    b = Candidate(11, 17, dict(GOOD, hook=10), window=1)  # même moment, mieux noté
    res = select_clips([a, b], sentences, requested=5)
    assert len(res.selected) == 1 and res.selected[0].candidate is b
    assert res.rejected[0].rejected_reason == "doublon d'un passage mieux noté"


def test_partial_overlap_is_refused():
    sentences = split_sentences(long_talk(60))
    a = Candidate(10, 16, dict(GOOD, hook=10))
    b = Candidate(15, 21, GOOD)  # chevauche a sur ~12 s (< moitié) : pas un doublon, mais interdit
    res = select_clips([a, b], sentences, requested=5)
    assert len(res.selected) == 1
    assert res.rejected[0].rejected_reason == "chevauche un passage déjà retenu"


@pytest.mark.parametrize(
    "cand,reason",
    [
        (Candidate(5, 999, GOOD), "numéros de phrases inexistants"),
        (Candidate(12, 8, GOOD), "fin avant le début"),
        (Candidate(5, 9, {"hook": 9}), "notes manquantes"),
        (Candidate(5, 6, GOOD), "trop court"),
        (Candidate(0, 25, GOOD), "trop long"),
    ],
)
def test_invalid_ai_proposals_are_rejected_with_reason(cand, reason):
    sentences = split_sentences(long_talk(40))
    res = select_clips([cand], sentences, requested=3)
    assert res.selected == [] and res.rejected[0].rejected_reason.startswith(reason)


def test_scores_are_clamped_to_0_10():
    sentences = split_sentences(long_talk(40))
    res = select_clips([Candidate(5, 11, dict(GOOD, hook=50, interest=-3))], sentences, requested=1)
    clip = (res.selected + res.rejected)[0]
    assert clip.criteria["hook"] == 10 and clip.criteria["interest"] == 0


def test_deterministic_order():
    sentences = split_sentences(long_talk(100))
    cands = [Candidate(i * 15, i * 15 + 6, GOOD) for i in range(4)]
    r1 = select_clips(cands, sentences, requested=4)
    r2 = select_clips(list(reversed(cands)), sentences, requested=4)
    assert [c.start for c in r1.selected] == [c.start for c in r2.selected]


# ───────────── Consigne IA ─────────────


def test_prompt_lists_numbered_sentences_with_times():
    sentences = split_sentences(long_talk(5))
    w = make_windows(sentences)[0]
    p = window_prompt(w, max_candidates=4, video_context="Podcast entrepreneuriat")
    assert "[S0 00:00.0–" in p and "[S4 " in p and "au maximum 4 passages" in p and "Podcast entrepreneuriat" in p


def test_parse_ai_response_roundtrip():
    payload = {"candidates": [{
        "first_sentence": 3, "last_sentence": 9, "content_type": "conseil", "title": "Le bon réflexe",
        "hook_text": "Personne ne vérifie ça.", "scores": GOOD, "reasons": {k: "ok" for k in GOOD},
    }]}
    (c,) = parse_candidates(json.dumps(payload), window_index=2)
    assert (c.first_sentence, c.last_sentence, c.window, c.content_type) == (3, 9, 2, "conseil")
    assert c.scores["hook"] == 9.0


def test_response_schema_is_strict():
    item = RESPONSE_SCHEMA["properties"]["candidates"]["items"]
    assert item["additionalProperties"] is False
    assert set(item["properties"]["scores"]["required"]) == set(GOOD)
