// Liquid glass over an image: the same picture, refracted by a lens under the pointer, rippling out
// from it, and drifting like liquid when the pointer moves fast. One small WebGL canvas moves into
// whichever host is active.
//   [data-liquid]        follows the pointer while hovered (posters)
//   [data-liquid="auto"] also runs on its own, with a drifting ghost pointer, while it is on screen
//                        and nothing else is hovered (the hero, the menu preview)
// A host holds an <img>; the canvas sits over it and is removed when the glass has settled.
import { onFrame } from './clock';

const VERT = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision highp float;
uniform sampler2D uTex;uniform vec2 uMouse,uCover;uniform float uTime,uAmt,uVel,uAspect,uLens;varying vec2 v;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
void main(){
  vec2 d=v-uMouse;d.x*=uAspect;float r=length(d)/uLens;vec2 dir=r>0.?d/(r*uLens):vec2(0.);
  float lens=smoothstep(.34,0.,r);
  vec2 o=-dir*lens*lens*.07*uLens;                              // the glass bulge
  o+=dir*sin(r*36.-uTime*5.)*.006*exp(-r*5.);                  // ripples from the pointer
  vec2 q=v*2.6+vec2(uTime*.11,-uTime*.07);
  o+=(vec2(n(q),n(q+7.3))-.5)*(.014+uVel*.05);                  // liquid drift, faster when moving
  o*=uAmt;o.x/=uAspect;
  vec2 t=(v+o-.5)*uCover+.5;
  vec3 c=texture2D(uTex,t).rgb;
  float rim=smoothstep(.335,.3,r)*smoothstep(.24,.33,r);        // a thin highlight on the lens edge
  c+=rim*.16*uAmt;
  c+=lens*lens*.05*uAmt;
  gl_FragColor=vec4(c,1.);
}`;

let started = false;
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

export function startLiquid() {
  if (started) return;
  started = true;
  const canvas = document.createElement('canvas');
  canvas.className = 'liquid';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('webgl', { alpha: false, antialias: false }) as WebGLRenderingContext | null;
  if (!ctx) return;
  const gl = ctx;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const u = (name: string) => gl.getUniformLocation(prog, name);
  const U = { mouse: u('uMouse'), cover: u('uCover'), time: u('uTime'), amt: u('uAmt'), vel: u('uVel'), aspect: u('uAspect'), lens: u('uLens') };

  // Posters fall back to a CSS push-in without this class.
  const flag = () => document.documentElement.classList.toggle('liquid-on', !reduce());
  flag();
  document.addEventListener('astro:after-swap', flag);

  const textures = new WeakMap<HTMLImageElement, WebGLTexture>();
  const textureFor = (img: HTMLImageElement) => {
    let t = textures.get(img);
    if (!t) {
      t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      for (const [k, v] of [
        [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
        [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
        [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
        [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
      ])
        gl.texParameteri(gl.TEXTURE_2D, k, v);
      textures.set(img, t);
    }
    return t;
  };

  type Mode = 'pointer' | 'auto';
  let host: HTMLElement | null = null;
  let mode: Mode = 'pointer';
  let stop: (() => void) | null = null;
  const st = { amt: 0, target: 0, mx: 0.5, my: 0.5, ax: 0.5, ay: 0.5, vel: 0, t0: 0 };
  const visible = new Set<HTMLElement>(); // auto hosts on screen
  let preferred: HTMLElement | null = null; // an auto host something asked for (the menu preview)

  const size = () => {
    if (!host) return;
    const img = host.querySelector('img')!;
    const r = host.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio, finePointer() ? 1.75 : 1);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    const boxA = r.width / r.height;
    const imgA = img.naturalWidth / img.naturalHeight;
    gl.uniform2f(U.cover, boxA > imgA ? 1 : boxA / imgA, boxA > imgA ? imgA / boxA : 1);
    gl.uniform1f(U.aspect, boxA);
    // A big host (the hero) gets a proportionally smaller lens.
    gl.uniform1f(U.lens, Math.min(1, 560 / Math.max(r.width, 1)));
  };

  function attach(next: HTMLElement, m: Mode) {
    const img = next.querySelector('img');
    if (!img || !img.complete || !img.naturalWidth) return false;
    mode = m;
    if (host !== next) {
      host = next;
      gl.bindTexture(gl.TEXTURE_2D, textureFor(img));
      next.append(canvas);
      size();
      st.amt = 0;
      st.vel = 0;
    }
    st.target = m === 'auto' ? 0.75 : 1;
    run();
    return true;
  }

  // When nothing is hovered, the preferred or an on-screen auto host takes the glass.
  function idle() {
    // Never behind the loader: it would only steal frames from it.
    if (reduce() || document.documentElement.classList.contains('is-loading')) return;
    const next = preferred && preferred.isConnected ? preferred : [...visible].find((h) => h.isConnected);
    if (next) attach(next, 'auto');
  }

  function run() {
    stop ??= onFrame((now) => {
      st.t0 ||= now;
      const t = (now - st.t0) / 1000;
      if (mode === 'auto') {
        // The ghost pointer: a slow figure-of-eight across the host.
        st.mx = 0.5 + 0.3 * Math.cos(t * 0.45);
        st.my = 0.5 + 0.16 * Math.sin(t * 0.9);
      }
      st.amt += (st.target - st.amt) * 0.07;
      const px = st.ax;
      const py = st.ay;
      st.ax += (st.mx - st.ax) * 0.14;
      st.ay += (st.my - st.ay) * 0.14;
      st.vel += (Math.min(1, Math.hypot(st.ax - px, st.ay - py) * 40) - st.vel) * 0.1;
      gl.uniform2f(U.mouse, st.ax, st.ay);
      gl.uniform1f(U.time, t);
      gl.uniform1f(U.amt, st.amt);
      gl.uniform1f(U.vel, st.vel);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      canvas.style.opacity = st.amt > 0.01 ? '1' : '0';
      if (st.target === 0 && st.amt < 0.004) {
        canvas.remove();
        host = null;
        stop = null;
        idle();
        return false;
      }
    });
  }

  const hostOf = (el: EventTarget | null) => (el as HTMLElement | null)?.closest?.<HTMLElement>('a[data-poster], [data-liquid]');
  const liquidIn = (el: HTMLElement) => (el.matches('[data-liquid]') ? el : el.querySelector<HTMLElement>('[data-liquid]'));

  const enter = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || reduce()) return;
    const target = hostOf(e.target);
    const next = target && liquidIn(target);
    if (!next || (next === host && mode === 'pointer')) return;
    if (attach(next, 'pointer')) {
      move(e);
      st.ax = st.mx;
      st.ay = st.my;
    }
  };
  const move = (e: PointerEvent) => {
    if (!host || mode !== 'pointer') return;
    const r = host.getBoundingClientRect();
    st.mx = (e.clientX - r.left) / r.width;
    st.my = 1 - (e.clientY - r.top) / r.height;
  };
  const leave = (e: PointerEvent) => {
    if (!host || mode !== 'pointer') return;
    const from = hostOf(e.target);
    if (from && from.contains(host) && !from.contains(e.relatedTarget as Node)) {
      // An auto host goes back to drifting; a poster settles.
      if (host.dataset.liquid === 'auto') attach(host, 'auto');
      else st.target = 0;
    }
  };
  document.addEventListener('pointerover', enter);
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerout', leave);
  addEventListener('resize', size);

  // Auto hosts run while they are on screen.
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
  // The loader hands over: start the hero's glass now.
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

  // Something can ask for an auto host to take the glass now (the menu's preview), or let go.
  document.addEventListener('liquid:prefer', ((e: CustomEvent<HTMLElement | null>) => {
    preferred = e.detail;
    if (preferred) attach(preferred, 'auto');
    else if (host && mode === 'auto') st.target = 0;
  }) as EventListener);
}
