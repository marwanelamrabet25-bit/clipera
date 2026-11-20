"""Découpage de la transcription en phrases (unités que l'IA référence par leur numéro)."""

from __future__ import annotations

from .models import Sentence, Transcript, TWord

TERMINAL = (".", "!", "?", "…")
MAX_PAUSE_S = 1.2  # une pause plus longue clôt la phrase, même sans ponctuation
MAX_SENTENCE_S = 30.0  # garde-fou : transcription sans ponctuation


def split_sentences(transcript: Transcript) -> list[Sentence]:
    sentences: list[Sentence] = []
    cur: list[TWord] = []

    def flush():
        if cur:
            sentences.append(
                Sentence(
                    id=len(sentences),
                    start=cur[0].start,
                    end=cur[-1].end,
                    text=" ".join(w.text for w in cur).strip(),
                    speaker=cur[0].speaker,
                    words=tuple(cur),
                )
            )
            cur.clear()

    for w in transcript.words:
        if not w.text.strip():
            continue
        if cur:
            pause = w.start - cur[-1].end
            speaker_change = w.speaker is not None and cur[-1].speaker is not None and w.speaker != cur[-1].speaker
            too_long = w.end - cur[0].start > MAX_SENTENCE_S
            if pause > MAX_PAUSE_S or speaker_change or too_long:
                flush()
        cur.append(w)
        if w.text.rstrip().endswith(TERMINAL):
            flush()
    flush()
    return sentences


def ends_cleanly(sentence: Sentence) -> bool:
    return sentence.text.rstrip().endswith(TERMINAL)
