// What the Wrapped films share: the narration's timeline (window.TIMELINE, from takes.py or voice.py,
// injected by render.mjs), when each word is said, easing, scene windows, captions and video seeks.
// A film page defines its scenes and a draw(t) per scene; window.render(t) is built from them.
(function () {
  const TL = window.TIMELINE;
  const FACTS = window.FACTS || { years: 4, total: 5582, perYear: { 2022: 95, 2023: 616, 2024: 615, 2025: 1009, 2026: 3247 } };
  document.body.classList.add(innerWidth > innerHeight ? 'land' : 'port');

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const win = (t, a, b) => clamp((t - a) / (b - a));
  const ease = (x) => 1 - Math.pow(1 - clamp(x), 4);
  const back = (x) => {
    const c = 1.9;
    x = clamp(x);
    return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
  };
  const B = Object.fromEntries(TL.beats.map((b) => [b.id, b]));
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9-]/g, '');
  /** When a word is said in a beat (its first match), or the beat's start. */
  const when = (beat, word) => {
    const w = B[beat].words.find((x) => norm(x.w).startsWith(norm(word)));
    return w ? w.s : B[beat].start;
  };
  const nf = new Intl.NumberFormat('en-US');

  /** Scenes from beats: each runs from just before its first beat to just before the next scene. */
  const LEAD = 0.1;
  function scenes(list) {
    list.forEach((s, i) => {
      s.el = document.getElementById(s.id);
      s.from = i === 0 ? 0 : B[s.beats[0]].start - LEAD;
      s.to = i === list.length - 1 ? TL.duration + 1 : B[list[i + 1].beats[0]].start - LEAD;
      s.el.style.zIndex = String(i + 1);
    });
    return list;
  }

  /** Caption groups (three words at most, broken at pauses) for the beats of the captioned scenes. */
  function captions(list) {
    const groups = [];
    for (const s of list.filter((s) => s.caps)) {
      for (const id of s.beats) {
        let g = [];
        B[id].words.forEach((w, i, all) => {
          const gap = i ? w.s - all[i - 1].e : 0;
          if (g.length === 3 || (g.length && gap > 0.16)) (groups.push(g), (g = []));
          g.push(w);
        });
        if (g.length) groups.push(g);
      }
    }
    return groups;
  }
  function drawCaptions(el, groups, list, t) {
    const i = groups.findIndex((g, k) => t >= g[0].s - 0.08 && t < (groups[k + 1]?.[0].s ?? Infinity) - 0.08 && t < g[g.length - 1].e + 0.6);
    const scene = list.find((s) => t >= s.from && t < s.to);
    if (i < 0 || !scene?.caps) return void (el.style.opacity = 0);
    const g = groups[i];
    const html = g.map((w) => `<span class="${t >= w.e ? 'said' : t >= w.s - 0.03 ? 'now' : ''}">${w.w}</span>`).join(' ');
    if (el.innerHTML !== html) el.innerHTML = html;
    el.dataset.tone = scene.tone || 'dark';
    const p = ease(win(t, g[0].s - 0.08, g[0].s + 0.1));
    el.style.opacity = p;
    el.style.transform = `translateY(${(1 - p) * 16}px)`;
  }

  /** Seek a video to a time (looping) and wait until the frame is there. */
  const seek = (v, time) =>
    new Promise((ok) => {
      const target = time % (v.duration || 3);
      if (Math.abs(v.currentTime - target) < 0.001) return ok();
      v.addEventListener('seeked', ok, { once: true });
      v.currentTime = target;
    });
  const ready = () =>
    Promise.all([
      document.fonts.ready,
      ...[...document.querySelectorAll('video')].map((v) => (v.readyState >= 2 ? 0 : new Promise((ok) => v.addEventListener('loadeddata', ok, { once: true })))),
      ...[...document.querySelectorAll('img')].map((i) => i.decode().catch(() => {})),
    ]);

  /** Set an element's motion in one go. */
  function set(el, { x = 0, y = 0, s = 1, r = 0, o = 1, blur = 0 } = {}) {
    el.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`;
    el.style.opacity = o;
    el.style.filter = blur > 0.2 ? `blur(${blur}px)` : '';
  }

  window.Film = { TL, FACTS, B, clamp, win, ease, back, when, nf, scenes, captions, drawCaptions, seek, ready, set, LEAD };
})();
