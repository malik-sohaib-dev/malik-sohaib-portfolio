// Liquid glass over a poster: the same image, refracted by a lens under the pointer, rippling out
// from it, and drifting like liquid when the pointer moves fast. One small WebGL canvas, moved into
// whichever poster is hovered; it settles back to the still image on leave and then detaches.
import { onFrame, reducedMotion } from './clock';

const VERT = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision highp float;
uniform sampler2D uTex;uniform vec2 uMouse,uCover;uniform float uTime,uAmt,uVel,uAspect;varying vec2 v;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
void main(){
  vec2 d=v-uMouse;d.x*=uAspect;float r=length(d);vec2 dir=r>0.?d/r:vec2(0.);
  float lens=smoothstep(.34,0.,r);
  vec2 o=-dir*lens*lens*.07;                                   // the glass bulge
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

type GL = WebGLRenderingContext;
let started = false;

export function startLiquid() {
  if (started || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  started = true;
  const canvas = document.createElement('canvas');
  canvas.className = 'liquid';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false }) as GL | null;
  if (!gl) return;

  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  // Posters fall back to a CSS push-in without this class.
  const flag = () => document.documentElement.classList.toggle('liquid-on', !matchMedia('(prefers-reduced-motion: reduce)').matches);
  flag();
  document.addEventListener('astro:after-swap', flag);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (name: string) => gl.getUniformLocation(prog, name);
  const U = { mouse: u('uMouse'), cover: u('uCover'), time: u('uTime'), amt: u('uAmt'), vel: u('uVel'), aspect: u('uAspect') };
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let host: HTMLElement | null = null; // the poster's art layer the canvas sits in
  let img: HTMLImageElement | null = null;
  let stop: (() => void) | null = null;
  const st = { amt: 0, target: 0, mx: 0.5, my: 0.5, ax: 0.5, ay: 0.5, vel: 0, t0: 0 };

  const size = () => {
    if (!host) return;
    const r = host.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio, 1.75);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const boxA = r.width / r.height;
    const imgA = img ? img.naturalWidth / img.naturalHeight : boxA;
    // object-fit: cover in texture space
    gl.uniform2f(U.cover, boxA > imgA ? 1 : boxA / imgA, boxA > imgA ? imgA / boxA : 1);
    gl.uniform1f(U.aspect, boxA);
  };

  const run = () => {
    stop ??= onFrame((now) => {
      st.t0 ||= now;
      st.amt += (st.target - st.amt) * 0.08;
      const px = st.ax;
      const py = st.ay;
      st.ax += (st.mx - st.ax) * 0.16;
      st.ay += (st.my - st.ay) * 0.16;
      st.vel += (Math.min(1, Math.hypot(st.ax - px, st.ay - py) * 40) - st.vel) * 0.1;
      gl.uniform2f(U.mouse, st.ax, st.ay);
      gl.uniform1f(U.time, (now - st.t0) / 1000);
      gl.uniform1f(U.amt, st.amt);
      gl.uniform1f(U.vel, st.vel);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      canvas.style.opacity = st.amt > 0.01 ? '1' : '0';
      if (st.target === 0 && st.amt < 0.004) {
        canvas.remove();
        host = null;
        stop = null;
        return false;
      }
    });
  };

  const enter = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || reducedMotion()) return;
    const poster = (e.target as HTMLElement).closest?.<HTMLElement>('a[data-poster]');
    const art = poster?.querySelector<HTMLElement>('.poster__bg');
    const pic = art?.querySelector('img');
    if (!poster || !art || !pic || !pic.complete || !pic.naturalWidth) return;
    if (host !== art) {
      host = art;
      img = pic;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, pic);
      art.append(canvas);
      size();
      st.amt = 0;
      st.vel = 0;
    }
    move(e);
    st.ax = st.mx;
    st.ay = st.my;
    st.target = 1;
    run();
  };
  const move = (e: PointerEvent) => {
    if (!host) return;
    const r = host.getBoundingClientRect();
    st.mx = (e.clientX - r.left) / r.width;
    st.my = 1 - (e.clientY - r.top) / r.height;
  };
  const leave = (e: PointerEvent) => {
    const poster = (e.target as HTMLElement).closest?.('a[data-poster]');
    if (poster && host && poster.contains(host) && !poster.contains(e.relatedTarget as Node)) st.target = 0;
  };
  document.addEventListener('pointerover', enter);
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerout', leave);
  addEventListener('resize', size);
  // Client-side navigation replaces the page: drop the canvas with it.
  document.addEventListener('astro:before-swap', () => {
    st.target = 0;
    st.amt = 0;
    canvas.remove();
    host = null;
  });
}
