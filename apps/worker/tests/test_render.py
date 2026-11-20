"""Tests de rendu sur de vraies vidéos : chaque test vérifie un résultat observable dans le fichier produit."""

import re
import subprocess
from pathlib import Path

import pytest

from clipera_worker.captions.ass import Word, build_ass
from clipera_worker.errors import JobError
from clipera_worker.media.probe import probe
from clipera_worker.media.render import CropKeyframe, RenderSpec, compute_geometry, render_clip

ASSETS = Path(__file__).resolve().parents[1] / "assets"


def frame_luma(video: Path, t: float, crop: str | None = None) -> float:
    """Luminosité moyenne (0–255) d'une image à l'instant t, éventuellement dans une zone."""
    vf = (f"crop={crop}," if crop else "") + "format=gray,scale=64:64,signalstats,metadata=print:file=-"
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", str(t), "-i", str(video), "-frames:v", "1",
         "-vf", vf, "-f", "null", "-"], capture_output=True, text=True, check=True).stdout
    return float(re.search(r"YAVG=([\d.]+)", out).group(1))


@pytest.mark.parametrize(
    "src,aspect,limit,expected",
    [
        ((1920, 1080), "9:16", 1080, (1080, 1920)),
        ((1920, 1080), "9:16", 720, (720, 1280)),
        ((1280, 720), "9:16", 1080, (720, 1280)),  # pas d'agrandissement artificiel
        ((1920, 1080), "1:1", 1080, (1080, 1080)),
        ((1920, 1080), "16:9", 1080, (1920, 1080)),
        ((1080, 1920), "9:16", 1080, (1080, 1920)),
        ((3840, 2160), "9:16", 1080, (1080, 1920)),
    ],
)
def test_geometry(src, aspect, limit, expected):
    g = compute_geometry(*src, aspect, limit)
    assert (g.out_w, g.out_h) == expected
    assert g.crop_w <= src[0] and g.crop_h <= src[1]
    assert abs(g.crop_w / g.crop_h - expected[0] / expected[1]) < 0.01


def test_render_vertical_1080(media, tmp_path):
    info, _ = probe(media["landscape_1080"])
    r = render_clip(RenderSpec(media["landscape_1080"], tmp_path / "c.mp4", 5.0, 20.0), info)
    assert (r.width, r.height) == (1080, 1920)
    assert abs(r.duration - 15.0) <= 0.1
    out, raw = probe(r.path)
    assert out.video_codec == "h264" and out.audio_codec == "aac" and out.fps == 30
    v = next(s for s in raw["streams"] if s["codec_type"] == "video")
    assert v["pix_fmt"] == "yuv420p"  # lisible partout (téléphones, navigateurs)


def test_render_720_source_not_upscaled(media, tmp_path):
    info, _ = probe(media["landscape_720"])
    r = render_clip(RenderSpec(media["landscape_720"], tmp_path / "c.mp4", 2.0, 12.0), info)
    assert (r.width, r.height) == (720, 1280)


def test_rotated_phone_video(media, tmp_path):
    info, _ = probe(media["rotated"])
    r = render_clip(RenderSpec(media["rotated"], tmp_path / "c.mp4", 1.0, 6.0), info)
    assert (r.width, r.height) == (1080, 1920)


def test_audio_video_sync(media, tmp_path):
    """Flash et bip à 10,0 s dans la source ; clip 8–14 s → les deux doivent arriver à 2,0 s (± 1 image)."""
    info, _ = probe(media["sync"])
    r = render_clip(RenderSpec(media["sync"], tmp_path / "c.mp4", 8.0, 14.0), info)
    vid = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(r.path), "-vf", "format=gray,signalstats,metadata=print:file=-",
         "-an", "-f", "null", "-"], capture_output=True, text=True, check=True).stdout
    frames = re.findall(r"pts_time:([\d.]+)\s+lavfi.signalstats.YMIN=\d+\s+lavfi.signalstats.YLOW=\d+\s+"
                        r"lavfi.signalstats.YAVG=([\d.]+)", vid)
    flash_t = next(float(t) for t, y in frames if float(y) > 128)
    aud = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(r.path), "-af", "silencedetect=n=-35dB:d=0.05", "-vn", "-f", "null", "-"],
        capture_output=True, text=True).stderr
    beep_t = float(re.search(r"silence_end: ([\d.]+)", aud).group(1))
    assert abs(flash_t - 2.0) <= 0.034, flash_t
    assert abs(beep_t - flash_t) <= 0.04, (beep_t, flash_t)


def test_cut_is_frame_accurate(media, tmp_path):
    """Clip démarrant 0,5 s avant le flash : le flash doit apparaître à 0,5 s."""
    info, _ = probe(media["sync"])
    r = render_clip(RenderSpec(media["sync"], tmp_path / "c.mp4", 9.5, 12.0), info)
    assert frame_luma(r.path, 0.2) < 20
    assert frame_luma(r.path, 0.52) > 200


def test_captions_appear_at_the_right_time(media, tmp_path):
    info, _ = probe(media["black"])
    ass = tmp_path / "s.ass"
    ass.write_text(build_ass([Word("CLIPERA", 1.0, 1.8)], width=1080, height=1920))
    r = render_clip(RenderSpec(media["black"], tmp_path / "c.mp4", 0.0, 4.0, ass_file=ass), info)
    region = "iw:ih*0.1:0:ih*0.68"  # bande basse où sont placés les sous-titres
    before, during, after = (frame_luma(r.path, t, region) for t in (0.5, 1.4, 3.0))
    assert before < 1 and after < 1  # avant / après le mot : rien
    assert during > before + 3  # pendant : texte visible


def test_watermark_visible_in_corner(media, tmp_path):
    info, _ = probe(media["black"])
    r = render_clip(RenderSpec(media["black"], tmp_path / "c.mp4", 0.0, 3.0,
                               watermark_file=ASSETS / "watermark.png"), info)
    assert frame_luma(r.path, 1.0, "iw*0.2:ih*0.12:iw*0.8:0") > 8
    assert frame_luma(r.path, 1.0, "iw*0.2:ih*0.12:0:ih*0.85") < 2


def test_crop_track_moves_frame(media, tmp_path):
    """Le cadre suit le sujet : à gauche au début, à droite à la fin."""
    info, _ = probe(media["landscape_1080"])
    track = (CropKeyframe(0.0, 0.0), CropKeyframe(1.0, 0.0), CropKeyframe(3.0, 1.0), CropKeyframe(4.0, 1.0))
    left = render_clip(RenderSpec(media["landscape_1080"], tmp_path / "l.mp4", 0, 4, max_short_side=360,
                                  crop_track=(CropKeyframe(0, 0.0),)), info)
    right = render_clip(RenderSpec(media["landscape_1080"], tmp_path / "r.mp4", 0, 4, max_short_side=360,
                                   crop_track=(CropKeyframe(0, 1.0),)), info)
    moving = render_clip(RenderSpec(media["landscape_1080"], tmp_path / "m.mp4", 0, 4, max_short_side=360,
                                    crop_track=track), info)
    assert abs(frame_luma(moving.path, 0.5) - frame_luma(left.path, 0.5)) < 3
    assert abs(frame_luma(moving.path, 3.5) - frame_luma(right.path, 3.5)) < 3
    assert abs(frame_luma(left.path, 3.5) - frame_luma(right.path, 3.5)) > 3


def test_invalid_bounds_rejected(media, tmp_path):
    info, _ = probe(media["landscape_1080"])
    for start, end in ((10, 5), (-1, 5), (30, 60)):
        with pytest.raises(JobError) as e:
            render_clip(RenderSpec(media["landscape_1080"], tmp_path / "x.mp4", start, end), info)
        assert e.value.code == "invalid_clip_bounds"
