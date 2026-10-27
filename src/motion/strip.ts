// The hero's commit strip: the run-in, then scrubbing by pointer, finger or arrow keys.
// The playhead, the day bars, the tags and the counter all read one value: the day index.
import { easeOut, onFrame, reducedMotion } from './clock';

type Data = { slugs: string[]; names: Record<string, string>; days: [string, ...number[]][] };

const RUN_MS = 2200;
const RETURN_MS = 1400;

export function initStrip(): (() => void) | void {
  const strip = document.querySelector<HTMLElement>('[data-strip="hero"]');
  const raw = strip?.querySelector('[data-strip-data]')?.textContent;
  if (!strip || !raw) return;
  const data: Data = JSON.parse(raw);
  const n = data.days.length;
  const last = n - 1;
  const plot = strip.querySelector<HTMLElement>('.strip__plot')!;
  const head = strip.querySelector<HTMLElement>('.strip__head')!;
  const readout = strip.querySelector<HTMLElement>('[data-readout]')!;
  const bars = [...strip.querySelectorAll<HTMLElement>('.strip__day')];
  const tags = [...strip.querySelectorAll<HTMLElement>('[data-tag]')];
  const counter = document.querySelector<HTMLElement>('[data-counter]');
  const totals = data.days.map(([, ...c]) => c.reduce((a, b) => a + b, 0));
  const cum: number[] = [];
  totals.reduce((sum, v, i) => (cum[i] = sum + v), 0);
  const nf = new Intl.NumberFormat('en-US');

  let shown = -1;
  function show(i: number) {
    if (i === shown) return;
    shown = i;
    head.style.setProperty('--x', String((i + 0.5) / n));
    head.style.setProperty('--rx', i / n > 0.55 ? 'calc(-100% - 8px)' : '8px');
    if (counter) counter.textContent = nf.format(cum[i]);
    const [date, ...counts] = data.days[i];
    const parts = counts.map((c, k) => (c ? `${data.names[data.slugs[k]]} ${c}` : '')).filter(Boolean);
    readout.innerHTML = `<b>${date}</b>: ${totals[i]} commit${totals[i] === 1 ? '' : 's'}${parts.length ? `<br>${parts.join(', ')}` : ''}`;
    plot.setAttribute('aria-valuenow', String(i));
    plot.setAttribute('aria-valuetext', `${date}: ${totals[i]} commits, ${nf.format(cum[i])} so far`);
  }

  const stops: (() => void)[] = [];
  let returnTimer = 0;

  // Run-in: the playhead sweeps the 90 days and each bar rises as it passes.
  function run() {
    let start = 0;
    let up = -1;
    stops.push(
      onFrame((now) => {
        start ||= now;
        const t = Math.min(1, (now - start) / RUN_MS);
        const i = Math.round((1 - (1 - t) ** 2) * last); // a gentle ease, so the sweep reads
        for (let k = up + 1; k <= i; k++) bars[k].classList.add('is-up');
        for (const tag of tags) if (+tag.dataset.at! <= i) tag.classList.add('is-up');
        up = i;
        show(i);
        if (t < 1) return;
        strip!.classList.add('is-done');
        return false;
      }),
    );
  }

  // Back to the last day, gliding, after the visitor lets go.
  function glideHome() {
    const from = shown;
    let start = 0;
    stops.push(
      onFrame((now) => {
        if (strip!.classList.contains('is-scrubbing')) return false;
        start ||= now;
        const t = Math.min(1, (now - start) / 700);
        show(Math.round(from + (last - from) * easeOut(t)));
        return t < 1;
      }),
    );
  }

  function indexAt(clientX: number) {
    const r = plot.getBoundingClientRect();
    return Math.max(0, Math.min(last, Math.floor(((clientX - r.left) / r.width) * n)));
  }
  function scrubTo(i: number) {
    clearTimeout(returnTimer);
    strip!.classList.add('is-scrubbing', 'is-done');
    show(i);
  }
  function release(delay = RETURN_MS) {
    clearTimeout(returnTimer);
    returnTimer = window.setTimeout(() => {
      strip!.classList.remove('is-scrubbing');
      reducedMotion() ? show(last) : glideHome();
    }, delay);
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch' && !strip.classList.contains('is-scrubbing')) return;
    scrubTo(indexAt(e.clientX));
  };
  const onDown = (e: PointerEvent) => scrubTo(indexAt(e.clientX));
  const onLeave = (e: PointerEvent) => release(e.pointerType === 'touch' ? RETURN_MS : 300);
  const onKey = (e: KeyboardEvent) => {
    const step = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -7, PageUp: 7 }[e.key];
    let i = step !== undefined ? shown + step : e.key === 'Home' ? 0 : e.key === 'End' ? last : null;
    if (i === null) return;
    e.preventDefault();
    i = Math.max(0, Math.min(last, i));
    scrubTo(i);
  };
  const onBlur = () => release(0);
  const lit = (slug: string | null) => (slug ? (strip.dataset.lit = slug) : delete strip.dataset.lit);
  const onTagOver = (e: Event) => lit((e.currentTarget as HTMLElement).dataset.tag!);
  const onTagOut = () => lit(null);

  plot.addEventListener('pointermove', onMove);
  plot.addEventListener('pointerdown', onDown);
  plot.addEventListener('pointerleave', onLeave);
  plot.addEventListener('pointerup', onLeave);
  plot.addEventListener('pointercancel', onLeave);
  plot.addEventListener('keydown', onKey);
  plot.addEventListener('blur', onBlur);
  for (const t of tags) {
    t.addEventListener('pointerenter', onTagOver);
    t.addEventListener('pointerleave', onTagOut);
  }

  if (reducedMotion()) {
    strip.classList.add('is-done');
    show(last);
  } else {
    show(0);
    run();
  }

  return () => {
    stops.forEach((s) => s());
    clearTimeout(returnTimer);
  };
}
