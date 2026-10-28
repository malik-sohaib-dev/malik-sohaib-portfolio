// Mercury over an image: a small stable-fluids simulation (splat, vorticity, pressure, advection)
// stirred by the pointer, and the picture warped by the flow, with a metallic sheen where it moves
// fastest. One WebGL2 canvas moves into whichever host is active.
//   [data-liquid]        stirs while hovered (posters)
//   [data-liquid="auto"] also stirs on its own with a drifting ghost pointer while it is on screen
//                        and nothing else is hovered (the hero, the menu preview)
// A host holds an <img>; the canvas sits over it and is removed once the fluid has come to rest.
import { onFrame } from './clock';

const VERT = `#version 300 es
in vec2 aPos;uniform vec2 texel;out vec2 vUv,vL,vR,vT,vB;
void main(){vUv=aPos*.5+.5;vL=vUv-vec2(texel.x,0.);vR=vUv+vec2(texel.x,0.);vT=vUv+vec2(0.,texel.y);vB=vUv-vec2(0.,texel.y);gl_Position=vec4(aPos,0.,1.);}`;
const H = `#version 300 es
precision highp float;in vec2 vUv,vL,vR,vT,vB;out vec4 o;`;
const FS = {
  splat: `${H}uniform sampler2D uTarget;uniform float aspect,radius;uniform vec2 point;uniform vec3 color;
void main(){vec2 p=vUv-point;p.x*=aspect;o=vec4(texture(uTarget,vUv).xyz+exp(-dot(p,p)/radius)*color,1.);}`,
  advect: `${H}uniform sampler2D uVelocity,uSource;uniform vec2 texel;uniform float dt,dissipation;
void main(){vec2 c=vUv-dt*texture(uVelocity,vUv).xy*texel;o=vec4(dissipation*texture(uSource,c).xyz,1.);}`,
  curl: `${H}uniform sampler2D uVelocity;
void main(){float L=texture(uVelocity,vL).y,R=texture(uVelocity,vR).y,T=texture(uVelocity,vT).x,B=texture(uVelocity,vB).x;o=vec4(.5*(R-L-T+B),0.,0.,1.);}`,
  vorticity: `${H}uniform sampler2D uVelocity,uCurl;uniform float curl,dt;
void main(){float L=texture(uCurl,vL).x,R=texture(uCurl,vR).x,T=texture(uCurl,vT).x,B=texture(uCurl,vB).x,C=texture(uCurl,vUv).x;
vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));f/=length(f)+1e-4;f*=curl*C;f.y*=-1.;
o=vec4(texture(uVelocity,vUv).xy+f*dt,0.,1.);}`,
  divergence: `${H}uniform sampler2D uVelocity;
void main(){float L=texture(uVelocity,vL).x,R=texture(uVelocity,vR).x,T=texture(uVelocity,vT).y,B=texture(uVelocity,vB).y;
vec2 C=texture(uVelocity,vUv).xy;if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;o=vec4(.5*(R-L+T-B),0.,0.,1.);}`,
  pressure: `${H}uniform sampler2D uPressure,uDivergence;
void main(){float L=texture(uPressure,vL).x,R=texture(uPressure,vR).x,T=texture(uPressure,vT).x,B=texture(uPressure,vB).x;
o=vec4((L+R+B+T-texture(uDivergence,vUv).x)*.25,0.,0.,1.);}`,
  gradient: `${H}uniform sampler2D uPressure,uVelocity;
void main(){float L=texture(uPressure,vL).x,R=texture(uPressure,vR).x,T=texture(uPressure,vT).x,B=texture(uPressure,vB).x;
o=vec4(texture(uVelocity,vUv).xy-vec2(R-L,T-B),0.,1.);}`,
  // The picture, pushed along the flow; where the flow is fast it catches light like mercury.
  display: `${H}uniform sampler2D uImage,uVelocity;uniform vec2 uCover,texel;uniform float uAmt;
void main(){vec2 v=texture(uVelocity,vUv).xy;
vec2 g=vec2(length(texture(uVelocity,vR).xy)-length(texture(uVelocity,vL).xy),length(texture(uVelocity,vT).xy)-length(texture(uVelocity,vB).xy));
vec2 t=(vUv-v*.0006*uAmt-.5)*uCover+.5;
vec3 c=texture(uImage,t).rgb;
float sheen=clamp(dot(normalize(g+1e-5),normalize(vec2(-.6,.8)))*length(g)*.004,-1.,1.)*uAmt;
c+=sheen*.35;c*=1.-clamp(length(v)*.0006,0.,.25)*uAmt;
o=vec4(c,1.);}`,
};

let started = false;
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
// Quality tiers. The fluid is soft, so it can be simulated and drawn far below screen resolution;
// a device that can't hold the frame rate steps down a tier, and below the last one the glass is off.
//   sim: cells on the long side, iters: pressure solves, px: most pixels the canvas draws
const TIERS = [
  { sim: 128, iters: 14, px: 1_600_000 },
  { sim: 96, iters: 8, px: 700_000 },
  { sim: 64, iters: 5, px: 300_000 },
];

type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer };
type Double = { read: Target; write: Target; swap(): void };

export function startLiquid() {
  if (started) return;
  started = true;
  const canvas = document.createElement('canvas');
  canvas.className = 'liquid';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false });
  if (!ctx || !ctx.getExtension('EXT_color_buffer_float')) return;
  const gl = ctx;
  // Data Saver: no live glass at all. A small device starts on the lightest tier.
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return;
  let tier = (nav.deviceMemory ?? 8) <= 2 || (navigator.hardwareConcurrency ?? 8) <= 2 ? 2 : 0;

  const programs: Record<string, { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> }> = {};
  const vs = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vs, VERT);
  gl.compileShader(vs);
  for (const [name, src] of Object.entries(FS)) {
    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, src);
    gl.compileShader(fs);
    const p = gl.createProgram()!;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return;
    const u: Record<string, WebGLUniformLocation | null> = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i)!;
      u[info.name] = gl.getUniformLocation(p, info.name);
    }
    programs[name] = { p, u };
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  // Posters fall back to a CSS push-in without this class.
  const flag = () => document.documentElement.classList.toggle('liquid-on', !reduce());
  flag();
  document.addEventListener('astro:after-swap', flag);

  // Simulation targets, sized to the host's aspect.
  let simW = 0;
  let simH = 0;
  const target = (w: number, h: number, internal: number, format: number): Target => {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fbo };
  };
  const double = (w: number, h: number, i: number, f: number): Double => {
    const d = { read: target(w, h, i, f), write: target(w, h, i, f), swap: () => ([d.read, d.write] = [d.write, d.read]) };
    return d;
  };
  let velocity: Double, pressure: Double, divergence: Target, curl: Target;
  const resizeSim = (aspect: number) => {
    const SIM = TIERS[tier].sim;
    const w = aspect >= 1 ? SIM : Math.round(SIM * aspect);
    const h = aspect >= 1 ? Math.round(SIM / aspect) : SIM;
    if (w === simW && h === simH) return clearSim();
    simW = w;
    simH = h;
    velocity = double(w, h, gl.RG16F, gl.RG);
    pressure = double(w, h, gl.R16F, gl.RED);
    divergence = target(w, h, gl.R16F, gl.RED);
    curl = target(w, h, gl.R16F, gl.RED);
  };
  const clearSim = () => {
    for (const t of [velocity.read, velocity.write, pressure.read, pressure.write, divergence, curl]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
      gl.viewport(0, 0, simW, simH);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  };

  const use = (name: keyof typeof FS) => {
    const prog = programs[name];
    gl.useProgram(prog.p);
    return prog.u;
  };
  let unit = 0;
  const bind = (loc: WebGLUniformLocation | null | undefined, tex: WebGLTexture) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(loc ?? null, unit++);
  };
  const blit = (to: Target | null, w: number, h: number) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, to ? to.fbo : null);
    gl.viewport(0, 0, w, h);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    unit = 0;
  };

  const images = new WeakMap<HTMLImageElement, WebGLTexture>();
  const imageFor = (img: HTMLImageElement) => {
    let t = images.get(img);
    if (!t) {
      t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      images.set(img, t);
    }
    return t;
  };

  type Mode = 'pointer' | 'auto';
  let host: HTMLElement | null = null;
  let image: WebGLTexture | null = null;
  let mode: Mode = 'pointer';
  let stop: (() => void) | null = null;
  let aspect = 1;
  let cover = [1, 1];
  const st = { amt: 0, target: 0, x: 0.5, y: 0.5, px: 0.5, py: 0.5, moved: false, last: 0, t0: 0, quiet: 0 };
  const visible = new Set<HTMLElement>();
  let preferred: HTMLElement | null = null;

  const size = () => {
    if (!host) return;
    const img = host.querySelector('img')!;
    const r = host.getBoundingClientRect();
    // Draw at screen density, capped by the tier's pixel budget; CSS scales the canvas up.
    let dpr = Math.min(devicePixelRatio, finePointer() ? 1.5 : 1);
    dpr = Math.min(dpr, Math.sqrt(TIERS[tier].px / Math.max(1, r.width * r.height)));
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    aspect = r.width / r.height;
    const imgA = img.naturalWidth / img.naturalHeight;
    cover = [aspect > imgA ? 1 : aspect / imgA, aspect > imgA ? imgA / aspect : 1];
    resizeSim(aspect);
  };

  // Push the fluid: a force along the pointer's motion, in a small soft disc.
  const splat = (x: number, y: number, dx: number, dy: number, radius = 0.0018) => {
    const u = use('splat');
    bind(u.uTarget, velocity.read.tex);
    gl.uniform1f(u.aspect, aspect);
    gl.uniform2f(u.point, x, y);
    gl.uniform3f(u.color, dx, dy, 0);
    gl.uniform1f(u.radius, radius);
    blit(velocity.write, simW, simH);
    velocity.swap();
  };

  const step = (dt: number) => {
    gl.disable(gl.BLEND);
    const tx = 1 / simW;
    const ty = 1 / simH;
    let u = use('curl');
    gl.uniform2f(u.texel, tx, ty);
    bind(u.uVelocity, velocity.read.tex);
    blit(curl, simW, simH);

    u = use('vorticity');
    gl.uniform2f(u.texel, tx, ty);
    bind(u.uVelocity, velocity.read.tex);
    bind(u.uCurl, curl.tex);
    gl.uniform1f(u.curl, 28); // the swirl that makes it read as liquid metal, not a lens
    gl.uniform1f(u.dt, dt);
    blit(velocity.write, simW, simH);
    velocity.swap();

    u = use('divergence');
    gl.uniform2f(u.texel, tx, ty);
    bind(u.uVelocity, velocity.read.tex);
    blit(divergence, simW, simH);

    u = use('pressure');
    gl.uniform2f(u.texel, tx, ty);
    for (let i = 0; i < TIERS[tier].iters; i++) {
      bind(u.uDivergence, divergence.tex);
      bind(u.uPressure, pressure.read.tex);
      blit(pressure.write, simW, simH);
      pressure.swap();
    }

    u = use('gradient');
    gl.uniform2f(u.texel, tx, ty);
    bind(u.uPressure, pressure.read.tex);
    bind(u.uVelocity, velocity.read.tex);
    blit(velocity.write, simW, simH);
    velocity.swap();

    u = use('advect');
    gl.uniform2f(u.texel, tx, ty);
    bind(u.uVelocity, velocity.read.tex);
    bind(u.uSource, velocity.read.tex);
    gl.uniform1f(u.dt, dt);
    gl.uniform1f(u.dissipation, 0.975);
    blit(velocity.write, simW, simH);
    velocity.swap();
  };

  const draw = () => {
    const u = use('display');
    gl.uniform2f(u.texel, 1 / simW, 1 / simH);
    bind(u.uImage, image!);
    bind(u.uVelocity, velocity.read.tex);
    gl.uniform2f(u.uCover, cover[0], cover[1]);
    gl.uniform1f(u.uAmt, st.amt);
    blit(null, canvas.width, canvas.height);
  };

  function attach(next: HTMLElement, m: Mode) {
    if (disabled) return false;
    const img = next.querySelector('img');
    if (!img || !img.complete || !img.naturalWidth) return false;
    mode = m;
    if (host !== next) {
      host = next;
      image = imageFor(img);
      next.append(canvas);
      size();
      clearSim();
      st.amt = 0;
      st.moved = false;
    }
    st.target = 1;
    run();
    return true;
  }

  function idle() {
    // Never behind the loader: it would only steal frames from it.
    if (reduce() || document.documentElement.classList.contains('is-loading')) return;
    const next = preferred && preferred.isConnected ? preferred : [...visible].find((h) => h.isConnected);
    if (next) attach(next, 'auto');
  }

  // Frame-time watch: after a warm-up, a run of slow frames (under ~45 fps) drops a tier.
  const perf = { n: 0, sum: 0 };
  const watch = (ms: number) => {
    if (tier >= TIERS.length || document.hidden) return;
    perf.n++;
    if (perf.n <= 20) return; // warm-up: shader compiles, first uploads
    perf.sum += ms;
    if (perf.n < 80) return;
    const avg = perf.sum / 60;
    perf.n = 0;
    perf.sum = 0;
    if (avg <= 22) return;
    tier++;
    if (tier >= TIERS.length) return disable();
    simW = simH = 0; // force new targets at the new size
    size();
  };
  // The last resort: no live glass. Posters fall back to their CSS push-in, the hero to a drift.
  function disable() {
    stop?.();
    stop = null;
    canvas.remove();
    host = null;
    disabled = true;
    document.documentElement.classList.remove('liquid-on');
    document.documentElement.classList.add('liquid-off');
  }
  let disabled = false;

  function run() {
    if (disabled) return;
    stop ??= onFrame((now) => {
      st.t0 ||= now;
      const dt = Math.min(0.033, (now - (st.last || now)) / 1000) || 0.016;
      if (st.last) watch(now - st.last);
      st.last = now;
      const t = (now - st.t0) / 1000;
      if (mode === 'auto') {
        // The ghost pointer: a wandering path that keeps the mercury stirring.
        const nx = 0.5 + 0.32 * Math.cos(t * 0.37) + 0.06 * Math.sin(t * 1.9);
        const ny = 0.5 + 0.22 * Math.sin(t * 0.61) + 0.05 * Math.cos(t * 2.3);
        st.px = st.x;
        st.py = st.y;
        st.x = nx;
        st.y = ny;
        st.moved = true;
      }
      if (st.moved) {
        const k = 5200;
        splat(st.x, st.y, (st.x - st.px) * k, (st.y - st.py) * k);
        st.px = st.x;
        st.py = st.y;
        st.moved = false;
        st.quiet = 0;
      } else st.quiet += dt;
      step(dt);
      st.amt += (st.target - st.amt) * 0.08;
      draw();
      canvas.style.opacity = st.amt > 0.01 ? '1' : '0';
      // Settle and let go once the pointer has left and the fluid is calm.
      if (st.target === 0 && st.amt < 0.004) {
        canvas.remove();
        host = null;
        stop = null;
        st.last = 0;
        idle();
        return false;
      }
    });
  }

  const hostOf = (el: EventTarget | null) => (el as HTMLElement | null)?.closest?.<HTMLElement>('a[data-poster], [data-liquid]');
  const liquidIn = (el: HTMLElement) => (el.matches('[data-liquid]') ? el : el.querySelector<HTMLElement>('[data-liquid]'));

  const enter = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || reduce()) return;
    const t = hostOf(e.target);
    const next = t && liquidIn(t);
    if (!next || (next === host && mode === 'pointer')) return;
    if (attach(next, 'pointer')) {
      point(e);
      st.px = st.x;
      st.py = st.y;
    }
  };
  const point = (e: PointerEvent) => {
    const r = host!.getBoundingClientRect();
    st.x = (e.clientX - r.left) / r.width;
    st.y = 1 - (e.clientY - r.top) / r.height;
  };
  const move = (e: PointerEvent) => {
    if (!host || mode !== 'pointer') return;
    point(e);
    st.moved = true;
  };
  const leave = (e: PointerEvent) => {
    if (!host || mode !== 'pointer') return;
    const from = hostOf(e.target);
    if (from && from.contains(host) && !from.contains(e.relatedTarget as Node)) {
      if (host.dataset.liquid === 'auto') attach(host, 'auto');
      else st.target = 0;
    }
  };
  document.addEventListener('pointerover', enter);
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerout', leave);
  addEventListener('resize', size);

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const h = e.target as HTMLElement;
      if (e.isIntersecting) visible.add(h);
      else {
        visible.delete(h);
        if (h === host && mode === 'auto') st.target = 0;
      }
    }
    if (!host || (mode === 'auto' && st.target === 0)) idle();
  });
  const observe = () => {
    visible.clear();
    io.disconnect();
    document.querySelectorAll<HTMLElement>('[data-liquid="auto"]').forEach((h) => {
      const img = h.querySelector('img');
      if (img && !img.complete) img.addEventListener('load', () => (host ? null : idle()), { once: true });
      io.observe(h);
    });
  };
  observe();
  // The loader hands over: start the hero's fluid now.
  new MutationObserver(() => !host && idle()).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('astro:after-swap', () => {
    st.target = 0;
    st.amt = 0;
    canvas.remove();
    stop?.();
    stop = null;
    host = null;
    preferred = null;
    observe();
  });

  document.addEventListener('liquid:prefer', ((e: CustomEvent<HTMLElement | null>) => {
    preferred = e.detail;
    if (preferred) attach(preferred, 'auto');
    else if (host && mode === 'auto') st.target = 0;
  }) as EventListener);
}
