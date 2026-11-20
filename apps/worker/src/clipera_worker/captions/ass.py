"""Génération de sous-titres ASS (incrustés par libass) à partir des mots horodatés.

Principes « montage naturel » : lignes courtes (≤ 3–4 mots), taille modérée, placées au-dessus de la zone
d'interface des applications, synchronisation au mot près.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

CaptionStyle = Literal["classic", "highlight", "modern", "minimal"]
Position = Literal["bottom", "middle", "top"]

PUNCT_BREAK = (".", "!", "?", "…", ":", ";")


@dataclass(frozen=True)
class Word:
    text: str
    start: float  # secondes, relatives au début du clip
    end: float


@dataclass(frozen=True)
class CaptionOptions:
    style: CaptionStyle = "classic"
    position: Position = "bottom"
    font: str = "Inter"
    size_scale: float = 1.0  # 0.7 – 1.4
    text_color: str = "#FFFFFF"
    highlight_color: str = "#A78BFA"
    background: bool = False
    uppercase: bool | None = None  # None → selon le style
    max_words_per_line: int | None = None
    extra: dict = field(default_factory=dict)


# Taille de base en fraction de la hauteur de l'image, par style.
_BASE = {
    "classic": dict(size=0.034, bold=True, outline=0.0030, shadow=0.0, upper=False, words=4),
    "highlight": dict(size=0.036, bold=True, outline=0.0032, shadow=0.0, upper=False, words=3),
    "modern": dict(size=0.040, bold=True, outline=0.0036, shadow=0.0012, upper=True, words=3),
    "minimal": dict(size=0.028, bold=False, outline=0.0, shadow=0.0016, upper=False, words=5),
}


def _ass_color(hex_rgb: str, alpha: int = 0) -> str:
    h = hex_rgb.lstrip("#")
    if len(h) != 6:
        raise ValueError(f"couleur invalide : {hex_rgb}")
    r, g, b = h[0:2], h[2:4], h[4:6]
    return f"&H{alpha:02X}{b}{g}{r}".upper()


def _ts(seconds: float) -> str:
    cs = max(0, round(seconds * 100))
    h, rem = divmod(cs, 360000)
    m, rem = divmod(rem, 6000)
    s, cs = divmod(rem, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def _escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("{", "(").replace("}", ")").replace("\n", " ")


def group_lines(words: list[Word], *, max_words: int, max_chars: int = 26,
                max_duration: float = 2.6, max_gap: float = 0.6) -> list[list[Word]]:
    """Découpe les mots en lignes lisibles : coupe sur ponctuation, silence, longueur ou durée."""
    lines: list[list[Word]] = []
    cur: list[Word] = []
    for w in words:
        if not w.text.strip():
            continue
        if cur:
            chars = sum(len(x.text) + 1 for x in cur) + len(w.text)
            too_long = len(cur) >= max_words or chars > max_chars or (w.end - cur[0].start) > max_duration
            gap = (w.start - cur[-1].end) > max_gap
            punct = cur[-1].text.endswith(PUNCT_BREAK)
            if too_long or gap or punct:
                lines.append(cur)
                cur = []
        cur.append(w)
    if cur:
        lines.append(cur)
    return lines


def build_ass(words: list[Word], *, width: int, height: int, opts: CaptionOptions = CaptionOptions()) -> str:
    base = _BASE[opts.style]
    scale = min(max(opts.size_scale, 0.7), 1.4)
    size = round(height * base["size"] * scale)
    outline = round(height * base["outline"], 1)
    shadow = round(height * base["shadow"], 1)
    upper = base["upper"] if opts.uppercase is None else opts.uppercase
    align = {"bottom": 2, "middle": 5, "top": 8}[opts.position]
    margin_v = {"bottom": round(height * 0.24), "middle": 0, "top": round(height * 0.12)}[opts.position]
    margin_h = round(width * 0.08)

    primary = _ass_color(opts.text_color)
    if opts.background:
        border_style, outline_col, back_col, outline = 3, _ass_color("#0B0B10", 0x50), _ass_color("#0B0B10", 0x50), \
            round(height * 0.006, 1)
    else:
        border_style, outline_col, back_col = 1, _ass_color("#000000", 0x00), _ass_color("#000000", 0x90)

    header = "\n".join([
        "[Script Info]",
        "ScriptType: v4.00+",
        f"PlayResX: {width}",
        f"PlayResY: {height}",
        "WrapStyle: 0",
        "ScaledBorderAndShadow: yes",
        "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, "
        "Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, "
        "Alignment, MarginL, MarginR, MarginV, Encoding",
        f"Style: Main,{opts.font},{size},{primary},{primary},{outline_col},{back_col},"
        f"{-1 if base['bold'] else 0},0,0,0,100,100,0,0,{border_style},{outline},{shadow},"
        f"{align},{margin_h},{margin_h},{margin_v},1",
        "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ])

    max_words = opts.max_words_per_line or base["words"]
    hl = _ass_color(opts.highlight_color)
    events: list[str] = []
    lines = group_lines(words, max_words=max_words)
    for i, line in enumerate(lines):
        start = line[0].start
        # On prolonge légèrement la ligne (≤ 0,3 s) sans chevaucher la suivante.
        nxt = lines[i + 1][0].start if i + 1 < len(lines) else line[-1].end + 0.3
        end = min(line[-1].end + 0.3, nxt)
        texts = [_escape(w.text.upper() if upper else w.text) for w in line]
        if opts.style in ("highlight", "modern"):
            # Un événement par mot : le mot prononcé est mis en couleur.
            for k, w in enumerate(line):
                seg_start = start if k == 0 else w.start
                seg_end = line[k + 1].start if k + 1 < len(line) else end
                if seg_end <= seg_start:
                    continue
                parts = [f"{{\\c{hl}}}{t}{{\\c{primary}}}" if j == k else t for j, t in enumerate(texts)]
                events.append(f"Dialogue: 0,{_ts(seg_start)},{_ts(seg_end)},Main,,0,0,0,,{' '.join(parts)}")
        else:
            events.append(f"Dialogue: 0,{_ts(start)},{_ts(end)},Main,,0,0,0,,{' '.join(texts)}")
    return header + "\n" + "\n".join(events) + "\n"
