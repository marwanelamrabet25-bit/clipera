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


SD_MATRICES = {"smpte170m", "bt470bg", "bt601"}


def color_chain(info: VideoInfo) -> str:
    """Conversion couleur adaptée à la source, appliquée APRÈS le recadrage (moins de pixels à traiter).

    - HDR (iPhone HLG, PQ) : conversion en SDR BT.709, méthode choisie par mesure pour chaque format ; sinon les
      couleurs seraient délavées ou saturées et la vidéo marquée HDR en 8 bits (combinaison invalide).
    - SD ancienne (matrice BT.601) : conversion vers BT.709.
    - Sinon : aucune conversion (évite tout décalage de couleur).
    """
    if info.color_transfer == "arib-std-b67":
        # HLG (iPhone) : conçu pour rester compatible SDR → conversion directe (mesuré : écart moyen 0,9/255 avec
        # l'image de référence, contre 41 avec un « tone mapping » hable qui assombrit fortement).
        return "zscale=t=bt709:p=bt709:m=bt709:r=tv,format=yuv420p,"
    if info.color_transfer == "smpte2084":
        # PQ (caméras, certains Android) : vraie compression des hautes lumières (mobius : écart 7/255).
        return ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=mobius:desat=0,"
                "zscale=t=bt709:m=bt709:r=tv,format=yuv420p,")
    if info.color_space in SD_MATRICES:
        return "colorspace=all=bt709:iall=bt601-6-625:fast=1,"
    return ""


# Débit maximal par résolution : évite les fichiers énormes sur les sources bruitées (mesuré : −41 % de poids,
# perte invisible) sans rien changer sur une source propre (le CRF reste le réglage principal).
MAXRATE = {1080: "10M", 720: "6M"}


def build_command(spec: RenderSpec, info: VideoInfo) -> list[str]:
    if spec.end <= spec.start or spec.start < 0 or spec.end > info.duration_seconds + 0.05:
        raise JobError("invalid_clip_bounds", "Les limites du clip sont invalides.",
                       detail=f"{spec.start}-{spec.end} / {info.duration_seconds}")
    g = compute_geometry(info.width, info.height, spec.aspect, spec.max_short_side)
    xs = _axis_expr([(k.t, k.cx) for k in spec.crop_track], info.width, g.crop_w)
    ys = _axis_expr([(k.t, k.cy) for k in spec.crop_track], info.height, g.crop_h)

    v = (f"[0:v]crop=w={g.crop_w}:h={g.crop_h}:x='{xs}':y='{ys}',{color_chain(info)}"
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

    short = min(g.out_w, g.out_h)
    crf = "20" if short >= 1080 else "21"
    maxrate = MAXRATE[1080] if short >= 1080 else MAXRATE[720]
    bufsize = f"{int(maxrate[:-1]) * 2}M"
    return [
        *inputs,
        "-filter_complex", f"{v};{a}",
        "-map", "[v]", "-map", "[a]",
        "-t", f"{d:.3f}",
        "-fpsmax", "60",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", crf, "-maxrate", maxrate, "-bufsize", bufsize,
        "-profile:v", "high", "-pix_fmt", "yuv420p",
        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
        "-c:a", "aac", "-b:a", "160k", "-ac", "2",
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
    """Vérifie le fichier produit AVANT de le déclarer terminé : lisible, dimensions, durée, son présent et
    synchronisé (durées audio et vidéo identiques à 0,1 s), couleurs étiquetées, image pas majoritairement noire."""
    out, raw = probe(spec.output)
    problems = []
    if (out.width, out.height) != (g.out_w, g.out_h):
        problems.append(f"dims {out.width}x{out.height} != {g.out_w}x{g.out_h}")
    if abs(out.duration_seconds - spec.duration) > 0.15:
        problems.append(f"duration {out.duration_seconds} != {spec.duration}")
    if not out.has_audio:
        problems.append("no audio")
    if out.video_codec != "h264":
        problems.append(f"codec {out.video_codec}")
    durations = {s["codec_type"]: float(s.get("duration") or 0) for s in raw.get("streams", [])}
    if durations.get("audio") and durations.get("video") and abs(durations["audio"] - durations["video"]) > 0.1:
        problems.append(f"a/v desync {durations['audio']:.3f} vs {durations['video']:.3f}")
    if out.color_primaries != "bt709" or out.color_transfer != "bt709":
        problems.append(f"color tags {out.color_primaries}/{out.color_transfer}")
    black = black_ratio(spec.output, out.duration_seconds)
    if black > 0.5:
        # Noir dans le clip : erreur de rendu seulement si la source n'est pas elle-même sombre à cet endroit.
        src_black = black_ratio(spec.source, spec.duration, start=spec.start)
        if src_black < black - 0.3:
            problems.append(f"black frames {black:.0%} (source {src_black:.0%})")
    if problems:
        raise JobError("render_qc_failed", "Le clip produit n'a pas passé le contrôle qualité.",
                       detail="; ".join(problems))
    return RenderResult(spec.output, out.width, out.height, out.duration_seconds, out.size_bytes)


def black_ratio(path: Path, duration: float, *, start: float = 0.0) -> float:
    """Part de la durée [start, start + duration] occupée par une image noire."""
    import re
    import subprocess

    proc = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-ss", f"{start:.3f}", "-t", f"{duration:.3f}", "-i", str(path),
         "-vf", "fps=5,blackdetect=d=0.4:pix_th=0.08",
         "-an", "-f", "null", "-"], capture_output=True, text=True, timeout=max(60.0, duration * 2))
    total = sum(float(m) for m in re.findall(r"black_duration:([0-9.]+)", proc.stderr))
    return total / duration if duration > 0 else 0.0
