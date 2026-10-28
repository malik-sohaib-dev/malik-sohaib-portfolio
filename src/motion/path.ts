// The career timeline's zoom. One value, the zoom z (0 = whole career, 1 = the last months),
// sets the visible window, and the window places every year, month, span and label.
// Scroll drives z while the section is pinned; the two buttons set it outright.
import { onFrame, reducedMotion } from './clock';

type Config = { start: number; end: number; zoomFrom: number; now: number };

export function initPath(): (() => void) | void {
  const section = document.querySelector<HTMLElement>('[data-path]');
  const tl = section?.querySelector<HTMLElement>('[data-tl]');
  if (!section || !tl) return;
  const cfg: Config = JSON.parse(tl.dataset.config!);
  const range = section.querySelector<HTMLElement>('[data-range]')!;
  const ghost = section.querySelector<HTMLElement>('[data-ghost]');
  const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-zoom]')];
  const axis = [...tl.querySelectorAll<HTMLElement>('.tl__axis > [data-t]')];
  const items = [...tl.querySelectorAll<HTMLElement>('.tl__item')].map((el) => ({
    t0: +el.dataset.t0!,
    t1: +el.dataset.t1!,
    bar: el.querySelector<HTMLElement>('.tl__bar')!,
    text: el.querySelector<HTMLElement>('.tl__text')!,
    mark: el.classList.contains('tl__item--mark'),
  }));
  const lane = tl.querySelector<HTMLElement>('.tl__lane')!;
  const tracks = [...tl.querySelectorAll<HTMLElement>('.tl__track')].map((el) => ({
    el,
    spans: [...el.querySelectorAll<HTMLElement>('.tl__item')].map((i) => [+i.dataset.t0!, +i.dataset.t1!]),
  }));
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = (m: number) => `${MONTHS[Math.floor(m) % 12]} ${2022 + Math.floor(m / 12)}`;

  // Zoom is exponential in the window's width, so every step feels like the same push in.
  const w0 = cfg.end - cfg.start;
  const w1 = cfg.end - cfg.zoomFrom;
  const windowAt = (z: number) => {
    const w = w0 * Math.pow(w1 / w0, z);
    return [cfg.end - w, w] as const;
  };

  let shownZ = -1;
  function place(z: number) {
    if (Math.abs(z - shownZ) < 0.0005) return;
    shownZ = z;
    const [a, w] = windowAt(z);
    const px = lane.clientWidth / w; // pixels per month
    const x = (t: number) => ((t - a) / w) * 100;
    for (const el of axis) {
      el.style.translate = `${x(+el.dataset.t!)}cqi 0`;
      if (el.hasAttribute('data-month')) el.classList.toggle('is-shown', px > 34);
    }
    for (const it of items) {
      it.bar.style.translate = `${x(it.t0)}cqi 0`;
      if (!it.mark) it.bar.style.scale = `${(it.t1 - it.t0) / w} 1`;
      // A label stays readable at the window's left edge while its span is still in view.
      const left = it.mark ? x(it.t0) : Math.max(0, x(it.t0));
      it.text.style.translate = `${left}cqi 0`;
      if (!it.mark) {
        const room = (Math.min(100, x(it.t1)) - left) / 100;
        it.text.style.maxWidth = `${Math.max(0, room) * 100}cqi`;
        it.text.classList.toggle('is-tight', room * lane.clientWidth < 260);
      }
    }
    // A lane with nothing in the window steps back instead of sitting there blank.
    for (const t of tracks) t.el.classList.toggle('is-empty', !t.spans.some(([t0, t1]) => t1 > a && t0 < cfg.end));
    range.textContent = z < 0.02 ? `${monthName(cfg.start)} to now` : `${monthName(a)} to now`;
    if (ghost) {
      const year = String(2022 + Math.floor(a / 12));
      if (ghost.textContent !== year) ghost.textContent = year;
      ghost.style.scale = String(1 + z * 0.45);
    }
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.zoom! === Math.round(z))));
  }

  // Scroll progress through the pinned section, read only while it is on screen.
  let target = 0;
  let z = 0;
  let manual: number | null = null;
  const reduce = reducedMotion();
  const progress = () => {
    const r = section.getBoundingClientRect();
    const total = r.height - innerHeight;
    return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
  };
  // The zoom plays between 15% and 85% of the pin, so it rests at both ends.
  const zoomFor = (p: number) => {
    const t = Math.min(1, Math.max(0, (p - 0.15) / 0.7));
    return t * t * (3 - 2 * t);
  };

  let stop: (() => void) | null = null;
  let lastP = -1;
  const run = () => {
    stop ??= onFrame(() => {
      const p = progress();
      if (p !== lastP) {
        if (lastP !== -1) manual = null; // scrolling takes over from a button
        lastP = p;
        if (!reduce) target = zoomFor(p);
      }
      if (manual !== null) target = manual;
      z += (target - z) * (reduce ? 1 : 0.14);
      if (Math.abs(target - z) < 0.0005) z = target;
      place(z);
    });
  };
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) run();
    else {
      stop?.();
      stop = null;
    }
  });
  io.observe(section);

  const onClick = (e: Event) => {
    manual = +(e.currentTarget as HTMLElement).dataset.zoom!;
    lastP = progress();
    run();
  };
  buttons.forEach((b) => b.addEventListener('click', onClick));
  const onResize = () => {
    shownZ = -1;
    place(z);
  };
  addEventListener('resize', onResize);
  place(0);

  return () => {
    io.disconnect();
    stop?.();
    buttons.forEach((b) => b.removeEventListener('click', onClick));
    removeEventListener('resize', onResize);
  };
}
