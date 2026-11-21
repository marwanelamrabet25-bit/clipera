"""Qualité d'image : couleurs (HDR iPhone → SDR, étiquetage), débit plafonné, contrôle qualité renforcé.

Mesures réelles sur une vraie image (portrait NASA, domaine public) : on compare les couleurs du clip rendu à
celles de l'image d'origine.
"""

import subprocess
from pathlib import Path

import numpy as np
import pytest

from clipera_worker.errors import JobError
from clipera_worker.media.probe import probe
from clipera_worker.media.render import RenderSpec, build_command, compute_geometry, quality_check, render_clip

IMG = Path(__file__).parent / "fixtures" / "faces" / "astronaut.png"


def mean_rgb(path: Path, t: float = 1.0, vf: str = "scale=64:-2:flags=area") -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", str(t), "-i", str(path), "-frames:v", "1", "-vf", vf,
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, 3).mean(axis=0)


def make(path: Path, vf: str, codec: list[str]) -> Path:
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-loop", "1", "-i", str(IMG), "-f", "lavfi", "-i",
                    "sine=duration=4", "-vf", vf, "-t", "4", *codec, "-c:a", "aac", "-shortest", str(path)], check=True)
    return path


@pytest.fixture(scope="module")
def sources(tmp_path_factory):
    d = tmp_path_factory.mktemp("q")
    hlg = make(d / "iphone_hlg.mov",
               "scale=1920:1080,format=gbrpf32le,zscale=p=bt2020:t=arib-std-b67:m=bt2020nc:r=tv:pin=bt709:tin=bt709:"
               "min=bt709:npl=100,format=yuv420p10le",
               ["-c:v", "libx265", "-x265-params", "colorprim=bt2020:transfer=arib-std-b67:colormatrix=bt2020nc:"
                "log-level=error", "-color_primaries", "bt2020", "-color_trc", "arib-std-b67", "-colorspace",
                "bt2020nc", "-tag:v", "hvc1"])
    sdr = make(d / "sdr.mp4", "scale=1920:1080,format=yuv420p", ["-c:v", "libx264", "-preset", "ultrafast"])
    return {"hlg": hlg, "sdr": sdr}


REF = None


def reference():
    global REF
    if REF is None:
        REF = mean_rgb(IMG, t=0, vf="scale=1920:1080,scale=64:-2:flags=area")
    return REF


def test_iphone_hdr_source_detected(sources):
    info, _ = probe(sources["hlg"])
    assert info.is_hdr and info.bit_depth == 10 and info.color_transfer == "arib-std-b67"
    assert not probe(sources["sdr"])[0].is_hdr


def test_iphone_hdr_comes_out_with_true_colours_and_sdr_tags(sources, tmp_path):
    info, _ = probe(sources["hlg"])
    out = tmp_path / "o.mp4"
    render_clip(RenderSpec(source=sources["hlg"], output=out, start=0, end=3.5, aspect="16:9", max_short_side=1080),
                info)
    o, _ = probe(out)
    assert (o.pix_fmt, o.color_primaries, o.color_transfer, o.color_space) == ("yuv420p", "bt709", "bt709", "bt709")
    gap = float(np.abs(mean_rgb(out) - reference()).mean())
    assert gap < 5, f"couleurs décalées de {gap:.1f}/255"  # mesuré : 2,2 ; ancienne méthode « hable » : 41


def test_standard_source_tagged_bt709_without_colour_shift(sources, tmp_path):
    info, _ = probe(sources["sdr"])
    out = tmp_path / "o.mp4"
    render_clip(RenderSpec(source=sources["sdr"], output=out, start=0, end=3.5, aspect="16:9", max_short_side=1080),
                info)
    o, _ = probe(out)
    assert (o.color_primaries, o.color_transfer) == ("bt709", "bt709")
    assert float(np.abs(mean_rgb(out) - mean_rgb(sources["sdr"])).mean()) < 4


def test_bitrate_capped_by_resolution(sources):
    info, _ = probe(sources["sdr"])
    for side, rate in ((1080, "10M"), (720, "6M")):
        cmd = build_command(RenderSpec(source=sources["sdr"], output=Path("x.mp4"), start=0, end=3,
                                       max_short_side=side), info)
        assert cmd[cmd.index("-maxrate") + 1] == rate and "-crf" in cmd


def test_quality_check_rejects_black_output(tmp_path):
    out = tmp_path / "black.mp4"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=black:size=1080x1920:rate=30:d=3",
                    "-f", "lavfi", "-i", "sine=duration=3", "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-c:a", "aac",
                    "-shortest", str(out)], check=True)
    src = tmp_path / "src.mp4"  # source normale (image) : un clip noir est donc une erreur de rendu
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=1080x1920:rate=30:d=3",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", str(src)], check=True)
    spec = RenderSpec(source=src, output=out, start=0, end=3, aspect="9:16", max_short_side=1080)
    with pytest.raises(JobError) as e:
        quality_check(spec, compute_geometry(1080, 1920, "9:16", 1080))
    assert "black frames" in e.value.detail
    # Source elle-même sombre (scène de nuit) : le clip noir est fidèle, pas d'erreur de noir.
    quality_check(RenderSpec(source=out, output=out, start=0, end=3, aspect="9:16", max_short_side=1080),
                  compute_geometry(1080, 1920, "9:16", 1080))


def test_quality_check_rejects_untagged_colours(tmp_path):
    out = tmp_path / "untagged.mp4"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=1080x1920:rate=30:d=3",
                    "-f", "lavfi", "-i", "sine=duration=3", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac",
                    "-shortest", str(out)], check=True)
    spec = RenderSpec(source=out, output=out, start=0, end=3, aspect="9:16", max_short_side=1080)
    with pytest.raises(JobError) as e:
        quality_check(spec, compute_geometry(1080, 1920, "9:16", 1080))
    assert "color tags" in e.value.detail


def test_wide_layout_keeps_whole_scene_on_blurred_background(tmp_path):
    """Mode Large : image entière (rien de coupé), centrée, fond flouté de la même image (pas de bandes noires)."""
    src = tmp_path / "s.mp4"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=1920x1080:rate=30:d=4",
                    "-f", "lavfi", "-i", "sine=duration=4", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac",
                    "-shortest", str(src)], check=True)
    info, _ = probe(src)
    out = tmp_path / "o.mp4"
    r = render_clip(RenderSpec(source=src, output=out, start=0, end=3, aspect="9:16", max_short_side=1080,
                               layout="fit"), info)
    assert (r.width, r.height) == (1080, 1920)
    top = mean_rgb(out, vf="crop=1080:400:0:0,scale=32:-2")
    assert top.mean() > 15  # fond flouté visible, pas une bande noire
    # La bande centrale contient l'image entière : 1080 × 608 (16:9 réduit à la largeur).
    mid = mean_rgb(out, vf="crop=1080:600:0:660,scale=32:-2")
    assert abs(float(mid.mean()) - float(mean_rgb(src, vf="scale=32:-2").mean())) < 25
