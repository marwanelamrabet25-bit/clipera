"""Rendu d'un clip : découpe précise, recadrage, sous-titres, filigrane, audio normalisé, contrôle qualité.

Règle de résolution (« ne pas agrandir artificiellement ») : le petit côté de la sortie vaut
min(limite de l'offre, petit côté de la source). Une source 720p sort donc en 720×1280, jamais en « 1080p ».
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

from ..errors import JobError
from .ffmpeg import ffmpeg
from .probe import VideoInfo, probe

Aspect = Literal["9:16", "1:1", "16:9"]
_RATIO = {"9:16": (9, 16), "1:1": (1, 1), "16:9": (16, 9)}


def _even(x: float) -> int:
    return max(2, int(round(x / 2)) * 2)


@dataclass(frozen=True)
class CropKeyframe:
    t: float  # secondes relatives au clip
    cx: float  # centre horizontal normalisé 0..1 dans l'image source
    cy: float = 0.5


@dataclass(frozen=True)
class RenderSpec:
    source: Path
    output: Path
    start: float
    end: float
    aspect: Aspect = "9:16"
    max_short_side: int = 1080
    crop_track: tuple[CropKeyframe, ...] = ()
    ass_file: Path | None = None
    fonts_dir: Path | None = None
    watermark_file: Path | None = None
    normalize_audio: bool = True
    extra: dict = field(default_factory=dict)

    @property
    def duration(self) -> float:
        return round(self.end - self.start, 3)


@dataclass(frozen=True)
class Geometry:
    crop_w: int
    crop_h: int
    out_w: int
    out_h: int


def compute_geometry(src_w: int, src_h: int, aspect: Aspect, max_short_side: int) -> Geometry:
    rw, rh = _RATIO[aspect]
    ar = rw / rh
    if src_w / src_h > ar:
        crop_h, crop_w = _even(src_h), _even(src_h * ar)
    else:
        crop_w, crop_h = _even(src_w), _even(src_w / ar)
    crop_w, crop_h = min(crop_w, src_w - src_w % 2), min(crop_h, src_h - src_h % 2)
    short = min(max_short_side, min(src_w, src_h))
    if rw <= rh:
        out_w, out_h = _even(short), _even(short * rh / rw)
    else:
        out_h, out_w = _even(short), _even(short * rw / rh)
    return Geometry(crop_w, crop_h, out_w, out_h)


def _axis_expr(keys: list[tuple[float, float]], src: int, crop: int) -> str:
    """Expression FFmpeg linéaire par morceaux pour la position du cadre (en pixels, bornée)."""
    if src == crop:
        return "0"
    lo, hi = 0, src - crop

    def px(c: float) -> float:
        return round(min(max(c * src - crop / 2, lo), hi), 2)

    if not keys:
        return str(round(hi / 2, 2))
    pts = [(t, px(c)) for t, c in sorted(keys)]
    expr = str(pts[-1][1])
    for (t0, x0), (t1, x1) in reversed(list(zip(pts, pts[1:], strict=False))):
        seg = f"{x0}+({x1 - x0})*(t-{t0})/{max(t1 - t0, 1e-3)}" if x1 != x0 else f"{x0}"
        expr = f"if(lt(t,{t1}),{seg},{expr})"
    return f"if(lt(t,{pts[0][0]}),{pts[0][1]},{expr})"


def _filter_path(p: Path) -> str:
    return str(p).replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'")


def build_command(spec: RenderSpec, info: VideoInfo) -> list[str]:
    if spec.end <= spec.start or spec.start < 0 or spec.end > info.duration_seconds + 0.05:
        raise JobError("invalid_clip_bounds", "Les limites du clip sont invalides.",
                       detail=f"{spec.start}-{spec.end} / {info.duration_seconds}")
    g = compute_geometry(info.width, info.height, spec.aspect, spec.max_short_side)
    xs = _axis_expr([(k.t, k.cx) for k in spec.crop_track], info.width, g.crop_w)
    ys = _axis_expr([(k.t, k.cy) for k in spec.crop_track], info.height, g.crop_h)

    v = (f"[0:v]crop=w={g.crop_w}:h={g.crop_h}:x='{xs}':y='{ys}',"
         f"scale={g.out_w}:{g.out_h}:flags=lanczos,setsar=1,format=yuv420p")
    if spec.ass_file:
        v += f",subtitles=filename='{_filter_path(spec.ass_file)}'"
        if spec.fonts_dir:
            v += f":fontsdir='{_filter_path(spec.fonts_dir)}'"
    inputs = ["-ss", f"{spec.start:.3f}", "-i", str(spec.source)]
    if spec.watermark_file:
        inputs += ["-i", str(spec.watermark_file)]
        wm_w = _even(g.out_w * 0.11)
        margin = _even(g.out_w * 0.04)
        v += (f"[base];[1:v]scale={wm_w}:-1,format=rgba,colorchannelmixer=aa=0.7[wm];"
              f"[base][wm]overlay=W-w-{margin}:{margin}:format=auto,format=yuv420p")
    v += "[v]"

    d = spec.duration
    a = f"[0:a:0]afade=t=in:st=0:d=0.06,afade=t=out:st={max(d - 0.18, 0):.3f}:d=0.18"
    if spec.normalize_audio:
        a += ",loudnorm=I=-14:TP=-1.5:LRA=11"
    a += ",aresample=48000[a]"

    crf = "20" if min(g.out_w, g.out_h) >= 1080 else "21"
    return [
        *inputs,
        "-filter_complex", f"{v};{a}",
        "-map", "[v]", "-map", "[a]",
        "-t", f"{d:.3f}",
        "-fpsmax", "60",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", crf, "-profile:v", "high",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-ac", "2",
        "-movflags", "+faststart",
        str(spec.output),
    ]


@dataclass(frozen=True)
class RenderResult:
    path: Path
    width: int
    height: int
    duration: float
    size_bytes: int


def render_clip(spec: RenderSpec, info: VideoInfo, *, timeout: float | None = None) -> RenderResult:
    cmd = build_command(spec, info)
    ffmpeg(cmd, timeout=timeout or max(120.0, spec.duration * 6),
           error_code="render_failed", user_message="Le montage de ce clip a échoué.")
    return quality_check(spec, compute_geometry(info.width, info.height, spec.aspect, spec.max_short_side))


def quality_check(spec: RenderSpec, g: Geometry) -> RenderResult:
    """Vérifie le fichier produit : lisible, bonnes dimensions, bonne durée, son présent."""
    out, _ = probe(spec.output)
    problems = []
    if (out.width, out.height) != (g.out_w, g.out_h):
        problems.append(f"dims {out.width}x{out.height} != {g.out_w}x{g.out_h}")
    if abs(out.duration_seconds - spec.duration) > 0.15:
        problems.append(f"duration {out.duration_seconds} != {spec.duration}")
    if not out.has_audio:
        problems.append("no audio")
    if out.video_codec != "h264":
        problems.append(f"codec {out.video_codec}")
    if problems:
        raise JobError("render_qc_failed", "Le clip produit n'a pas passé le contrôle qualité.",
                       detail="; ".join(problems))
    return RenderResult(spec.output, out.width, out.height, out.duration_seconds, out.size_bytes)
