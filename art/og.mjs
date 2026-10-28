// The share cards (1200x630) in the site's look: black, the ring and the address, the name or the
// work in big type, a line under it, and a picture on the right that fades into the black.
//   node art/og.mjs   -> public/og/home.jpg, about.jpg and one per case study (<slug>.jpg),
//                        plus public/apple-touch-icon.png and the manifest icons
// The case titles and lines mirror src/data/cases.ts; update both together.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const b64 = (f) => readFileSync(path.join(root, f)).toString('base64');
const out = path.join(root, 'public/og');
mkdirSync(out, { recursive: true });

const CARDS = [
  { file: 'home', kick: 'Full-stack and AI engineer', title: 'Malik<br>Sohaib', line: 'I take products from an idea to production: design, frontend, backend, AI and the launch.', img: 'src/assets/portrait/profile-glow.webp', pos: '58% 40%' },
  { file: 'about', kick: 'About', title: 'Hey, I’m<br>Malik Sohaib', line: 'Four years with product teams, clients and products of my own. How I work, and what people say.', img: 'src/assets/portrait/profile-coat.webp', pos: '50% 30%' },
  { file: 'ezvenda', kick: 'Case study', title: 'EzVenda', line: 'A multi-tenant commerce platform where small Pakistani merchants run cash-on-delivery shops on their own domains.', img: 'src/assets/posters/ezvenda-art.webp' },
  { file: 'mini-havoc', kick: 'Case study', title: 'Mini Havoc', line: 'Real-time party games for friends on a call: 23 games from one shared link, fair by design.', img: 'src/assets/posters/mini-havoc-art.webp' },
  { file: 'gympaid', kick: 'Case study', title: 'GymPaid', line: 'A renewals tracker for Pakistani gyms that answers one question: who owes me money today?', img: 'src/assets/posters/gympaid-art.webp' },
  { file: 'photon-elixir-phoenix', kick: 'Case study · Arthur', title: 'Photon to<br>Elixir', line: 'Real-time room and file sync moved off a busy Node server onto Phoenix Channels.', img: 'src/assets/posters/photon-elixir-phoenix-art.webp' },
  { file: 'arthur-vibe', kick: 'Case study · Arthur', title: 'Arthur<br>Vibe', line: 'An AI that runs interviews with a team, then writes a report you can ask questions of.', img: 'src/assets/posters/arthur-vibe-art.webp' },
  { file: 'zoom-meeting-agent', kick: 'Case study · Arthur', title: 'Zoom<br>meeting agent', line: 'Configurable voice agents that join Zoom calls and answer only when asked.', img: 'src/assets/portrait/profile-glow.webp', pos: '58% 40%' },
];

const page = (c) => `<!doctype html><html><head><style>
@font-face{font-family:D;src:url(data:font/woff2;base64,${b64('public/fonts/display.woff2')});font-weight:100 900}
@font-face{font-family:T;src:url(data:font/woff2;base64,${b64('public/fonts/text.woff2')});font-weight:300 800}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#0b0b0b;color:#ededE7;font-family:T;-webkit-font-smoothing:antialiased}
.pic{position:absolute;right:0;top:0;width:640px;height:630px;object-fit:cover;object-position:${c.pos ?? '50% 50%'};filter:grayscale(1) contrast(1.05)}
.fade{position:absolute;inset:0;background:linear-gradient(90deg,#0b0b0b 40%,rgb(11 11 11 / .7) 58%,rgb(11 11 11 / 0) 82%)}
.top{position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:14px;font-size:24px;font-weight:600;letter-spacing:.02em;color:#d6d6d0}
.top img{width:40px;height:40px}
.kick{position:absolute;left:64px;top:190px;font-size:20px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#9b9b95}
.title{position:absolute;left:60px;top:226px;width:640px;font-family:D;font-weight:900;text-transform:uppercase;line-height:.84;letter-spacing:-.005em}
.line{position:absolute;left:64px;bottom:58px;width:560px;font-size:26px;line-height:1.35;color:#c9c9c3}
.grain{position:absolute;inset:0;opacity:.12;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
</style></head><body>
<img class="pic" src="data:image/webp;base64,${b64(c.img)}">
<div class="fade"></div>
<div class="top"><img src="data:image/webp;base64,${b64('src/assets/brand/ring.webp')}">maliksohaib.com</div>
<p class="kick">${c.kick}</p>
<h1 class="title" id="t">${c.title}</h1>
<p class="line">${c.line}</p>
<div class="grain"></div>
<script>
  // The title as big as fits: two lines at most, clear of the line under it. Run once the fonts
  // are in, or it measures the fallback.
  window.fit = () => {
    const t = document.getElementById('t');
    let s = 150;
    t.style.fontSize = s + 'px';
    while ((t.scrollWidth > 640 || t.getBoundingClientRect().bottom > 630 - 58 - 110) && s > 60) t.style.fontSize = (s -= 4) + 'px';
  };
</script>
</body></html>`;

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const c of CARDS) {
  await tab.setContent(page(c));
  await tab.evaluate(() => document.fonts.ready.then(() => window.fit()));
  await tab.waitForTimeout(150);
  const png = await tab.screenshot();
  await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(out, `${c.file}.jpg`));
}
await browser.close();

// Icons: the ring on black, for home screens and the manifest.
const ring = path.join(root, 'src/assets/brand/ring.webp');
for (const [file, size] of [['public/apple-touch-icon.png', 180], ['public/icon-192.png', 192], ['public/icon-512.png', 512]]) {
  const inner = Math.round(size * 0.7);
  const mark = await sharp(ring).resize(inner, inner).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: '#0b0b0b' } })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toFile(path.join(root, file));
}
console.log(`og: ${CARDS.length} cards, 3 icons`);
