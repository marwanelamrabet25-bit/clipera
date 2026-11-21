"""Recadrage intelligent, testé sur de vraies vidéos générées à partir d'un vrai visage (portrait NASA, domaine public).

Scénarios : podcast à deux (le cadre suit la personne qui parle), personne seule décentrée, personne qui se déplace,
deux personnes proches (plan d'ensemble), aucun visage (repli au centre), format horizontal (rien à recadrer).
On vérifie le RÉSULTAT : position du cadre aux bons instants, et pixels du clip rendu.
"""

import subprocess
from pathlib import Path

import cv2
import numpy as np
import pytest

from clipera_worker.media.probe import probe
from clipera_worker.media.reframe import reframe, shots_to_keyframes
from clipera_worker.media.render import RenderSpec, compute_geometry, render_clip

FACE = cv2.imread(str(Path(__file__).parent / "fixtures" / "faces" / "astronaut.png"))[40:200, 150:296]  # 146×160
W, H, FPS = 1920, 1080, 25
CROP_9_16 = compute_geometry(W, H, "9:16", 1080).crop_w / W  # ≈ 0,32


def face_img(variant: str, talking: bool, t: float) -> np.ndarray:
    f = cv2.resize(FACE, (292, 320))
    if variant == "B":  # deuxième personne : miroir + teinte, pour la reconnaître dans le rendu
        f = cv2.flip(f, 1)
        f[:, :, 0] = np.clip(f[:, :, 0].astype(int) + 90, 0, 255).astype(np.uint8)
    if talking:  # bouche qui s'ouvre et se ferme ~4 fois/s
        o = int(9 + 8 * np.sin(2 * np.pi * 4 * t))
        cv2.ellipse(f, (139, 208), (36, max(2, o)), 0, 0, 360, (25, 15, 50), -1)  # sur la vraie bouche
    else:  # comme dans la réalité, celui qui écoute bouge un peu (lèvres, déglutition, sourire)
        o = int(3 + 2 * np.sin(2 * np.pi * 0.7 * t))
        cv2.ellipse(f, (139, 208), (32, o), 0, 0, 360, (60, 50, 90), -1)
    return f


def make_video(path: Path, dur: float, layout) -> Path:
    """layout(t) → liste de (variante, x, parle ?) : position horizontale du coin gauche de chaque visage."""
    proc = subprocess.Popen(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-f", "lavfi", "-i", f"sine=frequency=220:duration={dur}",
         "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", str(path)],
        stdin=subprocess.PIPE)
    for n in range(int(dur * FPS)):
        t = n / FPS
        img = np.full((H, W, 3), (40, 36, 34), np.uint8)
        cv2.rectangle(img, (0, 820), (W, H), (60, 70, 90), -1)
        rng = np.random.default_rng(n)
        for variant, x, talking in layout(t):
            f = face_img(variant, talking, t)
            dx, dy = rng.integers(-3, 4, size=2)  # petits mouvements de tête
            img[380 + dy:380 + dy + f.shape[0], int(x) + dx:int(x) + dx + f.shape[1]] = f
        img = cv2.add(img, rng.integers(0, 6, img.shape, dtype=np.uint8))  # bruit du capteur
        proc.stdin.write(img.tobytes())
    proc.stdin.close()
    assert proc.wait() == 0
    return path


def center_at(result, t: float) -> float:
    """Centre du cadre à l'instant t (interpolation linéaire entre images clés, comme le rendu)."""
    ks = result.keyframes
    if not ks:
        return 0.5
    if t <= ks[0].t:
        return ks[0].cx
    for a, b in zip(ks, ks[1:], strict=False):
        if a.t <= t <= b.t:
            return a.cx + (b.cx - a.cx) * (t - a.t) / max(b.t - a.t, 1e-6)
    return ks[-1].cx


A_X, B_X = 330, 1300  # centres ≈ 0,25 et ≈ 0,75


@pytest.fixture(scope="module")
def duo(tmp_path_factory):
    def layout(t):
        a_talks = t < 6 or t >= 12
        return [("A", A_X, a_talks), ("B", B_X, not a_talks)]
    return make_video(tmp_path_factory.mktemp("rf") / "duo.mp4", 18, layout)


def test_podcast_follows_the_person_speaking(duo):
    r = reframe(duo, 0, 18, crop_fraction=CROP_9_16)
    assert r.mode == "speaker" and r.people == 2 and r.switches == 2 and r.faces_found > 0.95
    for t in (2, 5):
        assert center_at(r, t) == pytest.approx(0.25, abs=0.03)
    for t in (8, 11):
        assert center_at(r, t) == pytest.approx(0.75, abs=0.03)
    assert center_at(r, 15) == pytest.approx(0.25, abs=0.03)
    cuts = [b.t for a, b in zip(r.keyframes, r.keyframes[1:], strict=False) if abs(b.cx - a.cx) > 0.3]
    assert all(abs(c - want) <= 0.8 for c, want in zip(cuts, (6, 12), strict=True))  # coupe au bon moment
    assert all(b.t - a.t < 0.05 for a, b in zip(r.keyframes, r.keyframes[1:], strict=False)
               if abs(b.cx - a.cx) > 0.3)  # changement de personne = coupe nette, pas de panoramique


def test_rendered_clip_shows_the_speaker(duo, tmp_path):
    info, _ = probe(duo)
    r = reframe(duo, 0, 18, crop_fraction=CROP_9_16)
    out = tmp_path / "v.mp4"
    render_clip(RenderSpec(source=duo, output=out, start=0, end=18, aspect="9:16", max_short_side=720,
                           crop_track=r.keyframes), info)

    def blue_ratio(t):  # B est teinté en bleu : part de bleu au centre de l'image rendue
        raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", str(t), "-i", str(out), "-frames:v", "1",
                              "-vf", "crop=200:300:260:480", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
                             capture_output=True, check=True).stdout
        px = np.frombuffer(raw, np.uint8).reshape(-1, 3).astype(float)
        return px[:, 0].mean() / (px[:, 2].mean() + 1)

    assert blue_ratio(3) < 1.0 < blue_ratio(9)  # A (peau) à 3 s, B (bleuté) à 9 s
    assert blue_ratio(15) < 1.0


def test_single_person_off_center_is_framed(tmp_path):
    v = make_video(tmp_path / "solo.mp4", 6, lambda t: [("A", 1450, True)])
    r = reframe(v, 0, 6, crop_fraction=CROP_9_16)
    assert r.mode == "single" and center_at(r, 3) == pytest.approx((1450 + 146) / W, abs=0.03)


def test_moving_person_is_followed_smoothly(tmp_path):
    v = make_video(tmp_path / "walk.mp4", 8, lambda t: [("A", 200 + 160 * t, True)])  # traverse l'image
    r = reframe(v, 0, 8, crop_fraction=CROP_9_16)
    for t in (2, 4, 6):
        assert center_at(r, t) == pytest.approx((200 + 160 * t + 146) / W, abs=0.06)
    steps = [abs(b.cx - a.cx) for a, b in zip(r.keyframes, r.keyframes[1:], strict=False)]
    assert max(steps) < 0.15  # suivi progressif, pas de saut


def test_two_people_close_together_get_a_group_shot(tmp_path):
    v = make_video(tmp_path / "close.mp4", 6, lambda t: [("A", 650, t < 3), ("B", 950, t >= 3)])
    r = reframe(v, 0, 6, crop_fraction=CROP_9_16 * 1.8)  # cadre assez large pour les deux (ex. 1:1)
    assert r.mode == "group" and r.switches == 0
    assert center_at(r, 3) == pytest.approx((650 + 950 + 292) / 2 / W, abs=0.03)


def test_no_face_falls_back_to_center(tmp_path):
    v = make_video(tmp_path / "empty.mp4", 4, lambda t: [])
    r = reframe(v, 0, 4, crop_fraction=CROP_9_16)
    assert r.mode == "center" and r.keyframes == ()


def test_nothing_to_crop_for_landscape_output(duo):
    assert reframe(duo, 0, 18, crop_fraction=1.0).keyframes == ()


def test_keyframes_always_increasing_and_bounded():
    shots = [(i * 2.0, i * 2.0 + 2.0, None, (i % 2) * 0.5 + 0.25) for i in range(60)]
    ks = shots_to_keyframes(shots, [])
    assert all(a.t < b.t for a, b in zip(ks, ks[1:], strict=False)) and len(ks) <= 48


def test_short_interjections_do_not_cause_cuts(tmp_path):
    """« Oui », « exactement »… : l'autre personne parle une demi-seconde, le cadre reste sur celle qui parle."""
    def layout(t):
        interjection = any(a <= t < a + 0.5 for a in (2.5, 5.0, 7.5))
        return [("A", A_X, not interjection), ("B", B_X, interjection)]
    v = make_video(tmp_path / "oui.mp4", 10, layout)
    r = reframe(v, 0, 10, crop_fraction=CROP_9_16)
    assert r.switches == 0 and center_at(r, 5.2) == pytest.approx(0.25, abs=0.03)


def test_clip_opens_on_whoever_speaks_first(tmp_path):
    """Cas réel trouvé au contrôle visuel : A pose une courte question (4 s), puis B parle longtemps.
    Le clip doit s'ouvrir sur A, même si B parle davantage sur l'ensemble du clip."""
    v = make_video(tmp_path / "q.mp4", 16, lambda t: [("A", A_X, t < 4), ("B", B_X, t >= 4)])
    r = reframe(v, 0, 16, crop_fraction=CROP_9_16)
    assert center_at(r, 1.5) == pytest.approx(0.25, abs=0.03)
    assert center_at(r, 10) == pytest.approx(0.75, abs=0.03)


# ───────────── Modes Stable / Speaker, plans de la source, composition ─────────────


def test_camera_cut_in_source_gives_clean_cut_without_camera_move(tmp_path):
    """Podcast multi-caméras : plan large (A parle) puis gros plan de B. Le cadrage change PILE sur la coupe de la
    source, sans mouvement de caméra virtuelle ensuite (défaut relevé à l'audit)."""
    def layout(t):
        return [("A", A_X, True), ("B", B_X, False)] if t < 6 else [("B", 1450, True)]
    v = make_video(tmp_path / "cams.mp4", 12, layout)
    for mode in ("stable", "speaker"):
        r = reframe(v, 0, 12, crop_fraction=CROP_9_16, mode=mode)
        assert r.scenes == 2, mode
        assert center_at(r, 3) == pytest.approx(0.25, abs=0.03)
        assert center_at(r, 9) == pytest.approx((1450 + 146) / W, abs=0.03)
        jumps = [b.t for a, b in zip(r.keyframes, r.keyframes[1:], strict=False) if abs(b.cx - a.cx) > 0.05]
        assert len(jumps) == 1 and abs(jumps[0] - 6) <= 0.25, (mode, r.keyframes)  # une seule coupe, sur la coupe
        after = [k.cx for k in r.keyframes if k.t > 6.3]
        assert max(after) - min(after) < 0.01, mode  # aucun mouvement après la coupe


def test_no_half_face_on_frame_edge(tmp_path):
    """Deux personnes proches qui ne tiennent pas ensemble : l'autre visage est soit entièrement dans le cadre,
    soit entièrement dehors (mesuré à l'audit : 21 % visible avant correction)."""
    v = make_video(tmp_path / "close.mp4", 8, lambda t: [("A", 640, True), ("B", 1030, False)])
    for mode in ("stable", "speaker"):
        r = reframe(v, 0, 8, crop_fraction=CROP_9_16, mode=mode)
        cx = center_at(r, 4)
        half = CROP_9_16 / 2

        def vis(x, cx=cx, half=half):
            c, w = (x + 146) / W, 292 / W
            return max(0, min(c + w / 2, cx + half) - max(c - w / 2, cx - half)) / w
        assert vis(640) >= 0.97, mode  # la personne qui parle est entière
        assert vis(1030) <= 0.03 or vis(1030) >= 0.97, (mode, vis(1030))


def test_stable_ignores_a_short_reply_that_speaker_follows(tmp_path):
    """B répond 3 s au milieu d'un long monologue de A : Stable ne bouge pas, Speaker montre B."""
    v = make_video(tmp_path / "reply.mp4", 16, lambda t: [("A", A_X, not 7 <= t < 10), ("B", B_X, 7 <= t < 10)])
    stable = reframe(v, 0, 16, crop_fraction=CROP_9_16, mode="stable")
    speaker = reframe(v, 0, 16, crop_fraction=CROP_9_16, mode="speaker")
    assert stable.switches == 0 and center_at(stable, 8.5) == pytest.approx(0.25, abs=0.03)
    assert speaker.switches >= 1 and center_at(speaker, 8.5) == pytest.approx(0.75, abs=0.03)
    assert stable.moves_per_min < speaker.moves_per_min


def test_stable_does_not_move_for_head_movements(tmp_path):
    """La personne bouge la tête et se penche (±60 px) sans sortir du cadre : Stable ne bouge pas du tout."""
    v = make_video(tmp_path / "wobble.mp4", 10, lambda t: [("A", 900 + 60 * np.sin(t * 1.3), True)])
    r = reframe(v, 0, 10, crop_fraction=CROP_9_16, mode="stable")
    xs = [k.cx for k in r.keyframes]
    assert max(xs) - min(xs) < 0.005 and r.moves_per_min == 0


def test_stable_recenters_slowly_when_person_really_moves(tmp_path):
    """Déplacement réel (la personne traverse la pièce) : Stable suit, lentement, sans jamais la perdre."""
    v = make_video(tmp_path / "walk2.mp4", 10, lambda t: [("A", 300 + 120 * t, True)])
    r = reframe(v, 0, 10, crop_fraction=CROP_9_16, mode="stable")
    half = CROP_9_16 / 2
    for t in (2, 5, 8):
        c = (300 + 120 * t + 146) / W
        assert center_at(r, t) - half <= c - 0.04 and c + 0.04 <= center_at(r, t) + half, t  # visage dans le cadre
    speeds = [abs(b.cx - a.cx) / max(b.t - a.t, 1e-3) for a, b in zip(r.keyframes, r.keyframes[1:], strict=False)]
    assert max(speeds) <= 0.121  # vitesse plafonnée
