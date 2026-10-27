// Posters lean toward the pointer in 3D, and the art drifts the other way behind the type, so the
// card reads as an object with depth. Fine pointers only; off under reduced motion.
import { onFrame } from './clock';

const MAX_X = 7; // degrees around the horizontal axis
const MAX_Y = 9; // degrees around the vertical axis
const DRIFT = 14; // px the art moves against the tilt

let started = false;

export function startTilt() {
  if (started || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  started = true;
  let card: HTMLElement | null = null;
  let art: HTMLElement | null = null;
  let stop: (() => void) | null = null;
  const cur = { x: 0, y: 0 };
  const aim = { x: 0, y: 0 };

  const apply = () => {
    if (!card || !art) return;
    card.style.transform = `perspective(1100px) rotateX(${(-cur.y * MAX_X).toFixed(2)}deg) rotateY(${(cur.x * MAX_Y).toFixed(2)}deg)`;
    art.style.translate = `${(-cur.x * DRIFT).toFixed(1)}px ${(-cur.y * DRIFT).toFixed(1)}px`;
    art.style.scale = String(1 + 0.06 * Math.min(1, Math.hypot(cur.x, cur.y) * 3 + 0.5));
  };
  const run = () => {
    stop ??= onFrame(() => {
      cur.x += (aim.x - cur.x) * 0.1;
      cur.y += (aim.y - cur.y) * 0.1;
      apply();
      if (Math.abs(aim.x - cur.x) + Math.abs(aim.y - cur.y) < 0.001 && aim.x === 0 && aim.y === 0) {
        card?.style.removeProperty('transform');
        art?.style.removeProperty('translate');
        art?.style.removeProperty('scale');
        card = art = null;
        stop = null;
        return false;
      }
    });
  };

  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const next = (e.target as HTMLElement).closest?.<HTMLElement>('a[data-poster]');
      if (next !== card) {
        if (card) {
          // Snap the old card back at once; the new one eases in.
          card.style.removeProperty('transform');
          art?.style.removeProperty('translate');
          art?.style.removeProperty('scale');
        }
        card = next;
        art = next?.querySelector<HTMLElement>('.poster__bg') ?? null;
        cur.x = cur.y = 0;
      }
      if (!card) {
        aim.x = aim.y = 0;
        return;
      }
      const r = card.getBoundingClientRect();
      aim.x = (e.clientX - r.left) / r.width - 0.5;
      aim.y = (e.clientY - r.top) / r.height - 0.5;
      run();
    },
    { passive: true },
  );
  document.addEventListener('pointerout', (e) => {
    if (card && !card.contains(e.relatedTarget as Node) && (e.target as HTMLElement).closest?.('a[data-poster]') === card) {
      aim.x = aim.y = 0;
      run();
    }
  });
}
