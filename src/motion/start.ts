// Boots the page behaviour and re-runs it after every client-side navigation.
import { initStrip } from './strip';

type Cleanup = (() => void) | void;
const inits: (() => Cleanup)[] = [initStrip, initReveals, initVideos, initMenu, initScrolled];
let cleanups: Cleanup[] = [];

function flags() {
  const html = document.documentElement;
  html.classList.add('js');
  html.classList.toggle('motion', !matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function page() {
  cleanups.forEach((c) => c?.());
  cleanups = inits.map((init) => init());
}

export function start() {
  document.addEventListener('astro:after-swap', flags);
  // Fires on the first load too.
  document.addEventListener('astro:page-load', page);
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

function initMenu(): Cleanup {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!btn || !menu) return;
  const label = btn.querySelector('[data-menu-label]')!;
  const set = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close' : 'Menu';
    menu.hidden = !open;
    document.documentElement.classList.toggle('menu-open', open);
    if (open) menu.querySelector<HTMLElement>('a')?.focus();
  };
  const toggle = () => set(Boolean(menu.hidden));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !menu.hidden) {
      set(false);
      btn.focus();
    }
    // Keep focus inside the open menu (the toggle counts as inside).
    if (e.key === 'Tab' && !menu.hidden) {
      const items = [btn, ...menu.querySelectorAll<HTMLElement>('a')];
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === items.length - 1 ? 0 : i + 1;
      e.preventDefault();
      items[next].focus();
    }
  };
  const onClick = (e: Event) => {
    if ((e.target as HTMLElement).closest('a')) set(false);
  };
  btn.addEventListener('click', toggle);
  document.addEventListener('keydown', onKey);
  menu.addEventListener('click', onClick);
  return () => {
    set(false);
    btn.removeEventListener('click', toggle);
    document.removeEventListener('keydown', onKey);
    menu.removeEventListener('click', onClick);
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
