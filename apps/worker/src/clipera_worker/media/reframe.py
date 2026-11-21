"""Recadrage intelligent quand l'image est recadrée (9:16, 1:1). Trois comportements :

- **stable** (par défaut) : un cadrage propre choisi au début de chaque plan de la source, conservé tant qu'il
  n'y a pas de vraie raison d'en changer (changement de caméra, autre personne qui parle longtemps, personne sur
  le point de sortir du cadre). Mouvements rares.
- **speaker** : privilégie la personne qui parle (changements confirmés en 1 s, plans ≥ 2 s, suivi doux).
- **wide** : aucune découpe, toute la scène visible (géré au rendu : image entière sur fond flouté).

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
SCENE_CUT = 0.45  # écart d'histogramme entre deux images au-delà duquel la source change de plan / de caméra
MIN_SCENE_S = 1.0
MAX_SPEED = 0.12  # vitesse max du cadre (part de la largeur par seconde) : jamais de « coup de caméra » brusque
EDGE_MARGIN = 0.01
HEAD_SCALE = 1.6  # le détecteur mesure le visage ; la tête (cheveux, oreilles) est ~1,6× plus large


@dataclass(frozen=True)
class Profile:
    min_shot_s: float
    sustain_s: float
    switch_ratio: float
    follow: str  # "smooth" : suit dès 5 % de déplacement ; "safe" : seulement si la personne va sortir du cadre


PROFILES = {
    "speaker": Profile(MIN_SHOT_S, SUSTAIN_S, SWITCH_RATIO, "smooth"),
    "stable": Profile(5.0, 3.5, 1.6, "safe"),  # une réplique de 3 s ne déplace pas le cadre
}
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
    mode: str  # "speaker" | "group" | "single" | "center" | "mixed" (plusieurs plans de source différents)
    faces_found: float  # part des images avec au moins un visage
    people: int
    switches: int
    profile: str = "stable"
    scenes: int = 1
    moves_per_min: float = 0.0  # changements de cadrage par minute (indicateur de stabilité)

    def as_dict(self) -> dict:
        return {"mode": self.mode, "profile": self.profile, "faces_found": round(self.faces_found, 2),
                "people": self.people, "switches": self.switches, "scenes": self.scenes,
                "moves_per_min": round(self.moves_per_min, 1), "keyframes": len(self.keyframes)}


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


def frame_signature(frame: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Résumé d'une image : histogramme de luminosité + vignette 64×36 en niveaux de gris."""
    import cv2

    g = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    h = cv2.calcHist([g], [0], None, [32], [0, 256]).ravel()
    thumb = cv2.resize(g, (64, 36), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
    return h / max(h.sum(), 1.0), thumb


def scene_bounds(sigs: list[tuple[np.ndarray, np.ndarray]]) -> list[int]:
    """Indices de début de chaque plan de la source.

    Deux signaux : (1) l'histogramme de luminosité change fortement (autre décor, autre éclairage) ; (2) la
    différence entre deux images successives fait un SAUT par rapport à son niveau habituel dans la vidéo
    (même décor filmé par une autre caméra : gros plan après plan large). Un mouvement normal ne crée pas de saut.
    """
    starts = [0]
    min_len = int(MIN_SCENE_S * SAMPLE_FPS)
    diffs = [0.0] + [float(np.abs(sigs[i][1] - sigs[i - 1][1]).mean()) for i in range(1, len(sigs))]
    for i in range(1, len(sigs)):
        hist_jump = 0.5 * float(np.abs(sigs[i][0] - sigs[i - 1][0]).sum()) > SCENE_CUT
        recent = diffs[max(1, i - 10):i] or [0.0]
        baseline = max(float(np.median(recent)), 0.004)
        pixel_jump = diffs[i] > 0.035 and diffs[i] > 6 * baseline
        if (hist_jump or pixel_jump) and i - starts[-1] >= min_len:
            starts.append(i)
    return starts


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


def visible(track: Track, cx: float, crop: float) -> float:
    """Part du visage `track` visible dans un cadre centré en cx (0 = hors cadre, 1 = entièrement visible)."""
    w = track.width * HEAD_SCALE
    lo, hi = track.cx - w / 2, track.cx + w / 2
    return max(0.0, min(hi, cx + crop / 2) - max(lo, cx - crop / 2)) / max(w, 1e-6)


def compose(cx: float, target: Track | None, tracks: list[Track], crop: float) -> float:
    """Ajuste le cadre pour ne JAMAIS laisser un visage à moitié coupé sur le bord : on décale juste assez pour
    l'exclure entièrement, ou pour l'inclure entièrement si les deux tiennent, en gardant la personne principale
    entière. Si aucune solution n'existe, le cadre reste tel quel."""
    for _ in range(3):
        cut = [o for o in tracks if o is not target and 0.02 < visible(o, cx, crop) < 0.98]
        if not cut:
            return cx
        o = cut[0]
        options = []
        ow = o.width * HEAD_SCALE / 2
        if o.cx > cx:  # tête coupée à droite → décaler à gauche pour l'exclure
            options.append(o.cx - ow - crop / 2 - EDGE_MARGIN)
        else:
            options.append(o.cx + ow + crop / 2 + EDGE_MARGIN)
        keep = [t for t in tracks if t is target or visible(t, cx, crop) >= 0.98] + [o]
        left = min(t.cx - t.width * HEAD_SCALE / 2 for t in keep)
        right = max(t.cx + t.width * HEAD_SCALE / 2 for t in keep)
        if right - left <= crop - 2 * EDGE_MARGIN:  # ou l'inclure entièrement
            options.append((left + right) / 2)

        def ok(c: float) -> bool:
            return target is None or visible(target, c, crop) >= 0.95

        valid = [c for c in options if ok(c)]
        if not valid:
            return cx
        cx = min(valid, key=lambda c: abs(c - cx))
    return cx


def plan_shots(tracks: list[Track], times: list[float], duration: float, crop_fraction: float,
               profile: Profile = PROFILES["speaker"]) -> tuple[list[Shot], str, int]:
    """Plans à partir des pistes et de l'activité des bouches."""
    if not tracks:
        return [(0.0, duration, None, 0.5)], "center", 0
    left = min(t.cx - t.width / 2 for t in tracks)
    right = max(t.cx + t.width / 2 for t in tracks)
    if len(tracks) > 1 and right - left <= crop_fraction * 0.9:
        return [(0.0, duration, None, (left + right) / 2)], "group", 0
    if len(tracks) == 1:
        return [(0.0, duration, tracks[0], compose(tracks[0].cx, tracks[0], tracks, crop_fraction))], "single", 0

    acts = np.stack([t.activity for t in tracks])  # (personnes, images)
    # Le clip s'ouvre sur la personne qui parle AU DÉBUT (et non sur celle qui parle le plus dans tout le clip).
    opening = max(1, int(SAMPLE_FPS * 1.5))
    current = int(np.argmax(acts[:, :opening].mean(axis=1)))
    bounds: list[list[float]] = [[0.0, 0.0, float(current)]]
    shot_start = 0.0
    run_who, run_start = None, 0.0  # personne qui domine actuellement, et depuis quand
    for i, t in enumerate(times):
        best = int(np.argmax(acts[:, i]))
        dominant = best != current and acts[best, i] > profile.switch_ratio * max(acts[current, i], 1e-3)
        if not dominant:
            run_who = None
            continue
        if run_who != best:
            run_who, run_start = best, t
        cut = max(run_start, shot_start + profile.min_shot_s)
        if t - run_start >= profile.sustain_s and t >= cut:
            # Coupe au début de la prise de parole (pas avec 1 s de retard), mais jamais avant la durée minimale
            # du plan en cours : un changement durable finit toujours par être suivi.
            bounds[-1][1] = cut
            bounds.append([cut, 0.0, float(best)])
            current, shot_start, run_who = best, cut, None
    bounds[-1][1] = duration
    if len(bounds) > 1 and bounds[-1][1] - bounds[-1][0] < profile.min_shot_s:  # dernier plan trop court : fusion
        bounds[-2][1] = bounds[-1][1]
        bounds.pop()
    shots = [(s, e, tracks[int(p)], compose(tracks[int(p)].cx, tracks[int(p)], tracks, crop_fraction))
             for s, e, p in bounds]
    return shots, "speaker", len(shots) - 1


FOLLOW_DEADZONE = 0.05  # mode « speaker » : en dessous de ce déplacement (5 % de la largeur), le cadre ne bouge pas
FOLLOW_STEP_S = 1.0


def _limit_speed(points: list[tuple[float, float]]) -> list[tuple[float, float]]:
    """Plafonne la vitesse du cadre (MAX_SPEED) : un déplacement important devient un mouvement lent et régulier."""
    out = [points[0]]
    for t, x in points[1:]:
        t0, x0 = out[-1]
        step = MAX_SPEED * max(t - t0, 1e-3)
        out.append((t, x0 + max(-step, min(step, x - x0))))
    return out


def _path(shot: Shot, times: list[float], *, crop: float = 1.0, follow: str = "smooth",
          tracks: list[Track] | None = None) -> list[tuple[float, float]]:
    """Positions (instant, centre) pendant un plan.

    - « smooth » : fixe si la personne bouge de moins de 5 %, sinon suivi lissé (médiane ~1,4 s).
    - « safe » (mode stable) : le cadre ne bouge que si la personne s'approche du bord au point de risquer d'être
      coupée ; il se recentre alors lentement. Un mouvement de tête ou une personne qui se penche ne change rien.
    """
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
    # Autres personnes présentes PENDANT ce plan (pas celles d'un autre plan de la source).
    others = [o for o in (tracks or []) if o is not track and any(s <= times[i] <= e for i in o.seen)]

    if follow == "safe":
        # Marge de sécurité : la personne reste entière tant que son centre ne s'écarte pas de plus de
        # (demi-cadre − demi-visage − marge) du centre du cadre.
        tolerance = max(FOLLOW_DEADZONE, crop / 2 - track.width / 2 - 0.03)
        out = [(s, cx)]
        for (t, _), x in zip(pts, smooth, strict=False):
            if abs(x - out[-1][1]) > tolerance and t - out[-1][0] >= FOLLOW_STEP_S:
                out.append((t, compose(float(x), track, others, crop)))
        return _limit_speed(out)

    if smooth.max() - smooth.min() < FOLLOW_DEADZONE:
        return [(s, cx)]
    out = [(s, float(smooth[0]))]
    for (t, _), x in zip(pts, smooth, strict=False):
        if t - out[-1][0] >= FOLLOW_STEP_S and abs(x - out[-1][1]) >= FOLLOW_DEADZONE / 2:
            out.append((t, float(x)))
    return _limit_speed(out)


def shots_to_keyframes(shots: list[Shot], times: list[float], *, crop: float = 1.0, follow: str = "smooth",
                       tracks: list[Track] | None = None) -> tuple[CropKeyframe, ...]:
    """Plans → images clés : suivi pendant un plan, coupe nette (≈ 1 image) au changement de personne ou de plan."""
    keys: list[CropKeyframe] = []
    for i, shot in enumerate(shots):
        path = _path(shot, times, crop=crop, follow=follow, tracks=tracks)
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


def reframe(video: Path, start: float, end: float, *, crop_fraction: float, mode: str = "stable",
            detector: FaceDetector | None = None) -> ReframeResult:
    """Trajectoire de cadrage pour l'extrait. crop_fraction = largeur du cadre / largeur de l'image source.

    Chaque plan de la source (changement de caméra) est cadré indépendamment : le changement de cadrage se fait
    exactement sur la coupe de la source, jamais par un mouvement de caméra virtuelle juste après.
    """
    duration = round(end - start, 3)
    profile = PROFILES.get(mode, PROFILES["stable"])
    if crop_fraction >= 0.98:  # rien à recadrer horizontalement
        return ReframeResult((), "center", 0.0, 0, 0, mode)
    det = detector or FaceDetector()
    detections, hists = [], []
    for f in iter_frames(video, start, end):
        detections.append(det.detect(f))
        hists.append(frame_signature(f))
    if not detections:
        return ReframeResult((), "center", 0.0, 0, 0, mode)
    n = len(detections)
    times = [i / SAMPLE_FPS for i in range(n)]
    found = sum(1 for d in detections if d) / n
    starts = scene_bounds(hists) + [n]

    all_shots: list[Shot] = []
    all_tracks: list[Track] = []
    modes, people, switches = [], 0, 0
    for a, b in zip(starts, starts[1:], strict=False):
        seg = detections[a:b]
        t0 = times[a]
        t1 = times[b] if b < n else duration
        seg_found = sum(1 for d in seg if d) / max(len(seg), 1)
        tracks = build_tracks(seg) if seg_found >= 0.4 else []  # détection incertaine → plan centré
        for tr in tracks:
            tr.activity = mouth_activity(len(seg), tr)
            tr.seen = {i + a: f for i, f in tr.seen.items()}  # indices globaux
        local_times = [t - t0 for t in times[a:b]]
        shots, m, sw = plan_shots(tracks, local_times, t1 - t0, crop_fraction, profile)
        all_shots += [(s0 + t0, s1 + t0, tr, c) for s0, s1, tr, c in shots]
        all_tracks += tracks
        modes.append(m)
        people = max(people, len(tracks))
        switches += sw
    if all(m == "center" for m in modes):
        return ReframeResult((), "center", found, 0, 0, mode, len(starts) - 1)
    keys = shots_to_keyframes(all_shots, times, crop=crop_fraction, follow=profile.follow, tracks=all_tracks)
    moves = sum(1 for k0, k1 in zip(keys, keys[1:], strict=False) if abs(k1.cx - k0.cx) > 0.01)
    return ReframeResult(keys, modes[0] if len(set(modes)) == 1 else "mixed", found, people,
                         switches + len(starts) - 2, mode, len(starts) - 1,
                         moves / max(duration / 60, 1e-6))
