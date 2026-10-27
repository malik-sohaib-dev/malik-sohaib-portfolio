// A contextual cursor: a disc that appears only over things you can act on, saying what will
// happen ("View", "Play", "Copy"). The system cursor stays visible. Fine pointers only, motion on.
import { onFrame, reducedMotion } from './clock';

let started = false;

export function startCursor() {
  if (started || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  started = true;
  const el = document.createElement('div');
  el.className = 'cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="cursor__label"></span>';
  document.documentElement.append(el); // outside <body>, so client-side navigation keeps it
  const label = el.firstElementChild as HTMLElement;

  const aim = { x: -200, y: -200 };
  const pos = { x: -200, y: -200 };
  let stop: (() => void) | null = null;
  let current: HTMLElement | null = null;

  const follow = () => {
    stop ??= onFrame(() => {
      // The disc trails the pointer a little; under reduced motion it jumps.
      const k = reducedMotion() ? 1 : 0.22;
      pos.x += (aim.x - pos.x) * k;
      pos.y += (aim.y - pos.y) * k;
      el.style.translate = `${pos.x}px ${pos.y}px`;
      if (Math.abs(aim.x - pos.x) < 0.1 && Math.abs(aim.y - pos.y) < 0.1) {
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
      const target = (e.target as HTMLElement).closest?.<HTMLElement>('[data-cursor]') ?? null;
      if (target !== current) {
        current = target;
        if (target) label.textContent = target.dataset.cursor!;
        el.classList.toggle('is-on', !!target);
      }
      follow();
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => {
    current = null;
    el.classList.remove('is-on');
  });
  // A click squeezes the disc, so the press is felt.
  addEventListener('pointerdown', () => el.classList.add('is-down'));
  addEventListener('pointerup', () => el.classList.remove('is-down'));
  document.addEventListener('astro:after-swap', () => {
    current = null;
    el.classList.remove('is-on');
  });
}
