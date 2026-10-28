// Four ways to point, compared live with ?cursor=1..4 (remembered for the session, picker bottom left):
//   1 Quiet  the system cursor; buttons lean toward it and a poster answers with its own tab.
//   2 Blend  a small dot that inverts what is under it; over a poster it rings the point and names it.
//   3 Focus  a thin plus; corner brackets lock onto what you can act on and name it.
//   4 Orbit  the system cursor and leaning buttons; over a poster a ring of words turns round it.
// Fine pointers only. Everything snaps instead of easing under reduced motion.
import { onFrame, reducedMotion } from './clock';

export type CursorStyle = '1' | '2' | '3' | '4';
const NAMES: Record<CursorStyle, string> = { '1': 'Quiet', '2': 'Blend', '3': 'Focus', '4': 'Orbit' };
const ACT = 'a[href], button, [data-cursor]';
const LEAN = '.btn, .hdr__menu';

let started = false;

export const cursorStyle = (): CursorStyle => {
  const c = document.documentElement.dataset.cursor;
  return c === '2' || c === '3' || c === '4' ? c : '1';
};

export function startCursor() {
  if (started || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  started = true;
  const style = cursorStyle();
  picker(style);
  if (style === '1' || style === '4') lean();
  if (style === '2') blend();
  if (style === '3') focus();
  if (style === '4') orbit();
}

/** Pointer position plus the element under it, for the followers below. */
function track(onMove: (x: number, y: number, el: Element | null) => void) {
  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') onMove(e.clientX, e.clientY, e.target as Element);
    },
    { passive: true },
  );
}

/** A follower that eases toward the pointer on the shared clock, and sleeps once it arrives. */
function follower(el: HTMLElement, k = 0.22, extra?: () => boolean) {
  const aim = { x: -300, y: -300 };
  const pos = { x: -300, y: -300 };
  let stop: (() => void) | null = null;
  const wake = () => {
    stop ??= onFrame(() => {
      const f = reducedMotion() ? 1 : k;
      pos.x += (aim.x - pos.x) * f;
      pos.y += (aim.y - pos.y) * f;
      el.style.translate = `${pos.x}px ${pos.y}px`;
      const busy = extra?.() ?? false;
      if (!busy && Math.abs(aim.x - pos.x) < 0.1 && Math.abs(aim.y - pos.y) < 0.1) {
        stop = null;
        return false;
      }
    });
  };
  return {
    aim,
    move(x: number, y: number) {
      aim.x = x;
      aim.y = y;
      wake();
    },
    wake,
  };
}

function mount(cls: string, html: string) {
  const el = document.createElement('div');
  el.className = `cur ${cls}`;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = html;
  document.documentElement.append(el); // outside <body>, so client-side navigation keeps it
  document.documentElement.addEventListener('pointerleave', () => el.classList.remove('is-in'));
  return el;
}

const labelOf = (t: HTMLElement | null) => t?.dataset.cursor ?? '';

// 1 and 4: buttons lean a few pixels toward the pointer and settle back when it leaves.
function lean() {
  let cur: HTMLElement | null = null;
  const release = () => {
    if (!cur) return;
    cur.style.removeProperty('--mx');
    cur.style.removeProperty('--my');
    cur = null;
  };
  track((x, y, el) => {
    const b = el?.closest<HTMLElement>(LEAN) ?? null;
    if (b !== cur) release();
    if (!b || reducedMotion()) return;
    cur = b;
    const r = b.getBoundingClientRect();
    const dx = (x - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (y - (r.top + r.height / 2)) / (r.height / 2);
    b.style.setProperty('--mx', `${(dx * 6).toFixed(2)}px`);
    b.style.setProperty('--my', `${(dy * 4).toFixed(2)}px`);
  });
  document.addEventListener('astro:after-swap', release);
}

// 2: the dot. Difference blending inverts whatever is under it, so it reads on black and on paper.
function blend() {
  document.documentElement.classList.add('cur-own');
  const el = mount('cur--blend', '<span class="cur__ring"></span><span class="cur__dot"></span><span class="cur__tag"></span>');
  const tag = el.querySelector<HTMLElement>('.cur__tag')!;
  const f = follower(el, 0.3);
  let on: HTMLElement | null = null;
  track((x, y, t) => {
    el.classList.add('is-in');
    const hit = t?.closest<HTMLElement>(ACT) ?? null;
    if (hit !== on) {
      on = hit;
      const big = !!hit?.dataset.cursor;
      el.classList.toggle('is-link', !!hit && !big);
      el.classList.toggle('is-lens', big);
      if (big) tag.textContent = labelOf(hit);
    }
    f.move(x, y);
  });
  addEventListener('pointerdown', () => el.classList.add('is-down'));
  addEventListener('pointerup', () => el.classList.remove('is-down'));
  document.addEventListener('astro:after-swap', () => {
    on = null;
    el.classList.remove('is-link', 'is-lens');
  });
}

// 3: the plus and its brackets. Locked, the brackets ease to the target's box (tracked every
// frame, so they ride along with scrolling and tilting); free, they close in on the plus.
function focus() {
  document.documentElement.classList.add('cur-own');
  const el = mount('cur--focus', '<span class="cur__plus"></span>');
  const box = mount('cur--box', '<i></i><i></i><i></i><i></i><span class="cur__name"></span>');
  const name = box.querySelector<HTMLElement>('.cur__name')!;
  const b = { x: -300, y: -300, w: 0, h: 0 };
  let target: HTMLElement | null = null;
  const plus = follower(el, 0.45, () => tick());
  function tick() {
    const k = reducedMotion() ? 1 : 0.24;
    let want;
    if (target?.isConnected) {
      const r = target.getBoundingClientRect();
      const pad = r.width > 300 ? 10 : 6;
      want = { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 };
    } else {
      want = { x: plus.aim.x - 9, y: plus.aim.y - 9, w: 18, h: 18 };
    }
    b.x += (want.x - b.x) * k;
    b.y += (want.y - b.y) * k;
    b.w += (want.w - b.w) * k;
    b.h += (want.h - b.h) * k;
    box.style.translate = `${b.x}px ${b.y}px`;
    box.style.width = `${b.w}px`;
    box.style.height = `${b.h}px`;
    const moving = Math.abs(want.x - b.x) + Math.abs(want.y - b.y) + Math.abs(want.w - b.w) + Math.abs(want.h - b.h) > 0.4;
    return moving || !!target; // a locked target can move under the pointer (scroll, tilt)
  }
  track((x, y, t) => {
    el.classList.add('is-in');
    box.classList.add('is-in');
    const hit = t?.closest<HTMLElement>(ACT) ?? null;
    if (hit !== target) {
      target = hit;
      el.classList.toggle('is-locked', !!hit);
      box.classList.toggle('is-locked', !!hit);
      name.textContent = labelOf(hit);
      box.classList.toggle('has-name', !!labelOf(hit));
    }
    plus.move(x, y);
  });
  addEventListener('scroll', () => target && plus.wake(), { passive: true });
  document.documentElement.addEventListener('pointerleave', () => {
    target = null;
    box.classList.remove('is-in', 'is-locked');
  });
  document.addEventListener('astro:after-swap', () => {
    target = null;
    el.classList.remove('is-locked');
    box.classList.remove('is-locked', 'has-name');
  });
}

// 4: a ring of words that turns round the pointer, over posters only.
function orbit() {
  const el = mount(
    'cur--orbit',
    `<svg viewBox="0 0 120 120"><defs><path id="cur-ring" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs>
      <text><textPath href="#cur-ring" textLength="289"></textPath></text></svg><span class="cur__arrow">↗</span>`,
  );
  const path = el.querySelector('textPath')!;
  const f = follower(el, 0.2);
  let on: HTMLElement | null = null;
  track((x, y, t) => {
    const hit = t?.closest<HTMLElement>('[data-cursor]') ?? null;
    if (hit !== on) {
      on = hit;
      el.classList.toggle('is-in', !!hit);
      if (hit) path.textContent = `${labelOf(hit)} · `.repeat(3).toUpperCase();
    }
    f.move(x, y);
  });
  document.addEventListener('astro:after-swap', () => {
    on = null;
    el.classList.remove('is-in');
  });
}

// The comparison picker. Goes once a style is chosen.
function picker(style: CursorStyle) {
  const nav = document.createElement('div');
  nav.className = 'cur-pick';
  nav.setAttribute('role', 'group');
  nav.setAttribute('aria-label', 'Cursor style');
  nav.innerHTML =
    '<span>Cursor</span>' +
    (Object.keys(NAMES) as CursorStyle[])
      .map((k) => `<button type="button" data-k="${k}" aria-pressed="${k === style}">${k} ${NAMES[k]}</button>`)
      .join('');
  nav.addEventListener('click', (e) => {
    const k = (e.target as HTMLElement).closest<HTMLElement>('[data-k]')?.dataset.k;
    if (!k) return;
    try {
      sessionStorage.setItem('cursor', k);
    } catch {}
    location.reload();
  });
  document.documentElement.append(nav);
}
