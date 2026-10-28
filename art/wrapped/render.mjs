// Renders a Wrapped film frame by frame, in both shapes, with its sound.
//   node art/wrapped/render.mjs [film]            -> public/media/<name>-16x9.{webm,mp4,jpg} and <name>-9x16.*
//   node art/wrapped/render.mjs [film] --preview 1.5 20.4 …   -> stills in art/out/wrapped/preview
// Films: reel (index.html, the first cut, as wrapped-*), collage (wrapped-collage-*), blueprint
// (wrapped-blueprint-*).
// Run voice.py and sound.py first (art/out/voice). Needs Playwright and ffmpeg (or FFMPEG=/path).
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const FPS = 30;
const ffmpeg = process.env.FFMPEG ?? 'ffmpeg';
const SHAPES = [
  { name: '16x9', width: 1920, height: 1080 },
  { name: '9x16', width: 1080, height: 1920 },
];
const previewAt = process.argv.includes('--preview') ? process.argv.slice(process.argv.indexOf('--preview') + 1).map(Number) : null;
const FILMS = { reel: ['index.html', 'wrapped'], collage: ['collage.html', 'wrapped-collage'], blueprint: ['blueprint.html', 'wrapped-blueprint'] };
const film = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'reel';
const [pageFile, outName] = FILMS[film];

// The facts, from the site's own data, and the narration's timeline.
const act = JSON.parse(readFileSync(path.join(root, 'src/data/activity.json'), 'utf8'));
const perYear = {};
const start = Date.parse(`${act.from}T00:00:00Z`);
act.days.forEach((c, i) => {
  const y = new Date(start + i * 864e5).getUTCFullYear();
  perYear[y] = (perYear[y] ?? 0) + c;
});
const facts = { years: new Date().getUTCFullYear() - 2022, total: act.total, perYear };
const timeline = JSON.parse(readFileSync(path.join(root, 'art/wrapped/timeline.json'), 'utf8'));

const voice = path.join(root, 'art/out/voice');
const media = path.join(root, 'public/media');
const browser = await chromium.launch();

for (const shape of SHAPES) {
  const page = await browser.newPage({ viewport: { width: shape.width, height: shape.height } });
  await page.addInitScript(([f, tl]) => ((window.FACTS = f), (window.TIMELINE = tl)), [facts, timeline]);
  await page.goto('file://' + path.join(root, 'art/wrapped', pageFile));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.READY);
  await page.evaluate(() => Promise.all([...document.querySelectorAll('video')].map((v) => (v.readyState >= 2 ? 0 : new Promise((ok) => v.addEventListener('loadeddata', ok, { once: true }))))));
  const out = path.join(root, 'art/out/wrapped', previewAt ? 'preview' : `${film}-${shape.name}`);
  if (!previewAt) rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  const times = previewAt ?? Array.from({ length: Math.round(timeline.duration * FPS) }, (_, i) => i / FPS);
  for (const [i, t] of times.entries()) {
    await page.evaluate((t) => window.render(t), t);
    const file = previewAt ? `${film}-${shape.name}-${t}.png` : `f_${String(i).padStart(5, '0')}.png`;
    await page.screenshot({ path: path.join(out, file) });
  }
  await page.close();
  if (previewAt) continue;

  // Sound: the narration over the bed, at the loudness Reels play at.
  const mix = path.join(voice, 'mix.wav');
  execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', path.join(voice, 'narration.wav'), '-i', path.join(voice, 'sfx.wav'), '-filter_complex', '[0]aresample=48000,pan=stereo|c0=c0|c1=c0[v];[1]volume=0.5[s];[v][s]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9[a]', '-map', '[a]', '-ar', '48000', mix]);

  const frames = path.join(out, 'f_%05d.png');
  const base = path.join(media, `${outName}-${shape.name}`);
  const vin = ['-framerate', String(FPS), '-i', frames, '-i', mix, '-shortest'];
  // Sharp type needs bits: a low CRF, and 4:2:0 kept clean by rendering at full size.
  execFileSync(ffmpeg, ['-v', 'error', '-y', ...vin, '-c:v', 'libx264', '-crf', '19', '-preset', 'slow', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', `${base}.mp4`]);
  execFileSync(ffmpeg, ['-v', 'error', '-y', ...vin, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '30', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', '-c:a', 'libopus', '-b:a', '128k', `${base}.webm`]);
  // The poster: the name, landed.
  const still = Math.round(1.6 * FPS);
  execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', path.join(out, `f_${String(still).padStart(5, '0')}.png`), '-q:v', '3', `${base}.jpg`]);
  console.log(`${outName} ${shape.name}: ${times.length} frames`);
}
await browser.close();
