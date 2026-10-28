# The film's sound bed, synthesised from the timeline so every hit lands on its cut: a low pad that
# holds it together, a whoosh into each scene, a sub hit on the reveals, ticks while numbers count,
# and a soft click per word in the quick lists. No samples, so nothing to license.
#   art/out/venv/bin/python art/wrapped/sound.py   -> art/out/voice/sfx.wav (48 kHz stereo)
import json
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parents[2]
SR = 48000
tl = json.loads((ROOT / 'art/wrapped/timeline.json').read_text())
beats = {b['id']: b for b in tl['beats']}
N = int((tl['duration'] + 0.2) * SR)
out = np.zeros((N, 2), dtype=np.float64)
rng = np.random.default_rng(7)


def at(t):
    return max(0, min(N - 1, int(t * SR)))


def add(sig, t, pan=0.0, gain=1.0):
    i = at(t)
    sig = sig[: N - i]
    out[i : i + len(sig), 0] += sig * gain * (1 - max(0, pan))
    out[i : i + len(sig), 1] += sig * gain * (1 + min(0, pan))


def env(n, attack, release):
    e = np.ones(n)
    a = max(1, int(attack * SR))
    e[:a] = np.linspace(0, 1, a)
    e[a:] = np.exp(-np.arange(n - a) / (release * SR))
    return e


def whoosh(dur=0.42, lo=300, hi=5000):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    # A band that sweeps up, faded in and out: air moving past.
    sos_parts = []
    y = np.zeros(n)
    steps = 12
    for k in range(steps):
        f = lo * (hi / lo) ** (k / (steps - 1))
        sos = butter(2, [f * 0.7, min(f * 1.4, SR / 2 - 1)], btype='band', fs=SR, output='sos')
        seg = slice(k * n // steps, (k + 1) * n // steps)
        y[seg] = sosfilt(sos, noise)[seg]
    shape = np.sin(np.linspace(0, np.pi, n)) ** 1.6
    return y * shape * 0.5


def hit(f0=58, dur=0.7):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * (1 + 1.5 * np.exp(-t * 40))  # a quick pitch drop makes the thump
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.22)
    click = rng.standard_normal(n) * env(n, 0.0005, 0.004) * 0.25
    return (sub + click) * 0.9


def tick():
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * 2400 * t) * env(n, 0.0005, 0.006) * 0.35


def pop():
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * 900 * t * (1 - t * 3)) * env(n, 0.001, 0.02) * 0.4


# The pad: a low fifth and octave with slow movement, faded in and out.
t = np.arange(N) / SR
pad = sum(np.sin(2 * np.pi * f * t + p) * g for f, p, g in [(55, 0, 0.5), (82.4, 1, 0.3), (110, 2, 0.2), (164.8, 3, 0.08)])
pad *= 0.6 + 0.4 * np.sin(2 * np.pi * t / 9)
air = sosfilt(butter(2, [400, 1800], btype='band', fs=SR, output='sos'), rng.standard_normal(N)) * 0.05
fade = np.minimum(1, np.minimum(t / 1.5, (tl['duration'] - t) / 2.5).clip(0))
out[:, 0] += (pad + air) * fade * 0.16
out[:, 1] += (pad + air[::-1]) * fade * 0.16

# A whoosh into every scene, alternating sides.
for k, b in enumerate(tl['beats'][1:]):
    if b['id'] in ('team2', 'team3'):
        continue  # one sentence, one move: the cards slide on the words, not on a cut
    add(whoosh(), b['start'] - 0.3, pan=0.5 if k % 2 else -0.5, gain=0.55)

# Sub hits on the reveals.
for bid in ('name', 'years', 'ezvenda', 'havoc', 'gympaid', 'talk'):
    w = beats[bid]['words'][0]
    add(hit(), w['s'] - 0.02, gain=0.8)
add(hit(46, 1.4), beats['talk']['words'][-1]['e'] + 0.15, gain=0.9)

# Ticks while the numbers count (the film counts over the first 1.4 s of these beats).
for bid, count in (('years', 6), ('contrib', 16)):
    s = beats[bid]['start']
    for k in range(count):
        add(tick(), s + 1.4 * (k / count) ** 0.7, gain=0.6)

# A click per word where the words land one by one.
for bid in ('build',):
    for w in beats[bid]['words']:
        add(pop(), w['s'], gain=0.5)
for bid in ('team1', 'team2', 'team3'):
    add(pop(), beats[bid]['start'], gain=0.6)

peak = np.abs(out).max()
out = out / peak * 0.7 if peak > 0.7 else out
(ROOT / 'art/out/voice').mkdir(parents=True, exist_ok=True)
sf.write(ROOT / 'art/out/voice/sfx.wav', out.astype(np.float32), SR)
print(f'sfx: {N / SR:.1f} s')
