// Boots the page behaviour and re-runs it after every client-side navigation.
import { startCursor } from './cursor';
import { startLiquid } from './liquid';
import { runLoader } from './loader';
import { startTilt } from './tilt';

type Cleanup = (() => void) | void;
const inits: (() => Cleanup)[] = [initFields, initReveals, initVideos, initScrolled];
let cleanups: Cleanup[] = [];

/** Components register their page behaviour here; it runs on every page and is cleaned up on leave. */
export function onPage(init: () => Cleanup) {
  inits.push(init);
}

function flags() {
  const html = document.documentElement;
  // Astro replaces <html> attributes on navigation: restore the palette being previewed.
  try {
    const p = sessionStorage.getItem('palette');
    if (p) html.dataset.palette = p;
  } catch {}
  html.classList.add('js');
  // The loader only plays on the first load; every later page is ready at once.
  if (!html.classList.contains('is-loading')) html.classList.add('is-ready');
  html.classList.toggle('motion', !matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function page() {
  cleanups.forEach((c) => c?.());
  cleanups = inits.map((init) => init());
}

export function start() {
  startCursor();
  startLiquid();
  startTilt();
  runLoader();
  document.addEventListener('astro:after-swap', flags);
  // Fires on the first load too.
  document.addEventListener('astro:page-load', page);
}

// Chapters: the section crossing the middle of the screen sets the page's colour field.
// Every colour on the page reads the field's variables, so text and ground always change together.
function initFields(): Cleanup {
  const sections = [...document.querySelectorAll<HTMLElement>('[data-field]')];
  const html = document.documentElement;
  if (!sections.length) return void delete html.dataset.field;
  html.dataset.field = sections[0].dataset.field;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) html.dataset.field = (e.target as HTMLElement).dataset.field;
    },
    { rootMargin: '-50% 0px -50% 0px' },
  );
  sections.forEach((s) => io.observe(s));
  return () => io.disconnect();
}

function initReveals(): Cleanup {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

// Gameplay clips play only while on screen, never under reduced motion, and can be paused.
function initVideos(): Cleanup {
  const vids = document.querySelectorAll<HTMLVideoElement>('video[data-autoplay]');
  if (!vids.length) return;
  const reduce = !document.documentElement.classList.contains('motion');
  const paused = new WeakSet<HTMLVideoElement>(reduce ? [...vids] : []);
  const sync = (v: HTMLVideoElement, visible: boolean) => {
    if (visible && !paused.has(v)) v.play().catch(() => {});
    else v.pause();
    v.closest('[data-video]')?.toggleAttribute('data-playing', !v.paused || (visible && !paused.has(v)));
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => sync(e.target as HTMLVideoElement, e.isIntersecting)), { threshold: 0.4 });
  const offs: (() => void)[] = [];
  vids.forEach((v) => {
    io.observe(v);
    const btn = v.closest('[data-video]')?.querySelector<HTMLButtonElement>('[data-video-toggle]');
    if (!btn) return;
    const update = () => {
      const playing = !v.paused;
      btn.setAttribute('aria-pressed', String(!playing));
      btn.querySelector('[data-video-label]')!.textContent = playing ? 'Pause' : 'Play';
      v.closest('[data-video]')?.toggleAttribute('data-playing', playing);
    };
    const toggle = () => {
      if (v.paused) {
        paused.delete(v);
        v.play().catch(() => {});
      } else {
        paused.add(v);
        v.pause();
      }
    };
    btn.addEventListener('click', toggle);
    v.addEventListener('play', update);
    v.addEventListener('pause', update);
    update();
    offs.push(() => btn.removeEventListener('click', toggle));
  });
  return () => {
    io.disconnect();
    offs.forEach((o) => o());
  };
}

// The header gets its hairline once the page has moved: watched, not polled.
function initScrolled(): Cleanup {
  const sentinel = document.querySelector('[data-top]');
  if (!sentinel) return;
  const io = new IntersectionObserver(([e]) => document.documentElement.classList.toggle('scrolled', !e.isIntersecting));
  io.observe(sentinel);
  return () => io.disconnect();
}
