// The loader's counter follows real progress (the fonts and the hero picture), runs for at least
// a beat so the pour can play, never longer than about two and a half seconds, then hands off.
import { onFrame } from './clock';

const MIN_MS = 1300;
const MAX_MS = 2500;

export function runLoader() {
  const html = document.documentElement;
  const el = document.getElementById('loader');
  if (!html.classList.contains('is-loading') || !el) return;
  const count = el.querySelector<HTMLElement>('[data-loader-count]')!;
  const heroImg = document.querySelector<HTMLImageElement>(".hs__wall img");
  const tasks: Promise<unknown>[] = [document.fonts?.ready ?? Promise.resolve()];
  if (heroImg && !heroImg.complete) tasks.push(new Promise((r) => heroImg.addEventListener('load', r, { once: true })).then(() => heroImg.decode?.().catch(() => {})));
  let done = 0;
  tasks.forEach((t) => t.then(() => done++));

  const t0 = performance.now();
  let shown = 0;
  let finished = false;
  onFrame((now) => {
    const elapsed = now - t0;
    const real = (done + 1) / (tasks.length + 1); // never 0: the page itself has arrived
    const time = Math.min(1, elapsed / MIN_MS);
    const target = elapsed > MAX_MS ? 1 : Math.min(real, time) * 100;
    shown += (target - shown) * 0.12;
    if (target === 100 && shown > 99.5) shown = 100;
    count.textContent = String(Math.floor(shown)).padStart(3, '0');
    if (shown < 100 || finished) return;
    finished = true;
    el.classList.add('is-out');
    html.classList.replace('is-loading', 'is-ready');
    try {
      sessionStorage.setItem('loaded', '1');
    } catch {}
    setTimeout(() => el.remove(), 950);
    return false;
  });
}
