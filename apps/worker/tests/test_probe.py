import pytest

from clipera_worker.errors import JobError
from clipera_worker.media.audio import extract_speech_audio
from clipera_worker.media.probe import probe, validate


def test_probe_landscape(media):
    info, raw = probe(media["landscape_1080"])
    assert (info.width, info.height) == (1920, 1080)
    assert info.fps == 30
    assert info.video_codec == "h264" and info.has_audio and info.audio_codec == "aac"
    assert 39.9 <= info.duration_seconds <= 40.1
    assert "streams" in raw
    validate(info, max_duration_s=900)


def test_probe_mov(media):
    info, _ = probe(media["landscape_720"])
    assert (info.width, info.height, info.fps) == (1280, 720, 25)
    validate(info, max_duration_s=900)


def test_rotation_gives_display_dimensions(media):
    info, _ = probe(media["rotated"])
    assert info.rotation in (90, 270)
    assert (info.width, info.height) == (1080, 1920)


@pytest.mark.parametrize(
    "name,code",
    [("no_audio", "no_audio"), ("too_short", "too_short"), ("corrupt", "unreadable_file"), ("text", "unreadable_file")],
)
def test_invalid_files_rejected_with_clear_reason(media, name, code):
    with pytest.raises(JobError) as e:
        info, _ = probe(media[name])
        validate(info, max_duration_s=900)
    assert e.value.code == code
    assert e.value.user_message  # message utilisateur toujours présent
    assert not e.value.retryable


def test_too_long_for_plan(media):
    info, _ = probe(media["landscape_1080"])
    with pytest.raises(JobError) as e:
        validate(info, max_duration_s=30)
    assert e.value.code == "too_long"


def test_extract_audio(media, tmp_path):
    out = extract_speech_audio(media["landscape_1080"], tmp_path / "a.ogg")
    info_size = out.stat().st_size
    assert 50_000 < info_size < 250_000  # ~24 kb/s × 40 s
