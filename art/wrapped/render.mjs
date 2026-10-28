// Renders the Wrapped film (art/wrapped/index.html) frame by frame and encodes it for the web.
//   node art/wrapped/render.mjs            -> public/media/wrapped.webm, .mp4 and a poster frame
// Needs Playwright (dev dependency) and ffmpeg on PATH (or FFMPEG=/path/to/ffmpeg).
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const FPS = 30;
const ffmpeg = process.env.FFMPEG ?? 'ffmpeg';
const out = path.join(root, 'art/out/wrapped');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// The facts, from the site's own data.
const act = JSON.parse(readFileSync(path.join(root, 'src/data/activity.json'), 'utf8'));
const perYear = {};
const start = Date.parse(`${act.from}T00:00:00Z`);
act.days.forEach((c, i) => {
  const y = new Date(start + i * 864e5).getUTCFullYear();
  perYear[y] = (perYear[y] ?? 0) + c;
});
const facts = { years: new Date().getUTCFullYear() - 2022, total: act.total, perYear };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.addInitScript((f) => (window.FACTS = f), facts);
await page.goto('file://' + path.join(root, 'art/wrapped/index.html'));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
const total = Math.round((await page.evaluate(() => window.DURATION)) * FPS);
for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.render(t), i / FPS);
  await page.screenshot({ path: path.join(out, `f_${String(i).padStart(4, '0')}.png`) });
}
await browser.close();

const media = path.join(root, 'public/media');
const frames = path.join(out, 'f_%04d.png');
execFileSync(ffmpeg, ['-v', 'error', '-y', '-framerate', String(FPS), '-i', frames, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-row-mt', '1', '-pix_fmt', 'yuv420p', '-an', path.join(media, 'wrapped.webm')]);
execFileSync(ffmpeg, ['-v', 'error', '-y', '-framerate', String(FPS), '-i', frames, '-c:v', 'libx264', '-crf', '25', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', path.join(media, 'wrapped.mp4')]);
execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', path.join(out, `f_${String(Math.round(1.6 * FPS)).padStart(4, '0')}.png`), '-q:v', '4', path.join(media, 'wrapped.jpg')]);
console.log(`wrapped: ${total} frames`, facts);
