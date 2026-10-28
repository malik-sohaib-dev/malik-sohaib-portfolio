# The portrait treatments, from the owner's studio shots:
#   haze  the footer's background: the figure as a soft silhouette against light, out of focus and
#         smeared a little sideways, with a glow behind the head, haze and grain. Grayscale.
#   crop  the dark studio shot for About, without the empty band on its left.
#   art/out/venv/bin/python art/portrait.py <grey-shot> <dark-shot>
#   -> src/assets/portrait/haze.webp and src/assets/portrait/studio-dark.webp
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import binary_closing, binary_fill_holes, gaussian_filter, uniform_filter1d

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'src/assets/portrait'
grey_shot, dark_shot = sys.argv[1:3]
rng = np.random.default_rng(19)


def haze(path, W=2400, H=1500):
    src = np.asarray(Image.open(path).convert('L'), dtype=np.float32) / 255
    wall = float(np.median(src[: src.shape[0] // 6, : src.shape[1] // 6]))
    # The figure, large and a little right of centre, cut off at the bottom like a bust.
    scale = H * 1.18 / src.shape[0]
    fig = np.asarray(Image.fromarray((src * 255).astype(np.uint8)).resize((int(src.shape[1] * scale), int(src.shape[0] * scale)), Image.LANCZOS), dtype=np.float32) / 255
    canvas = np.full((H, W), wall, dtype=np.float32)
    x0 = int(W * 0.6 - fig.shape[1] / 2)
    y0 = int(H * 0.16)
    h = min(fig.shape[0], H - y0)
    canvas[y0 : y0 + h, max(0, x0) : x0 + fig.shape[1]] = fig[:h, max(0, -x0) :][:, : W - max(0, x0)]
    # The figure as one solid shape: the dark parts (hair, glasses, beard, shirt) closed up and
    # filled, so the face between them is inside it too. Then filled near black: a silhouette.
    dark = canvas < wall - 0.15
    dark = binary_closing(dark, structure=np.ones((9, 9)), iterations=9)
    dark = binary_fill_holes(dark)
    mask = gaussian_filter(dark.astype(np.float32), 4)
    canvas = canvas * (1 - mask) + (0.1 + 0.12 * canvas) * mask
    # Light behind the head, raking up and to the right, that falls on the wall, not on him.
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    hx, hy = W * 0.6 + W * 0.06, H * 0.36
    d = ((xx - hx) / (W * 0.2)) ** 2 + ((yy - hy) / (H * 0.42)) ** 2
    shaft = np.exp(-d) * (0.55 + 0.45 * np.clip((xx - hx) / (W * 0.25) + 0.6, 0, 1))
    lit = canvas + shaft * 0.75 * (1 - mask)
    # Out of focus, and smeared sideways as if he moved during a long exposure.
    lit = gaussian_filter(lit, 26)
    lit = 0.65 * lit + 0.35 * uniform_filter1d(lit, 140, axis=1)
    # Haze lifts the darks; a soft curve; grain.
    lit = 0.82 * lit + 0.18 * wall
    lit = np.clip(lit, 0, 1) ** 0.95
    lit += rng.normal(0, 0.018, lit.shape).astype(np.float32)
    img = Image.fromarray((np.clip(lit, 0, 1) * 255).astype(np.uint8))
    img.save(OUT / 'haze.webp', quality=82)
    return img.size


def crop(path):
    img = Image.open(path).convert('L')
    w, h = img.size
    img = img.crop((int(w * 0.1), 0, w, h))  # the empty band on the left goes
    img.save(OUT / 'studio-dark.webp', quality=92)
    return img.size


OUT.mkdir(parents=True, exist_ok=True)
print('haze', haze(grey_shot), 'crop', crop(dark_shot))
