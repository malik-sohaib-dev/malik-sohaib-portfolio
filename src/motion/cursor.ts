// The mercury drop: a small chrome drop that trails the pointer and stretches along its path when
// it moves fast. Over something you can act on it swells into a disc and says what will happen
// ("View", "Visit"). The system cursor stays visible. Fine pointers only; it jumps under reduced motion.
import { onFrame, reducedMotion } from './clock';

let started = false;

export function startCursor() {
  if (started || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  started = true;
  const el = document.createElement('div');
  el.className = 'cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="cursor__drop"></span><span class="cursor__label"></span>';
  document.documentElement.append(el); // outside <body>, so client-side navigation keeps it
  const drop = el.firstElementChild as HTMLElement;
  const label = el.lastElementChild as HTMLElement;

  const aim = { x: -200, y: -200 };
  const pos = { x: -200, y: -200 };
  let size = 1; // 1 at rest, larger over a target
  let target: HTMLElement | null = null;
  let stop: (() => void) | null = null;

  const follow = () => {
    stop ??= onFrame(() => {
      const k = reducedMotion() ? 1 : 0.2;
      const dx = aim.x - pos.x;
      const dy = aim.y - pos.y;
      pos.x += dx * k;
      pos.y += dy * k;
      const want = target ? 5.2 : 1;
      size += (want - size) * 0.18;
      // Stretch along the direction of travel, and thin across it, like a drop in motion.
      const speed = Math.min(1, Math.hypot(dx, dy) / 140);
      const angle = Math.atan2(dy, dx);
      const stretch = target ? 1 : 1 + speed * 1.6;
      el.style.translate = `${pos.x}px ${pos.y}px`;
      drop.style.transform = `rotate(${angle}rad) scale(${size * stretch}, ${size * (1 - speed * 0.35)})`;
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1 && Math.abs(want - size) < 0.01) {
        stop = null;
        return false;
      }
    });
  };

  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      aim.x = e.clientX;
      aim.y = e.clientY;
      el.classList.add('is-in');
      const t = (e.target as HTMLElement).closest?.<HTMLElement>('[data-cursor]') ?? null;
      if (t !== target) {
        target = t;
        if (t) label.textContent = t.dataset.cursor!;
        el.classList.toggle('is-on', !!t);
      }
      follow();
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => {
    target = null;
    el.classList.remove('is-on', 'is-in');
  });
  addEventListener('pointerdown', () => el.classList.add('is-down'));
  addEventListener('pointerup', () => el.classList.remove('is-down'));
  document.addEventListener('astro:after-swap', () => {
    target = null;
    el.classList.remove('is-on');
  });
}
