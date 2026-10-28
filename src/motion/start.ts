// Boots the page behaviour and re-runs it after every client-side navigation.
import { startCursor } from './cursor';
import { startLiquid } from './liquid';
import { runLoader } from './loader';
import { startTilt } from './tilt';

type Cleanup = (() => void) | void;
const inits: (() => Cleanup)[] = [initFields, initReveals, initVideos, initLoops, initMenu, initScrolled, initMark, initOutside];
let cleanups: Cleanup[] = [];

/** Components register their page behaviour here; it runs on every page and is cleaned up on leave. */
export function onPage(init: () => Cleanup) {
  inits.push(init);
}

function flags() {
  const html = document.documentElement;
  // Astro replaces <html> attributes on navigation: the cursor's class goes back on.
  html.classList.toggle('cur-own', !!document.querySelector('html > .cur'));
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

/** Play a poster loop and fade it in over its still; or pause it. Never under reduced motion. */
export function playLoop(v: HTMLVideoElement | null | undefined, on: boolean) {
  if (!v) return;
  if (!on || !document.documentElement.classList.contains('motion')) return v.pause();
  v.play()
    .then(() => v.classList.add('is-playing'))
    .catch(() => {});
}

// Poster loops on the page play while they are on screen.
function initLoops(): Cleanup {
  const vids = document.querySelectorAll<HTMLVideoElement>('video[data-loop]');
  if (!vids.length) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => playLoop(e.target as HTMLVideoElement, e.isIntersecting)), { threshold: 0.25 });
  vids.forEach((v) => io.observe(v));
  return () => io.disconnect();
}

function initMenu(): Cleanup {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!btn || !menu) return;
  const html = document.documentElement;
  const label = btn.querySelector('[data-menu-label]')!;
  const links = [...menu.querySelectorAll<HTMLAnchorElement>('.menu__link')];
  const previews = [...menu.querySelectorAll<HTMLElement>('[data-preview-for]')];
  const copy = menu.querySelector<HTMLButtonElement>('[data-copy]');
  let closing = 0;

  // The current page's link is marked.
  for (const a of links) {
    const url = new URL(a.href);
    if (url.pathname === location.pathname && (!url.hash || url.pathname !== '/')) a.setAttribute('aria-current', 'page');
  }
  // Show the hovered link's poster, and hand it the liquid glass while the menu is open.
  const preview = (slug?: string) => {
    let on: HTMLElement | null = null;
    previews.forEach((p) => {
      const hit = p.dataset.previewFor === slug;
      p.classList.toggle('is-on', hit);
      if (hit) on = p.querySelector<HTMLElement>('[data-liquid]');
      playLoop(p.querySelector('video'), hit && !menu.hidden);
    });
    if (!menu.hidden) document.dispatchEvent(new CustomEvent('liquid:prefer', { detail: on }));
  };

  const set = (open: boolean) => {
    clearTimeout(closing);
    btn.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close menu' : 'Open menu';
    html.classList.toggle('menu-open', open);
    html.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => preview(links[0]?.dataset.preview));
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      links[0]?.focus({ preventScroll: true });
    } else {
      document.dispatchEvent(new CustomEvent('liquid:prefer', { detail: null }));
      previews.forEach((p) => playLoop(p.querySelector('video'), false));
      menu.classList.remove('is-open');
      // Hide once the wipe has played (at once under reduced motion).
      closing = window.setTimeout(() => (menu.hidden = true), html.classList.contains('motion') ? 700 : 0);
    }
  };
  const toggle = () => set(Boolean(menu.hidden) || !menu.classList.contains('is-open'));
  const onKey = (e: KeyboardEvent) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') {
      set(false);
      btn.focus();
    }
    // Keep focus inside the open menu (the toggle counts as inside).
    if (e.key === 'Tab') {
      const items = [btn, ...menu.querySelectorAll<HTMLElement>('a, button')];
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === items.length - 1 ? 0 : i + 1;
      e.preventDefault();
      items[next].focus();
    }
  };
  const onClick = (e: Event) => {
    if ((e.target as HTMLElement).closest('a')) set(false);
  };
  const onOver = (e: Event) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('[data-preview]');
    if (a) preview(a.dataset.preview);
  };
  const onCopy = async () => {
    if (!copy) return;
    const out = copy.querySelector('[data-copy-label]')!;
    try {
      await navigator.clipboard.writeText(copy.dataset.copy!);
      out.textContent = 'Copied to clipboard';
    } catch {
      location.href = `mailto:${copy.dataset.copy}`;
      return;
    }
    setTimeout(() => (out.textContent = copy.dataset.copy!), 1600);
  };
  btn.addEventListener('click', toggle);
  document.addEventListener('keydown', onKey);
  menu.addEventListener('click', onClick);
  menu.addEventListener('pointerover', onOver);
  menu.addEventListener('focusin', onOver);
  copy?.addEventListener('click', onCopy);
  return () => {
    html.classList.remove('menu-open');
    html.style.overflow = '';
    clearTimeout(closing);
    btn.removeEventListener('click', toggle);
    document.removeEventListener('keydown', onKey);
    menu.removeEventListener('click', onClick);
    menu.removeEventListener('pointerover', onOver);
    menu.removeEventListener('focusin', onOver);
    copy?.removeEventListener('click', onCopy);
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

// The header ring starts to wobble once the page is idle and its sprite has decoded, so it never
// competes with the hero for the network; under reduced motion the sprite is never fetched.
function initMark(): Cleanup {
  const mark = document.querySelector<HTMLElement>('[data-mark]');
  if (!mark || !document.documentElement.classList.contains('motion')) return;
  let live = true;
  const go = () => {
    const img = new Image();
    img.src = '/brand/ring-spin.webp';
    img.decode().then(() => live && mark.classList.add('is-spinning'), () => {});
  };
  // Safari has no requestIdleCallback: a short wait after the page has loaded does the same job here.
  const id = window.setTimeout(go, document.readyState === 'complete' ? 1200 : 2400);
  return () => {
    live = false;
    clearTimeout(id);
  };
}

// Links that leave the site open in a new tab, wherever they were written.
function initOutside(): Cleanup {
  for (const a of document.querySelectorAll<HTMLAnchorElement>('a[href^="http"]')) {
    if (a.origin === location.origin || a.target) continue;
    a.target = '_blank';
    a.rel = 'noopener';
  }
}
