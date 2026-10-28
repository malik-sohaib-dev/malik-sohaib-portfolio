# The portraits, from the owner's photos, in the site's grayscale:
#   glow   the backlit profile for the footer, widened to 16:9 with its own blurred edges and
#          softened by light: out of focus, smeared sideways, the highlights blooming, so the
#          figure reads by its silhouette and not its face.
#   coat   the profile in the coat for About, without the empty wall on its left.
#   art/out/venv/bin/python art/portrait.py <backlit-shot> <coat-shot>
#   -> src/assets/portrait/profile-glow.webp and src/assets/portrait/profile-coat.webp
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, uniform_filter1d

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'src/assets/portrait'
light_shot, coat_shot = sys.argv[1:3]


def mono(path, curve=1.0, lift=0.0):
    """Grayscale weighted toward red, so warm light reads bright and warm walls mid grey."""
    rgb = np.asarray(Image.open(path).convert('RGB'), dtype=np.float32) / 255
    y = rgb @ np.array([0.45, 0.45, 0.10], dtype=np.float32)
    y = lift + (1 - lift) * np.clip(y, 0, 1) ** curve
    return Image.fromarray((np.clip(y, 0, 1) * 255).astype(np.uint8))


def glow(path, W=2400, H=1350):
    sq = np.asarray(mono(path, curve=1.15), dtype=np.float32) / 255
    # The sides: the photo scaled to cover the width and blurred away, under the whole photo
    # fitted to the height, its left and right edges feathered into them.
    big = np.asarray(Image.fromarray((sq * 255).astype(np.uint8)).resize((W, W), Image.LANCZOS), dtype=np.float32) / 255
    top = (W - H) // 2
    canvas = gaussian_filter(big[top : top + H], 70)
    fit = np.asarray(Image.fromarray((sq * 255).astype(np.uint8)).resize((H, H), Image.LANCZOS), dtype=np.float32) / 255
    x0 = (W - H) // 2
    ramp = np.ones(H, dtype=np.float32)
    f = int(H * 0.22)
    ramp[:f] = np.linspace(0, 1, f) ** 1.5
    ramp[-f:] = np.linspace(1, 0, f) ** 1.5
    canvas[:, x0 : x0 + H] = canvas[:, x0 : x0 + H] * (1 - ramp) + fit * ramp
    # Light distortion: out of focus, smeared sideways, the bright parts blooming over the rest.
    soft = gaussian_filter(canvas, 11)
    soft = 0.55 * soft + 0.45 * uniform_filter1d(soft, 120, axis=1)
    bloom = gaussian_filter(np.clip(soft - 0.55, 0, 1), 45) * 1.6
    out = 1 - (1 - soft) * (1 - np.clip(bloom, 0, 1))  # screen
    out += np.random.default_rng(19).normal(0, 0.014, out.shape).astype(np.float32)
    img = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))
    img.save(OUT / 'profile-glow.webp', quality=86)
    return img.size


def coat(path):
    img = mono(path, curve=1.05, lift=0.02)
    w, h = img.size
    img = img.crop((int(w * 0.18), 0, w, h))  # the empty wall on the left goes
    img.save(OUT / 'profile-coat.webp', quality=92)
    return img.size


OUT.mkdir(parents=True, exist_ok=True)
print('glow', glow(light_shot), 'coat', coat(coat_shot))
