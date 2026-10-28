// The cursor: a small dot that inverts whatever is under it (difference blending), so it reads on
// black and on paper alike. Over a link it swells into a ring; over a poster it shrinks to a point
// inside a thin ring and names where it goes; over the film it becomes a lens with the action's icon
// knocked out of it and its words turning round it, spun faster by the hand that moves it.
// Fine pointers only. It follows without easing under reduced motion, and the ring stops turning.
import { onFrame, reducedMotion } from './clock';

const ACT = 'a[href], button, [data-cursor]';
const ICONS = {
  sound: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/>',
  pause: '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/>',
  play: '<path d="M8 5l11 7-11 7z"/>',
};

let started = false;

export function startCursor() {
  if (started || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  started = true;
  const html = document.documentElement;
  html.classList.add('cur-own');

  const el = document.createElement('div');
  el.className = 'cur';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<span class="cur__ring"></span><span class="cur__dot"></span><span class="cur__tag"></span>
    <span class="cur__film">
      <svg class="cur__words" viewBox="0 0 140 140"><defs><path id="cur-orbit" d="M70,70 m-55,0 a55,55 0 1,1 110,0 a55,55 0 1,1 -110,0"/></defs><text><textPath href="#cur-orbit" textLength="345"></textPath></text></svg>
      <span class="cur__lens"><svg viewBox="0 0 24 24"></svg></span>
    </span>`;
  html.append(el); // outside <body>, so client-side navigation keeps it
  const tag = el.querySelector<HTMLElement>('.cur__tag')!;
  const skin = el.querySelector<HTMLElement>('.cur__film')!;
  const words = el.querySelector<SVGElement>('.cur__words')!;
  const path = el.querySelector('textPath')!;
  const icon = el.querySelector<SVGElement>('.cur__lens svg')!;

  const aim = { x: -300, y: -300 };
  const pos = { x: -300, y: -300 };
  let target: HTMLElement | null = null;
  let film = false;
  let label = '';
  let spin = 0; // degrees
  let vel = 0; // smoothed speed, px per frame
  let dir = 1;
  let stop: (() => void) | null = null;

  // The film's words and icon follow its state (play with sound, pause, play) while hovered.
  const setFilm = (text: string) => {
    if (text === label) return;
    label = text;
    // As many times as fills the ring evenly: twice for "play with sound", five times for "pause".
    path.textContent = `${text} · `.repeat(Math.max(2, Math.round(34 / (text.length + 3)))).toUpperCase();
    icon.innerHTML = /sound/i.test(text) ? ICONS.sound : /pause/i.test(text) ? ICONS.pause : ICONS.play;
  };

  const tick = () => {
    const still = reducedMotion();
    const k = still ? 1 : 0.3;
    const dx = aim.x - pos.x;
    const dy = aim.y - pos.y;
    pos.x += dx * k;
    pos.y += dy * k;
    el.style.translate = `${pos.x}px ${pos.y}px`;
    const speed = Math.hypot(dx, dy);
    vel += (speed - vel) * 0.15;
    if (Math.abs(dx) > 0.5) dir = dx > 0 ? 1 : -1;
    if (film) {
      if (target) setFilm(target.dataset.cursor ?? '');
      // A record under the hand: a slow idle turn, faster the faster it moves.
      if (!still) spin += dir * (0.35 + Math.min(vel, 60) * 0.12);
      words.style.rotate = `${spin}deg`;
      // A little squash along the way it travels.
      const s = Math.min(vel, 50) / 50;
      const angle = Math.atan2(dy, dx);
      skin.style.transform = still ? '' : `rotate(${angle}rad) scale(${1 + s * 0.12}, ${1 - s * 0.08}) rotate(${-angle}rad)`;
    }
    if (!film && speed < 0.1 && vel < 0.1) {
      stop = null;
      return false;
    }
  };
  // Guarded, so a bad frame never strands the dot where it was.
  const safe = () => {
    try {
      return tick();
    } catch (e) {
      console.error(e);
    }
  };
  const wake = () => void (stop ??= onFrame(safe));

  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      aim.x = e.clientX;
      aim.y = e.clientY;
      el.classList.add('is-in');
      const hit = (e.target as HTMLElement).closest?.<HTMLElement>(ACT) ?? null;
      if (hit !== target) {
        target = hit;
        film = !!hit?.closest('[data-cursor-skin="film"]');
        const named = !film && !!hit?.dataset.cursor;
        el.classList.toggle('is-link', !!hit && !named && !film);
        el.classList.toggle('is-lens', named);
        el.classList.toggle('is-film', film);
        if (named) tag.textContent = hit!.dataset.cursor!;
        if (film) setFilm(hit!.dataset.cursor ?? 'Play');
      }
      wake();
    },
    { passive: true },
  );
  const reset = () => {
    target = null;
    film = false;
    el.classList.remove('is-link', 'is-lens', 'is-film');
  };
  html.addEventListener('pointerleave', () => {
    reset();
    el.classList.remove('is-in');
  });
  addEventListener('pointerdown', () => el.classList.add('is-down'));
  addEventListener('pointerup', () => el.classList.remove('is-down'));
  document.addEventListener('astro:after-swap', reset);
}
