# The narration from the owner's own recordings: finds every script line in every take, keeps the
# clearest version of each (or the one named in PICK), cleans it, tightens its pauses, and lays the
# lines end to end. Then it times every word again for the cuts and the captions.
#   art/out/venv/bin/python art/wrapped/takes.py art/out/rec/t1.wav art/out/rec/t2.wav …
#   -> art/out/voice/narration.wav and art/wrapped/timeline.json (sound.py and render.mjs follow)
# Setup: uv pip install --python art/out/venv/bin/python faster-whisper noisereduce
import json
import re
from difflib import SequenceMatcher
import subprocess
import sys
from pathlib import Path

import noisereduce as nr
import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[2]
SR = 48000
FFMPEG = '/opt/homebrew/bin/ffmpeg'
PROMPT = "I'm Malik Sohaib. EzVenda, Mini Havoc, GymPaid, Arthur, Lahore."

# The script's lines: the word each starts on (with the small words that may come before it), the
# word it ends on, and the pause after it in seconds. Lines 3, 4 and 11 hold more than one beat.
LINES = [
    ('name', 'malik', {'i', 'am', 'im'}, 'sohaib', 0.2),
    ('idea', 'give', set(), 'product', 0.3),
    ('years', 'four', set(), 'contributions', 0.3),
    ('team1', 'built', {'i', 'have', 'ive'}, 'engineer', 0.3),
    ('own', 'side', {'and', 'on', 'the'}, 'own', 0.2),
    ('ezvenda', 'ezvenda', set(), 'it', 0.2),
    ('havoc', 'mini', set(), 'played', 0.2),
    ('gympaid', 'gympaid', set(), 'days', 0.3),
    ('build', 'web', set(), 'business', 0.25),
    ('layers', 'from', set(), 'layer', 0.3),
    ('ask', 'something', {'got', 'but'}, 'talk', 1.6),
]
LEAD = 0.5
# Takes chosen by ear win over the automatic choice: {'ezvenda': 't2', …}
PICK: dict[str, str] = {}

norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
model = WhisperModel('medium.en', device='cpu', compute_type='int8')


def words_of(audio: np.ndarray, sr: int, prompt: str = PROMPT):
    a16 = np.interp(np.arange(0, len(audio), sr / 16000), np.arange(len(audio)), audio).astype(np.float32)
    segs, _ = model.transcribe(a16, word_timestamps=True, language='en', initial_prompt=prompt)
    return [{'w': w.word.strip(), 's': w.start, 'e': w.end, 'p': w.probability} for s in segs for w in s.words]


def find(words, start, lead, end):
    """Every complete run of a line in a take: (first, last) word indices."""
    n = [norm(w['w']) for w in words]
    runs = []
    for i, x in enumerate(n):
        if x != start:
            continue
        j = next((j for j in range(i, min(len(n), i + 40)) if n[j] == end), None)
        if j is None:
            continue
        a = i
        while a > 0 and n[a - 1] in lead and i - a < 3:
            a -= 1
        runs.append((a, j))
    return runs


def clean(audio: np.ndarray, noise: np.ndarray) -> np.ndarray:
    """Hiss out, rumble out, a little body and presence, gently levelled."""
    a = nr.reduce_noise(y=audio, sr=SR, y_noise=noise, stationary=True, prop_decrease=0.9, n_fft=2048)
    p = subprocess.run(
        [FFMPEG, '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af',
         'highpass=f=85,equalizer=f=280:t=q:w=1.2:g=-2.5,equalizer=f=4200:t=q:w=1:g=2.5,'
         'acompressor=threshold=-22dB:ratio=3:attack=6:release=90:makeup=3', '-f', 'f32le', '-'],
        input=a.astype(np.float32).tobytes(), capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).copy()


def tighten(a: np.ndarray, longest=0.22, floor_db=-44) -> np.ndarray:
    """Pauses inside a line longer than `longest` are cut down to it, with short crossfades."""
    hop = int(0.01 * SR)
    rms = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2) + 1e-12) for i in range(0, len(a), hop)])
    quiet = 20 * np.log10(rms) < floor_db
    out, last, i = [], 0, 0
    while i < len(quiet):
        if not quiet[i]:
            i += 1
            continue
        j = i
        while j < len(quiet) and quiet[j]:
            j += 1
        if (j - i) * hop > longest * SR and i > 0 and j < len(quiet):
            keep = int(longest * SR / 2)
            cut_a, cut_b = i * hop + keep, j * hop - keep
            f = int(0.012 * SR)
            seg = a[last:cut_a].copy()
            seg[-f:] *= np.linspace(1, 0, f)
            out.append(seg)
            tail = a[cut_b:cut_b + f].copy() * np.linspace(0, 1, f)
            out.append(tail)
            last = cut_b + f
        i = j
    out.append(a[last:])
    return np.concatenate(out)


def main(paths):
    takes = {}
    for p in paths:
        name = Path(p).stem
        a, sr = sf.read(p, dtype='float32')
        assert sr == SR, f'{p}: resample to {SR} Hz first'
        # The room's own sound: the quietest half second of the take.
        w = int(0.5 * SR)
        starts = range(0, len(a) - w, w // 4)
        q = min(starts, key=lambda s: np.sqrt(np.mean(a[s:s + w] ** 2)))
        takes[name] = {'audio': a, 'noise': a[q:q + w], 'words': words_of(a, sr)}
        print(f'{name}: {len(a) / SR:.1f} s, noise floor {20 * np.log10(np.sqrt(np.mean(a[q:q + w] ** 2))):.1f} dB')

    parts = [np.zeros(int(LEAD * SR), dtype=np.float32)]
    chosen = {}
    words = []  # every word of the narration, timed in it
    for bid, start, lead, end, pause in LINES:
        best = None
        for name, t in takes.items():
            runs = find(t['words'], start, lead, end)
            if not runs:
                continue
            a, b = runs[-1]  # the last complete try in a take is the one meant to keep
            ws = t['words'][a:b + 1]
            score = float(np.mean([w['p'] for w in ws]))
            text = ' '.join(w['w'] for w in ws)
            print(f'  {bid:8s} {name}: {score:.2f}  {text}')
            if PICK.get(bid) == name or (bid not in PICK and (best is None or score > best[0])):
                best = (score + (9 if PICK.get(bid) == name else 0), name, ws)
        assert best, f'no take has the line "{bid}"'
        _, name, ws = best
        t = takes[name]
        s0 = max(0, int((ws[0]['s'] - 0.06) * SR))
        s1 = min(len(t['audio']), int((ws[-1]['e'] + 0.25) * SR))
        line = clean(t['audio'][s0:s1], t['noise'])
        # Trim to the voice itself, then tighten the pauses inside it.
        # Breaths at the ends go too: the next line follows close behind.
        loud = np.flatnonzero(np.abs(line) > 10 ** (-40 / 20))
        line = line[max(0, loud[0] - int(0.03 * SR)) : loud[-1] + int(0.07 * SR)]
        line = tighten(line)
        f = int(0.01 * SR)
        line[:f] *= np.linspace(0, 1, f)
        line[-f:] *= np.linspace(1, 0, f)
        chosen[bid] = name
        # Time the line's words on the line itself, and spell them as the first pass heard them
        # in the whole take (more context, fewer slips: "Give", not "gave").
        offset = sum(len(x) for x in parts) / SR
        lw = words_of(line, SR)
        ops = SequenceMatcher(None, [norm(w['w']) for w in lw], [norm(w['w']) for w in ws]).get_opcodes()
        for op, i1, i2, j1, j2 in ops:
            if op == 'replace' and i2 - i1 == j2 - j1:
                for i, j in zip(range(i1, i2), range(j1, j2)):
                    lw[i]['w'] = ws[j]['w']
        words += [{**w, 's': w['s'] + offset, 'e': w['e'] + offset} for w in lw]
        parts += [line, np.zeros(int(pause * SR), dtype=np.float32)]
    voice = np.concatenate(parts)
    out = ROOT / 'art/out/voice'
    out.mkdir(parents=True, exist_ok=True)
    sf.write(out / 'narration.wav', voice, SR)
    print('chosen', chosen)

    # Split the narration into the film's beats.
    joined = []
    for w in words:
        if joined and re.match(r'^[,.\-][A-Za-z0-9]', w['w']):
            joined[-1] = {**joined[-1], 'w': joined[-1]['w'] + w['w'], 'e': w['e']}
        else:
            joined.append(w)
    words = joined
    n = [norm(w['w']) for w in words]

    def at(word, after=0):
        # A near miss counts ("gave" for "give"): the words are known, only their times are not.
        i = next((i for i in range(after, len(n)) if n[i] == word), None)
        if i is None:
            i = next((i for i in range(after, len(n)) if len(n[i]) == len(word) and SequenceMatcher(None, n[i], word).ratio() >= 0.74), None)
        if i is None:
            sys.exit(f'"{word}" is not in the narration after word {after}: {" ".join(n)}')
        return i

    cuts = {}
    cuts['name'] = 0
    cuts['idea'] = at('give')
    cuts['years'] = at('four')
    cuts['contrib'] = at('over', cuts['years'])
    t1 = at('built')
    cuts['team1'] = t1 - (1 if n[t1 - 1] in {'ive', 'have'} else 0) - (1 if n[t1 - 2] == 'i' else 0)
    cuts['team2'] = at('solar') - 1
    cuts['team3'] = at('arthur') - (1 if n[at('arthur') - 1] == 'and' else 0)
    s = at('side')
    cuts['own'] = s - 3 if n[s - 3] == 'and' else s - 2
    cuts['ezvenda'] = at('ezvenda')
    cuts['havoc'] = at('mini', cuts['ezvenda'])
    cuts['gympaid'] = at('gympaid')
    cuts['build'] = at('web')
    cuts['layers'] = at('from', cuts['build'])
    sm = at('something', cuts['layers'])
    cuts['ask'] = sm - 1 if n[sm - 1] in {'got', 'but'} else sm
    cuts['talk'] = at('lets', cuts['ask'])
    order = sorted(cuts.items(), key=lambda kv: kv[1])
    beats = []
    for k, (bid, i) in enumerate(order):
        j = order[k + 1][1] if k + 1 < len(order) else len(words)
        ws = words[i:j]
        # The spoken words, as said; "Got" is what the script has where the ear may hear "But".
        items = [{'w': ('Got' if bid == 'ask' and norm(w['w']) == 'but' else w['w'].strip(',.!?')), 's': round(w['s'], 3), 'e': round(w['e'], 3)} for w in ws]
        beats.append({'id': bid, 'text': ' '.join(w['w'] for w in ws), 'start': items[0]['s'], 'end': items[-1]['e'], 'words': items})
    dur = len(voice) / SR
    (ROOT / 'art/wrapped/timeline.json').write_text(json.dumps({'voice': 'owner', 'takes': chosen, 'duration': round(dur, 3), 'beats': beats}, indent=1) + '\n')
    print(f'narration: {dur:.1f} s')
    for b in beats:
        print(f"  {b['id']:8s} {b['start']:6.2f}-{b['end']:6.2f}  {b['text']}")


main(sys.argv[1:])
