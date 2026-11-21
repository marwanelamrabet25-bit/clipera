"""Recadrage intelligent : suit le visage de la personne qui parle quand l'image est recadrée (9:16, 1:1).

Méthode (explicable, sans IA payante) :
1. Lecture de l'extrait à 5 images/s en petite résolution, image par image (mémoire constante).
2. Détection des visages (YuNet, modèle OpenCV libre, MIT) avec leurs points de repère (yeux, nez, bouche).
3. Regroupement des visages en « pistes » (une par personne) selon leur position.
4. Activité de la bouche de chaque personne (variation de l'image autour de la bouche d'une image à l'autre) :
   la personne dont la bouche bouge le plus est celle qui parle.
5. Plans : si tout le monde tient dans le cadre → plan d'ensemble ; sinon → cadre sur la personne qui parle,
   plans d'au moins 2 s (pas d'aller-retour), changement de personne = coupe nette, petit déplacement = suivi doux.
6. Repli au centre si la détection est incertaine (peu de visages trouvés) : jamais de cadrage hasardeux.
"""

from __future__ import annotations

import logging
import subprocess
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

from .render import CropKeyframe

log = logging.getLogger("clipera.reframe")

MODEL = Path(__file__).resolve().parents[3] / "assets" / "models" / "face_detection_yunet_2023mar.onnx"
SAMPLE_FPS = 5.0
SAMPLE_WIDTH = 640
MIN_SCORE = 0.75
MIN_FACE_FRACTION = 0.035  # visage d'au moins 3,5 % de la largeur (ignore les visages lointains / affiches)
MIN_PRESENCE = 0.35  # une personne doit être visible sur au moins 35 % des images pour être suivie
MIN_SHOT_S = 2.0  # durée minimale d'un plan (évite les allers-retours)
SWITCH_RATIO = 1.35  # l'autre personne doit être nettement plus active pour changer de plan…
SUSTAIN_S = 1.0  # … et le rester au moins 1 s (un « oui » ou un « exactement » ne fait pas changer de plan)
CUT_S = 0.04  # durée d'une coupe (≈ 1 image)
MAX_KEYFRAMES = 48  # limite raisonnable pour l'expression FFmpeg


@dataclass
class Face:
    cx: float  # centre horizontal normalisé (0..1)
    cy: float
    w: float  # largeur normalisée
    mouth: tuple[int, int, int, int]  # zone de la bouche en pixels (x, y, w, h) dans l'image échantillonnée
    mouth_mean: float = float("nan")  # luminosité moyenne de l'intérieur de la bouche (0..1)


@dataclass
class Track:
    id: int
    xs: list[float] = field(default_factory=list)
    width: float = 0.0
    seen: dict[int, Face] = field(default_factory=dict)  # index d'image → visage
    activity: np.ndarray | None = None

    @property
    def cx(self) -> float:
        return float(np.median(self.xs))

    @property
    def last(self) -> float:
        return self.seen[max(self.seen)].cx


@dataclass
class ReframeResult:
    keyframes: tuple[CropKeyframe, ...]
    mode: str  # "speaker" | "group" | "single" | "center"
    faces_found: float  # part des images avec au moins un visage
    people: int
    switches: int

    def as_dict(self) -> dict:
        return {"mode": self.mode, "faces_found": round(self.faces_found, 2), "people": self.people,
                "switches": self.switches, "keyframes": len(self.keyframes)}


def iter_frames(video: Path, start: float, end: float, *, fps: float = SAMPLE_FPS, width: int = SAMPLE_WIDTH):
    """Images de l'extrait [start, end] à `fps` images/s (BGR, largeur `width`), lues une par une : la mémoire
    utilisée reste constante quelle que soit la durée du clip."""
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
         "-of", "csv=p=0:s=x", str(video)], capture_output=True, text=True, check=True, timeout=30)
    w, h = (int(v) for v in probe.stdout.strip().splitlines()[0].split("x")[:2])
    out_h = max(2, int(round(width * h / w / 2)) * 2)
    size = width * out_h * 3
    proc = subprocess.Popen(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{start:.3f}", "-t", f"{end - start:.3f}",
         "-i", str(video), "-vf", f"fps={fps},scale={width}:{out_h}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
        stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    try:
        while True:
            buf = proc.stdout.read(size)
            if len(buf) < size:
                break
            yield np.frombuffer(buf, np.uint8).reshape(out_h, width, 3)
    finally:
        proc.stdout.close()
        proc.kill()
        proc.wait()


class FaceDetector:
    def __init__(self, model: Path = MODEL):
        import cv2

        cv2.utils.logging.setLogLevel(cv2.utils.logging.LOG_LEVEL_ERROR)
        self._cv2 = cv2
        self._det = cv2.FaceDetectorYN.create(str(model), "", (320, 320), MIN_SCORE, 0.3, 50)

    def detect(self, frame: np.ndarray) -> list[Face]:
        h, w = frame.shape[:2]
        self._det.setInputSize((w, h))
        _, rows = self._det.detect(frame)
        faces = []
        for r in rows if rows is not None else []:
            x, y, fw, fh = (float(v) for v in r[:4])
            if fw / w < MIN_FACE_FRACTION:
                continue
            # Points 4 et 5 : coins de la bouche → zone de la bouche, un peu élargie vers le menton.
            mx1, my1, mx2, my2 = r[10], r[11], r[12], r[13]
            mw = max(abs(mx2 - mx1) * 1.6, fw * 0.3)
            mcx, mcy = (mx1 + mx2) / 2, (my1 + my2) / 2
            box = (int(max(0, mcx - mw / 2)), int(max(0, mcy - mw * 0.35)), int(mw), int(mw * 0.7))
            bx, by, bw, bh = box
            inner = frame[by + bh // 6:by + bh - bh // 6, bx + bw // 5:bx + bw - bw // 5]
            mean = float(inner.mean()) / 255.0 if inner.size else float("nan")
            faces.append(Face(cx=(x + fw / 2) / w, cy=(y + fh / 2) / h, w=fw / w, mouth=box, mouth_mean=mean))
        return faces


def build_tracks(detections: list[list[Face]]) -> list[Track]:
    """Associe les visages d'une image à l'autre selon leur position horizontale."""
    tracks: list[Track] = []
    for i, faces in enumerate(detections):
        for f in sorted(faces, key=lambda f: -f.w):
            # Comparaison avec la DERNIÈRE position connue : une personne qui se déplace reste la même piste.
            free = [t for t in tracks if i not in t.seen]
            best = min(free, key=lambda t: abs(t.last - f.cx), default=None)
            if best is not None and abs(best.last - f.cx) < max(0.08, best.width * 0.9):
                tr = best
            else:
                tr = Track(id=len(tracks))
                tracks.append(tr)
            tr.xs.append(f.cx)
            tr.width = max(tr.width, f.w)
            tr.seen[i] = f
    n = max(len(detections), 1)
    return [t for t in tracks if len(t.seen) / n >= MIN_PRESENCE]


def mouth_activity(n_frames: int, track: Track) -> np.ndarray:
    """Activité de la bouche à chaque image (0 si le visage n'est pas visible).

    Mesure : variation de la luminosité MOYENNE de l'intérieur de la bouche (elle s'ouvre et s'assombrit quand on
    parle). Une moyenne est peu sensible aux petits mouvements de tête, contrairement à une comparaison pixel à
    pixel. Écart-type glissant sur ~1,2 s : mesure l'amplitude du mouvement quel que soit son rythme (les syllabes,
    3 à 6 par seconde, sont plus rapides que l'échantillonnage : on ne compare donc pas image à image).
    """
    means = np.full(n_frames, np.nan, dtype=np.float32)
    for i, f in track.seen.items():
        means[i] = f.mouth_mean
    half = int(SAMPLE_FPS * 0.6)
    act = np.zeros(n_frames, dtype=np.float32)
    for i in range(n_frames):
        win = means[max(0, i - half):i + half + 1]
        win = win[~np.isnan(win)]
        act[i] = float(win.std() * 100) if len(win) >= 3 else 0.0
    return act


Shot = tuple[float, float, "Track | None", float]  # (début, fin, personne suivie, centre si cadre fixe)


def plan_shots(tracks: list[Track], times: list[float], duration: float, crop_fraction: float
               ) -> tuple[list[Shot], str, int]:
    """Plans à partir des pistes et de l'activité des bouches."""
    if not tracks:
        return [(0.0, duration, None, 0.5)], "center", 0
    left = min(t.cx - t.width / 2 for t in tracks)
    right = max(t.cx + t.width / 2 for t in tracks)
    if len(tracks) > 1 and right - left <= crop_fraction * 0.9:
        return [(0.0, duration, None, (left + right) / 2)], "group", 0
    if len(tracks) == 1:
        return [(0.0, duration, tracks[0], tracks[0].cx)], "single", 0

    acts = np.stack([t.activity for t in tracks])  # (personnes, images)
    # Le clip s'ouvre sur la personne qui parle AU DÉBUT (et non sur celle qui parle le plus dans tout le clip).
    opening = max(1, int(SAMPLE_FPS * 1.5))
    current = int(np.argmax(acts[:, :opening].mean(axis=1)))
    bounds: list[list[float]] = [[0.0, 0.0, float(current)]]
    shot_start = 0.0
    run_who, run_start = None, 0.0  # personne qui domine actuellement, et depuis quand
    for i, t in enumerate(times):
        best = int(np.argmax(acts[:, i]))
        dominant = best != current and acts[best, i] > SWITCH_RATIO * max(acts[current, i], 1e-3)
        if not dominant:
            run_who = None
            continue
        if run_who != best:
            run_who, run_start = best, t
        if t - run_start >= SUSTAIN_S and run_start - shot_start >= MIN_SHOT_S:
            # Coupe placée au début de la prise de parole (pas avec 1 s de retard).
            bounds[-1][1] = run_start
            bounds.append([run_start, 0.0, float(best)])
            current, shot_start, run_who = best, run_start, None
    bounds[-1][1] = duration
    if len(bounds) > 1 and bounds[-1][1] - bounds[-1][0] < MIN_SHOT_S:  # dernier plan trop court : fusion
        bounds[-2][1] = bounds[-1][1]
        bounds.pop()
    shots = [(s, e, tracks[int(p)], tracks[int(p)].cx) for s, e, p in bounds]
    return shots, "speaker", len(shots) - 1


FOLLOW_DEADZONE = 0.05  # en dessous de ce déplacement (5 % de la largeur), le cadre ne bouge pas
FOLLOW_STEP_S = 1.0


def _path(shot: Shot, times: list[float]) -> list[tuple[float, float]]:
    """Positions (instant, centre) à suivre pendant un plan : fixe si la personne bouge peu, sinon suivi lissé."""
    s, e, track, cx = shot
    if track is None:
        return [(s, cx)]
    pts = [(times[i], f.cx) for i, f in sorted(track.seen.items()) if s <= times[i] <= e]
    if len(pts) < 3:
        return [(s, cx)]
    xs = np.array([x for _, x in pts])
    k = 7  # médiane glissante ~1,4 s : ignore les détections isolées et les petits mouvements
    pad = np.pad(xs, (k // 2, k // 2), mode="edge")
    smooth = np.array([np.median(pad[i:i + k]) for i in range(len(xs))])
    if smooth.max() - smooth.min() < FOLLOW_DEADZONE:
        return [(s, float(np.median(xs)))]
    out = [(s, float(smooth[0]))]
    for (t, _), x in zip(pts, smooth, strict=False):
        if t - out[-1][0] >= FOLLOW_STEP_S and abs(x - out[-1][1]) >= FOLLOW_DEADZONE / 2:
            out.append((t, float(x)))
    return out


def shots_to_keyframes(shots: list[Shot], times: list[float]) -> tuple[CropKeyframe, ...]:
    """Plans → images clés : suivi doux pendant un plan, coupe nette (≈ 1 image) au changement de personne."""
    keys: list[CropKeyframe] = []
    for i, shot in enumerate(shots):
        path = _path(shot, times)
        if i > 0:
            keys.append(CropKeyframe(round(max(shot[0] - CUT_S, keys[-1].t + 1e-3), 3), keys[-1].cx))
        for t, x in path:
            t = round(max(t, keys[-1].t + 1e-3) if keys else t, 3)
            keys.append(CropKeyframe(t, x))
    keys.append(CropKeyframe(round(max(shots[-1][1], keys[-1].t + 1e-3), 3), keys[-1].cx))
    if len(keys) > MAX_KEYFRAMES:  # garde-fou (clip très long et très agité) : on simplifie la trajectoire
        step = len(keys) / (MAX_KEYFRAMES - 1)
        keys = [keys[int(i * step)] for i in range(MAX_KEYFRAMES - 1)] + [keys[-1]]
    return tuple(keys)


def reframe(video: Path, start: float, end: float, *, crop_fraction: float,
            detector: FaceDetector | None = None) -> ReframeResult:
    """Trajectoire de cadrage pour l'extrait. crop_fraction = largeur du cadre / largeur de l'image source."""
    duration = round(end - start, 3)
    if crop_fraction >= 0.98:  # rien à recadrer horizontalement
        return ReframeResult((), "center", 0.0, 0, 0)
    det = detector or FaceDetector()
    detections = [det.detect(f) for f in iter_frames(video, start, end)]
    if not detections:
        return ReframeResult((), "center", 0.0, 0, 0)
    times = [i / SAMPLE_FPS for i in range(len(detections))]
    found = sum(1 for d in detections if d) / len(detections)
    if found < 0.4:
        return ReframeResult((), "center", found, 0, 0)  # détection incertaine → centre
    tracks = build_tracks(detections)
    for tr in tracks:
        tr.activity = mouth_activity(len(detections), tr)
    shots, mode, switches = plan_shots(tracks, times, duration, crop_fraction)
    if mode == "center":
        return ReframeResult((), "center", found, 0, 0)
    return ReframeResult(shots_to_keyframes(shots, times), mode, found, len(tracks), switches)
