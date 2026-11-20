"""Transcription Deepgram : normalisation d'une vraie réponse (dialogue français à deux voix) et gestion des erreurs.

La fixture `deepgram_fr_dialogue.json` est une réponse réelle de Deepgram Nova-3 (47,6 s, 2 locuteurs), obtenue
avec l'audio produit par `extract_speech_audio`.
"""

import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

import pytest

from clipera_worker.errors import JobError
from clipera_worker.selection import select_clips, split_sentences
from clipera_worker.selection.models import Candidate
from clipera_worker.transcription import DeepgramClient, build_params, parse_response
from clipera_worker.transcription import deepgram as dg

FIXTURE = json.loads((Path(__file__).parent / "fixtures" / "deepgram_fr_dialogue.json").read_text())


def test_real_response_is_normalised():
    res = parse_response(FIXTURE, language="fr")
    words = res.transcript.words
    assert res.duration_s == pytest.approx(47.6, abs=0.1)
    assert res.model.endswith("nova-3")
    assert len(words) > 100
    assert all(w.end >= w.start for w in words)
    assert [w.start for w in words] == sorted(w.start for w in words)
    assert {w.speaker for w in words} == {"S1", "S2"}
    assert all(0 <= w.confidence <= 1 for w in words)
    assert res.transcript.language == "fr"


def test_real_dialogue_splits_into_sentences_by_speaker():
    sentences = split_sentences(parse_response(FIXTURE, language="fr").transcript)
    assert sentences[0].text.startswith("Bienvenue dans l'émission")
    assert sentences[0].speaker == "S1"
    question = next(s for s in sentences if s.text.startswith("Mais qu'est-ce que tu as fait"))
    answer = sentences[question.id + 1]
    assert question.speaker == "S1" and answer.speaker == "S2"  # changement de locuteur détecté
    assert answer.text.startswith("J'ai tout arrêté")  # audio 32 kb/s : mot juste (24 kb/s « voip » le perdait)
    assert "zéro commande" in " ".join(s.text for s in sentences)  # nombres en toutes lettres


def test_french_typography_in_captions():
    text = " ".join(w.text for w in parse_response(FIXTURE, language="fr").transcript.words)
    assert "début ?" in text and "début?" not in text
    english = parse_response(FIXTURE, language="en")
    assert "début?" in " ".join(w.text for w in english.transcript.words)


def test_real_transcript_feeds_selection_engine():
    sentences = split_sentences(parse_response(FIXTURE, language="fr").transcript)
    scores = dict.fromkeys(("hook", "interest", "context", "coherence", "ending", "standalone"), 9)
    res = select_clips([Candidate(2, len(sentences) - 1, scores)], sentences, requested=1)
    (clip,) = res.selected
    assert 25 <= clip.end - clip.start <= 40
    assert clip.start >= sentences[1].end  # ne coupe pas la question précédente


def test_silence_gives_empty_transcript_not_error():
    payload = {"metadata": {"duration": 30.0, "request_id": "x"},
               "results": {"channels": [{"alternatives": [{"transcript": "", "words": []}]}]}}
    res = parse_response(payload)
    assert res.transcript.words == () and res.duration_s == 30.0


def test_malformed_response_is_retryable_error():
    with pytest.raises(JobError) as e:
        parse_response({"metadata": {}})
    assert e.value.code == "transcription_bad_response" and e.value.retryable


def test_params():
    p = build_params("fr")
    assert p["model"] == "nova-3" and p["language"] == "fr" and p["diarize"] == "true"
    assert p["smart_format"] == "false"
    assert build_params(None)["detect_language"] == "true" and "language" not in build_params(None)


# ───────────── Appels HTTP (serveur local simulé) ─────────────


class _Stub:
    def __init__(self, statuses):
        self.statuses = list(statuses)
        self.requests = []
        stub = self

        class H(BaseHTTPRequestHandler):
            def do_POST(self):  # noqa: N802
                body = self.rfile.read(int(self.headers["Content-Length"]))
                stub.requests.append((self.path, dict(self.headers), body))
                code = stub.statuses.pop(0)
                payload = json.dumps(FIXTURE if code == 200 else {"err_msg": "boom"}).encode()
                self.send_response(code)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)

            def log_message(self, *a):
                pass

        self.server = HTTPServer(("127.0.0.1", 0), H)
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.url = f"http://127.0.0.1:{self.server.server_port}/v1/listen"


@pytest.fixture
def audio(tmp_path):
    f = tmp_path / "a.opus"
    f.write_bytes(b"OggS" + b"\0" * 100)
    return f


@pytest.fixture(autouse=True)
def no_sleep(monkeypatch):
    monkeypatch.setattr(dg.time, "sleep", lambda s: None)


def test_sends_audio_with_key_and_params(audio):
    stub = _Stub([200])
    res = DeepgramClient("k-test", api_url=stub.url).transcribe_file(audio, language="fr")
    path, headers, body = stub.requests[0]
    assert headers["Authorization"] == "Token k-test" and headers["Content-Type"] == "audio/ogg"
    assert "model=nova-3" in path and "language=fr" in path and "diarize=true" in path
    assert body == audio.read_bytes()
    assert len(res.transcript.words) > 100


def test_retries_when_service_overloaded(audio):
    stub = _Stub([503, 429, 200])
    res = DeepgramClient("k", api_url=stub.url).transcribe_file(audio)
    assert len(stub.requests) == 3 and res.duration_s > 0


def test_gives_up_after_retries_with_retryable_error(audio):
    stub = _Stub([500] * 4)
    with pytest.raises(JobError) as e:
        DeepgramClient("k", api_url=stub.url, retries=3).transcribe_file(audio)
    assert len(stub.requests) == 4 and e.value.retryable and e.value.code == "transcription_unavailable"


@pytest.mark.parametrize("code,err", [(401, "transcription_auth"), (400, "transcription_rejected")])
def test_auth_and_bad_audio_are_not_retried(audio, code, err):
    stub = _Stub([code])
    with pytest.raises(JobError) as e:
        DeepgramClient("k", api_url=stub.url).transcribe_file(audio)
    assert len(stub.requests) == 1 and e.value.code == err and not e.value.retryable
    assert "k" not in e.value.user_message


def test_missing_key_refused():
    with pytest.raises(RuntimeError):
        DeepgramClient("")
