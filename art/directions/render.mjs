// Screenshots each style frame in art/directions/frames.html at its size.
//   node art/directions/render.mjs [A1 B2 …]   -> art/out/directions/frames/<id>.png
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const out = path.join(root, 'art/out/directions/frames');
mkdirSync(out, { recursive: true });
const all = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'];
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all;
const browser = await chromium.launch();
for (const id of ids) {
  const port = id.endsWith('4');
  const page = await browser.newPage({ viewport: port ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 } });
  await page.goto(`file://${path.join(root, 'art/directions/frames.html')}#${id}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, `${id}.png`) });
  await page.close();
}
await browser.close();
console.log('frames', ids.join(' '));
