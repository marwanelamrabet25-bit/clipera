"""Fenêtres d'analyse pour les vidéos longues : on n'envoie jamais des heures de transcription d'un coup.

Chaque fenêtre couvre ~WINDOW_S secondes de phrases entières, avec un recouvrement OVERLAP_S pour ne pas rater
un passage à cheval sur deux fenêtres. Les numéros de phrases restent globaux : la fusion est directe.
"""

from __future__ import annotations

from dataclasses import dataclass

from .models import Sentence

WINDOW_S = 10 * 60
OVERLAP_S = 90


@dataclass(frozen=True)
class Window:
    index: int
    sentences: tuple[Sentence, ...]

    @property
    def start(self) -> float:
        return self.sentences[0].start

    @property
    def end(self) -> float:
        return self.sentences[-1].end


def make_windows(sentences: list[Sentence], window_s: float = WINDOW_S, overlap_s: float = OVERLAP_S) -> list[Window]:
    if not sentences:
        return []
    if overlap_s >= window_s:
        raise ValueError("le recouvrement doit être plus court que la fenêtre")
    windows: list[Window] = []
    i = 0
    while i < len(sentences):
        start = sentences[i].start
        j = i
        while j < len(sentences) and sentences[j].end - start <= window_s:
            j += 1
        j = max(j, i + 1)  # toujours au moins une phrase
        windows.append(Window(len(windows), tuple(sentences[i:j])))
        if j >= len(sentences):
            break
        # la fenêtre suivante recommence overlap_s avant la fin de celle-ci (sur une frontière de phrase)
        restart = sentences[j - 1].end - overlap_s
        k = j - 1
        while k > i and sentences[k - 1].start >= restart:
            k -= 1
        i = max(k, i + 1)
    return windows
