"""Sélection de base sans IA : propositions par règles, puis mêmes contrôles et même sélection que l'IA."""

import json
from pathlib import Path

from clipera_worker.selection import Transcript, TWord, select_clips, split_sentences
from clipera_worker.selection.heuristic import propose_candidates, score_span
from clipera_worker.transcription import parse_response


def talk(script, wps=2.5, conf=0.95):
    """script : liste de (phrase, locuteur, pause après)."""
    words, t = [], 0.0
    for text, spk, pause in script:
        for w in text.split():
            words.append(TWord(w, round(t, 3), round(t + 1 / wps - 0.05, 3), spk, conf))
            t += 1 / wps
        t += pause
    return split_sentences(Transcript(tuple(words)))


FILLER = "on continue de parler tranquillement de choses et d'autres sans rien de particulier ici."
STRONG = [
    ("Pourquoi personne ne parle jamais de cette erreur ?", "A", 1.0),
    ("Honnêtement j'ai perdu huit mille euros en trois mois avec une seule décision.", "B", 0.3),
    ("Le pire c'est que tout le monde me disait que c'était la bonne idée à prendre.", "B", 0.3),
    ("J'ai mis deux ans à comprendre ce qui s'était vraiment passé ce jour-là.", "B", 0.3),
    ("La leçon c'est simple : parle à tes clients avant de dépenser le moindre euro.", "B", 1.0),
]


def test_real_dialogue_selects_complete_moment():
    fixture = json.loads((Path(__file__).parent / "fixtures" / "deepgram_fr_dialogue.json").read_text())
    s = split_sentences(parse_response(fixture, language="fr").transcript)
    res = select_clips(propose_candidates(s), s, requested=3)
    (clip,) = res.selected  # un seul moment dans 48 s : pas de remplissage
    assert s[clip.candidate.last_sentence].text.startswith("La leçon")  # va jusqu'à la conclusion
    assert clip.total >= 70 and clip.flags == []


def test_strong_moment_ranks_above_bland_talk():
    s = talk([(FILLER, "A", 0.3)] * 8 + STRONG + [(FILLER, "A", 0.3)] * 8)
    res = select_clips(propose_candidates(s), s, requested=1)
    (clip,) = res.selected
    assert s[clip.candidate.first_sentence].text.startswith("Pourquoi personne")
    assert s[clip.candidate.last_sentence].text.startswith("La leçon")


def test_never_starts_on_connector():
    s = talk([("Mais " + FILLER, "A", 0.3), ("Donc " + FILLER, "A", 0.3)] * 8)
    for c in propose_candidates(s):
        assert not s[c.first_sentence].text.lower().startswith(("mais", "donc"))


def test_proposals_are_whole_sentences_within_duration():
    s = talk([(FILLER, "A", 0.3)] * 40)
    cands = propose_candidates(s)
    assert cands
    for c in cands:
        d = s[c.last_sentence].end - s[c.first_sentence].start
        assert 20 <= d <= 60
        assert c.reasons and c.hook_text == s[c.first_sentence].text


def test_unclear_audio_lowers_interest():
    clear = talk(STRONG, conf=0.95)
    muddy = talk(STRONG, conf=0.5)
    n = len(clear) - 1
    assert score_span(muddy, 0, n)[0]["interest"] == score_span(clear, 0, n)[0]["interest"] - 2


def test_respects_requested_count_without_overlap():
    s = talk(([(FILLER, "A", 0.3)] * 4 + STRONG) * 4)
    res = select_clips(propose_candidates(s), s, requested=2)
    assert len(res.selected) == 2
    a, b = sorted(res.selected, key=lambda c: c.start)
    assert a.end <= b.start + 2


def test_deterministic():
    s = talk(([(FILLER, "A", 0.3)] * 4 + STRONG) * 3)
    r1 = select_clips(propose_candidates(s), s, requested=3)
    r2 = select_clips(propose_candidates(s), s, requested=3)
    assert [(c.start, c.end) for c in r1.selected] == [(c.start, c.end) for c in r2.selected]


def test_empty_transcript_gives_no_clip():
    assert propose_candidates([]) == []
