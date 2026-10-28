# The portraits, from the owner's photos, in the site's grayscale:
#   light  the backlit profile for the footer's pixel stage (the mosaic is drawn live on the page,
#          so this stays a plain photo): grayscale with a curve that keeps the light bright and the
#          figure deep.
#   coat   the profile in the coat for About, without the empty wall on its left.
#   art/out/venv/bin/python art/portrait.py <backlit-shot> <coat-shot>
#   -> src/assets/portrait/profile-light.webp and src/assets/portrait/profile-coat.webp
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'src/assets/portrait'
light_shot, coat_shot = sys.argv[1:3]


def mono(path, curve=1.0, lift=0.0):
    """Grayscale weighted toward red, so warm light reads bright and warm walls mid grey."""
    rgb = np.asarray(Image.open(path).convert('RGB'), dtype=np.float32) / 255
    y = rgb @ np.array([0.45, 0.45, 0.10], dtype=np.float32)
    y = lift + (1 - lift) * np.clip(y, 0, 1) ** curve
    return Image.fromarray((np.clip(y, 0, 1) * 255).astype(np.uint8))


def light(path):
    img = mono(path, curve=1.15)
    img.save(OUT / 'profile-light.webp', quality=88)
    return img.size


def coat(path):
    img = mono(path, curve=1.05, lift=0.02)
    w, h = img.size
    img = img.crop((int(w * 0.18), 0, w, h))  # the empty wall on the left goes
    img.save(OUT / 'profile-coat.webp', quality=92)
    return img.size


OUT.mkdir(parents=True, exist_ok=True)
print('light', light(light_shot), 'coat', coat(coat_shot))
