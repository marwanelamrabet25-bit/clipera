"""Moteur de sélection des passages : transcription → phrases → fenêtres → propositions IA → clips retenus."""

from .chunking import Window, make_windows
from .models import Candidate, Clip, SelectionResult, Sentence, Transcript, TWord
from .prompt import RESPONSE_SCHEMA, SYSTEM_PROMPT, parse_candidates, window_prompt
from .select import select_clips
from .sentences import split_sentences

__all__ = [
    "RESPONSE_SCHEMA", "SYSTEM_PROMPT", "Candidate", "Clip", "SelectionResult", "Sentence", "TWord", "Transcript",
    "Window", "make_windows", "parse_candidates", "select_clips", "split_sentences", "window_prompt",
]
