# The film's narration: each beat rendered with Kokoro-82M (Apache-2.0, runs locally), laid end to
# end with breathing room, plus a timeline of every word for the cuts and the captions.
#   art/out/venv/bin/python art/wrapped/voice.py [voice]
#   -> art/out/voice/narration.wav and art/wrapped/timeline.json
# Setup: uv venv --python 3.12 art/out/venv && uv pip install --python art/out/venv/bin/python kokoro soundfile pip scipy
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline

ROOT = Path(__file__).resolve().parents[2]
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'af_heart'
SPEED = 1.05
SR = 24000
LEAD = 0.5  # silence before the first word, for the opening hit
TAIL = 1.6  # after the last word, for the end card

# Names the model would get wrong, spelled out in its phonemes.
SAY = {
    'Malik Sohaib': '[Malik](/mˈɑlɪk/) [Sohaib](/sOhˈAb/)',
}

# (id, line, pause after it in seconds). The ids are the scenes in index.html.
BEATS = [
    ('name', 'This is Malik Sohaib.', 0.2),
    ('idea', "Give him an idea, and he'll hand you back a product.", 0.5),
    ('years', 'Four years of shipping software.', 0.15),
    ('contrib', 'Over five thousand contributions.', 0.5),
    ('team1', "He's built for a US education nonprofit,", 0.05),
    ('team2', 'a solar engineering company in Lahore,', 0.05),
    ('team3', "and Arthur, in Germany, where he's now a senior engineer.", 0.5),
    ('own', 'And on the side? Products of his own.', 0.3),
    ('ezvenda', 'EzVenda: online shops, with a real merchant selling through it.', 0.3),
    ('havoc', 'Mini Havoc: party games, with hundreds of sessions played.', 0.3),
    ('gympaid', 'GymPaid: built in two days.', 0.5),
    ('build', 'Web apps. Real-time games. AI agents. Tools for your business.', 0.35),
    ('layers', 'From the idea to production, every layer.', 0.5),
    ('ask', 'Got something to build?', 0.2),
    ('talk', "Let's talk.", TAIL),
]


def spoken(text: str) -> str:
    for k, v in SAY.items():
        text = text.replace(k, v)
    return text


def main():
    pipe = KPipeline(lang_code='b' if VOICE.startswith('b') else 'a', repo_id='hexgrad/Kokoro-82M')
    audio = [np.zeros(int(LEAD * SR), dtype=np.float32)]
    t = LEAD
    beats = []
    for bid, line, pause in BEATS:
        chunks, words = [], []
        offset = 0.0
        for r in pipe(spoken(line), voice=VOICE, speed=SPEED):
            a = r.audio.numpy()
            for tok in r.tokens or []:
                if tok.start_ts is None or not any(c.isalnum() for c in tok.text):
                    continue
                words.append({'w': tok.text, 's': round(t + offset + tok.start_ts, 3), 'e': round(t + offset + tok.end_ts, 3)})
            chunks.append(a)
            offset += len(a) / SR
        a = np.concatenate(chunks)
        # Trim the model's own silence at the ends, so the pauses above are the real ones.
        loud = np.flatnonzero(np.abs(a) > 0.01)
        head = max(0, loud[0] - int(0.02 * SR)) if len(loud) else 0
        end = min(len(a), loud[-1] + int(0.06 * SR)) if len(loud) else len(a)
        a = a[head:end]
        for w in words:
            w['s'] = round(max(t, w['s'] - head / SR), 3)
            w['e'] = round(max(t, w['e'] - head / SR), 3)
        dur = len(a) / SR
        beats.append({'id': bid, 'text': line, 'start': round(t, 3), 'end': round(t + dur, 3), 'words': words})
        audio += [a, np.zeros(int(pause * SR), dtype=np.float32)]
        t += dur + pause
    out = ROOT / 'art/out/voice'
    out.mkdir(parents=True, exist_ok=True)
    sf.write(out / 'narration.wav', np.concatenate(audio), SR)
    (ROOT / 'art/wrapped/timeline.json').write_text(json.dumps({'voice': VOICE, 'duration': round(t, 3), 'beats': beats}, indent=1) + '\n')
    print(f'{VOICE}: {t:.1f} s, {len(beats)} beats')


main()
