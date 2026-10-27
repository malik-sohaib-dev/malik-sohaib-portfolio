// Grayscale, water-warped poster backgrounds from the project renders.
//   node art/warp.mjs
// Each source is cropped to 4:5, warped by an SVG displacement filter in Chromium, then saved as WebP.
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
// slug, source, horizontal focus (0 left, 1 right), warp strength, noise seed
const jobs = [
  ['ezvenda', 'art/src/ezvenda-night.png', 0.38, 34, 7],
  ['mini-havoc', 'art/src/mini-havoc-island.webp', 0.5, 46, 3],
];
const W = 1200;
const H = 1500;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [slug, src, focus, scale, seed] of jobs) {
  const file = path.join(root, src);
  const meta = await sharp(file).metadata();
  const data = readFileSync(file).toString('base64');
  const mime = src.endsWith('.webp') ? 'image/webp' : 'image/png';
  // Cover-fit the source into 4:5 around the focus point.
  const k = Math.max(W / meta.width, H / meta.height);
  const w = meta.width * k;
  const h = meta.height * k;
  const x = -(w - W) * focus;
  const y = -(h - H) / 2;
  await page.setContent(`<html><body style="margin:0;background:#000">
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <filter id="water" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves="2" seed="${seed}" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feColorMatrix in="d" type="saturate" values="0" result="g"/>
        <feComponentTransfer in="g">
          <feFuncR type="linear" slope="1.3" intercept="-0.07"/><feFuncG type="linear" slope="1.3" intercept="-0.07"/><feFuncB type="linear" slope="1.3" intercept="-0.07"/>
        </feComponentTransfer>
      </filter>
      <image href="data:${mime};base64,${data}" x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#water)"/>
    </svg></body></html>`);
  await page.waitForTimeout(300);
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).webp({ quality: 82 }).toFile(path.join(root, `src/assets/posters/${slug}-bg.webp`));
  console.log('warped', slug);
}
await browser.close();
