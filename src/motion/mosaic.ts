// A portrait as a mosaic. It resolves from big blocks to its resting grain as it comes into view,
// and under the pointer a lens of finer blocks (with a ring of middling ones) brings it into focus.
// Canvas 2D: the photo is averaged down into a tiny canvas and drawn back up without smoothing.
// It draws only while something changes; under reduced motion it rests at once.
import { onFrame, reducedMotion } from './clock';

const START = 72; // block size, in CSS pixels, when the reveal begins

export function mosaic(stage: HTMLElement): () => void {
  const canvas = stage.querySelector('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const small = document.createElement('canvas');
  const sctx = small.getContext('2d')!;
  const img = new Image();
  img.decoding = 'async';
  const fx = Number(stage.dataset.focusX ?? 0.5);
  const fy = Number(stage.dataset.focusY ?? 0.5);

  let W = 0;
  let H = 0;
  let dpr = 1;
  let rest = 12;
  let progress = 0; // of the reveal, 0 to 1; the block size follows from it
  let ready = false;
  let revealAt = -1; // when the reveal started, or -1 before it
  const lens = { x: 0, y: 0, r: 0, want: 0 };
  let stop: (() => void) | null = null;

  // The part of the photo that covers the stage, kept around its focus point.
  const crop = () => {
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const sw = W / s;
    const sh = H / s;
    const sx = Math.min(img.naturalWidth - sw, Math.max(0, img.naturalWidth * fx - sw / 2));
    const sy = Math.min(img.naturalHeight - sh, Math.max(0, img.naturalHeight * fy - sh / 2));
    return [sx, sy, sw, sh] as const;
  };

  const pixelate = (b: number) => {
    const cols = Math.max(1, Math.ceil(W / b));
    const rows = Math.max(1, Math.ceil(H / b));
    if (small.width !== cols || small.height !== rows) {
      small.width = cols;
      small.height = rows;
    }
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(img, ...crop(), 0, 0, cols, rows);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, cols, rows, 0, 0, cols * b * dpr, rows * b * dpr);
  };

  const ring = (r: number, b: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(lens.x * dpr, lens.y * dpr, r * dpr, 0, Math.PI * 2);
    ctx.clip();
    pixelate(b);
    ctx.restore();
  };

  const draw = () => {
    const block = START + (rest - START) * (1 - Math.pow(1 - progress, 3));
    pixelate(block);
    if (lens.r > 2) {
      ring(lens.r * 1.6, Math.max(3, block / 2));
      ring(lens.r, Math.max(2, block / 4));
    }
  };

  // Every way out of a frame clears `stop`, so the next wake schedules a fresh one.
  const tick = (now: number) => {
    if (!ready || !W) {
      stop = null;
      return false;
    }
    const still = reducedMotion();
    let busy = false;
    if (revealAt >= 0 && progress < 1) {
      progress = still ? 1 : Math.min(1, (now - revealAt) / 1500);
      busy = progress < 1;
    }
    lens.r += (lens.want - lens.r) * (still ? 1 : 0.16);
    busy ||= Math.abs(lens.want - lens.r) > 0.5;
    draw();
    if (!busy && !moved) {
      stop = null;
      return false;
    }
    moved = false;
  };
  let moved = false;
  const wake = () => void (stop ??= onFrame(tick));

  const size = () => {
    const r = stage.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width;
    H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    rest = Math.min(14, Math.max(7, W / 110));
    wake();
  };
  const ro = new ResizeObserver(size);
  ro.observe(stage);

  // Load the photo when the stage is near; start the reveal once a good part of it shows.
  const near = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting || img.src) return;
      img.src = stage.dataset.src!;
      img.decode().then(
        () => {
          ready = true;
          stage.classList.add('is-drawn');
          wake();
        },
        () => {},
      );
    },
    { rootMargin: '600px 0px' },
  );
  near.observe(stage);
  const seen = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting || revealAt >= 0) return;
      revealAt = performance.now();
      wake();
    },
    { threshold: 0.3 },
  );
  seen.observe(stage);

  const move = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect();
    lens.x = e.clientX - r.left;
    lens.y = e.clientY - r.top;
    lens.want = Math.min(170, Math.max(90, W / 9));
    if (lens.r < 1) lens.r = 1;
    moved = true;
    wake();
  };
  const leave = () => {
    lens.want = 0;
    wake();
  };
  stage.addEventListener('pointermove', move);
  stage.addEventListener('pointerleave', leave);

  return () => {
    ro.disconnect();
    near.disconnect();
    seen.disconnect();
    stop?.();
    stage.removeEventListener('pointermove', move);
    stage.removeEventListener('pointerleave', leave);
  };
}
