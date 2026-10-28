// The share card (public/og.png, 1200x630): name, role and the chrome monogram.
//   node art/og.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const b64 = (f) => readFileSync(path.join(root, f)).toString('base64');
const html = `<!doctype html><html><head><style>
@font-face{font-family:D;src:url(data:font/woff2;base64,${b64('public/fonts/display.woff2')});font-weight:100 900}
@font-face{font-family:T;src:url(data:font/woff2;base64,${b64('public/fonts/text.woff2')});font-weight:300 800}
body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:T;color:#111110;
  background:radial-gradient(120% 120% at 75% 30%,#f2f2ee 0%,#cfcfca 55%,#a3a39e 100%)}
.name{position:absolute;left:56px;bottom:150px;font-family:D;font-weight:900;font-size:190px;line-height:.8;text-transform:uppercase;letter-spacing:-.005em}
.role{position:absolute;left:60px;bottom:64px;font-size:34px;font-weight:500}
.mark{position:absolute;right:70px;top:90px;height:450px}
.dot{position:absolute;left:60px;top:56px;display:flex;gap:12px;align-items:center;font-size:24px;font-weight:600}
.dot i{width:10px;height:24px;background:#111110;box-shadow:inset 0 -9px 0 #ff5a1f}
.frame{position:absolute;inset:22px;border:1.5px solid #111110;opacity:.25}
</style></head><body>
<img class="mark" src="data:image/webp;base64,${b64('src/assets/hero/torus.webp')}">
<div class="dot"><i></i>maliksohaib.com</div>
<div class="name">Malik<br>Sohaib</div>
<div class="role">Full-stack and AI engineer. Idea to production.</div>
<div class="frame"></div>
</body></html>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(root, 'public/og.png') });
await browser.close();
console.log('wrote public/og.png');
