"""Vidéos de test générées par FFmpeg (aucun fichier externe nécessaire)."""

from __future__ import annotations

import subprocess
from pathlib import Path

import pytest


def gen(out: Path, *args: str) -> Path:
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args, str(out)], check=True)
    return out


@pytest.fixture(scope="session")
def media(tmp_path_factory) -> dict[str, Path]:
    d = tmp_path_factory.mktemp("media")
    m: dict[str, Path] = {}
    m["landscape_1080"] = gen(
        d / "landscape_1080.mp4",
        "-f", "lavfi", "-i", "testsrc2=size=1920x1080:rate=30:duration=40",
        "-f", "lavfi", "-i", "sine=frequency=300:sample_rate=48000:duration=40",
        "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac", "-shortest",
    )
    m["landscape_720"] = gen(
        d / "landscape_720.mov",
        "-f", "lavfi", "-i", "testsrc2=size=1280x720:rate=25:duration=30",
        "-f", "lavfi", "-i", "sine=frequency=300:duration=30",
        "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac", "-shortest",
    )
    # Flash blanc ET bip exactement à t = 10,0 s → sert à mesurer la synchronisation son/image.
    m["sync"] = gen(
        d / "sync.mp4",
        "-f", "lavfi", "-i", "color=black:size=1920x1080:rate=30:duration=30,"
                             "drawbox=x=0:y=0:w=iw:h=ih:color=white:t=fill:enable='between(t,10,10.099)'",
        "-f", "lavfi", "-i", "aevalsrc='if(between(t,10,10.1),0.8*sin(2*PI*1000*t),0)':s=48000:d=30",
        "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac", "-shortest",
    )
    m["black"] = gen(
        d / "black.mp4",
        "-f", "lavfi", "-i", "color=black:size=1920x1080:rate=30:duration=30",
        "-f", "lavfi", "-i", "sine=frequency=300:duration=30",
        "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac", "-shortest",
    )
    m["no_audio"] = gen(
        d / "no_audio.mp4",
        "-f", "lavfi", "-i", "testsrc2=size=1280x720:rate=30:duration=30", "-c:v", "libx264", "-preset", "ultrafast",
    )
    m["too_short"] = gen(
        d / "too_short.mp4",
        "-f", "lavfi", "-i", "testsrc2=size=1280x720:rate=30:duration=5",
        "-f", "lavfi", "-i", "sine=duration=5", "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac",
        "-shortest",
    )
    # Vidéo de téléphone tournée en portrait : stockée 1920x1080 avec une rotation de 90°.
    m["rotated"] = gen(
        d / "rotated.mp4",
        "-display_rotation", "90", "-i", str(m["landscape_1080"]), "-c", "copy",
    )
    m["corrupt"] = d / "corrupt.mp4"
    m["corrupt"].write_bytes(b"\x00\x00\x00\x18ftypmp42" + bytes(range(256)) * 400)
    m["text"] = d / "notes.mp4"
    m["text"].write_text("ceci n'est pas une vidéo")
    return m
