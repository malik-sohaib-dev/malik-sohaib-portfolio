import { Color, Polyline, Renderer, Transform, Vec3 } from 'ogl'
import { useEffect, useRef } from 'react'
import { useLgDown } from '../hooks/useMediaQuery'
import { useLowPerformance } from '../hooks/useLowPerformance'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/** Matches OGL polylines demo: screen-space width via resolution / DPR (see oframe/ogl examples). */
const polylineVertex = /* glsl */ `
  precision highp float;

  attribute vec3 position;
  attribute vec3 next;
  attribute vec3 prev;
  attribute vec2 uv;
  attribute float side;

  uniform vec2 uResolution;
  uniform float uDPR;
  uniform float uThickness;

  varying vec2 vUv;

  vec4 getPosition() {
    vec4 current = vec4(position, 1.0);

    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 nextScreen = next.xy * aspect;
    vec2 prevScreen = prev.xy * aspect;

    vec2 tangent = normalize(nextScreen - prevScreen);
    vec2 normal = vec2(-tangent.y, tangent.x);
    normal /= aspect;

    normal *= mix(1.0, 0.1, pow(abs(uv.y - 0.5) * 2.0, 2.0));

    float dist = length(nextScreen - prevScreen);
    normal *= smoothstep(0.0, 0.02, dist);

    float pixelWidthRatio = 1.0 / (uResolution.y / uDPR);
    float pixelWidth = current.w * pixelWidthRatio;
    normal *= pixelWidth * uThickness;
    current.xy -= normal * side;

    return current;
  }

  void main() {
    vUv = uv;
    gl_Position = getPosition();
  }
`

const polylineFragment = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec2 vUv;

  void main() {
    float ends = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
    float a = ends * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`

type TrailLine = {
  spring: number
  friction: number
  mouseVelocity: Vec3
  mouseOffset: Vec3
  points: Vec3[]
  polyline: Polyline
}

function random(a: number, b: number): number {
  const t = Math.random()
  return a * (1 - t) + b * t
}

const PALETTE = ['#2dd4bf', '#5eead4', '#22d3ee', '#818cf8', '#a78bfa'] as const

/**
 * Minimal WebGL cursor ribbons using OGL {@link https://github.com/oframe/ogl Polyline}.
 * Disabled on reduced motion, coarse pointers, and below `lg` (matches other heavy effects).
 */
export function PolylineCursor() {
  const hostRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const lgDown = useLgDown()
  const lowPerf = useLowPerformance()

  useEffect(() => {
    if (reduced || lgDown) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const host = hostRef.current
    if (!host) return
    const hostEl = host

    // Lite mode: fewer lines, shorter trails, DPR capped at 1
    const lineCount = lowPerf ? 2 : PALETTE.length
    const pointCount = lowPerf ? 10 : 20

    const renderer = new Renderer({
      dpr: lowPerf ? 1 : Math.min(window.devicePixelRatio ?? 1, 2),
      alpha: true,
      depth: false,
      premultipliedAlpha: false,
    })
    const gl = renderer.gl
    gl.disable(gl.DEPTH_TEST)
    gl.canvas.style.display = 'block'
    hostEl.appendChild(gl.canvas)

    const scene = new Transform()
    const lines: TrailLine[] = []

    for (let i = 0; i < lineCount; i++) {
      const spring = random(0.035, 0.09)
      const friction = random(0.78, 0.93)
      const line: Omit<TrailLine, 'polyline'> = {
        spring,
        friction,
        mouseVelocity: new Vec3(),
        mouseOffset: new Vec3(random(-1, 1) * 0.025, random(-1, 1) * 0.025, 0),
        points: [],
      }
      for (let j = 0; j < pointCount; j++) line.points.push(new Vec3())

      const polyline = new Polyline(gl, {
        points: line.points,
        vertex: polylineVertex,
        fragment: polylineFragment,
        uniforms: {
          uColor: { value: new Color(PALETTE[i]) },
          uThickness: { value: random(14, 28) },
          uOpacity: { value: random(0.28, 0.48) },
        },
      })

      polyline.program.depthTest = false
      polyline.program.depthWrite = false
      polyline.program.cullFace = false
      polyline.program.setBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      polyline.mesh.setParent(scene)
      lines.push({ ...line, polyline })
    }

    const mouse = new Vec3()
    const tmp = new Vec3()
    let raf = 0

    function resize() {
      const w = hostEl.clientWidth || window.innerWidth
      const h = hostEl.clientHeight || window.innerHeight
      renderer.setSize(w, h)
      lines.forEach((line) => line.polyline.resize())
    }

    const ro = new ResizeObserver(resize)
    ro.observe(hostEl)
    resize()

    function onMove(clientX: number, clientY: number) {
      mouse.set(
        (clientX / renderer.width) * 2 - 1,
        (clientY / renderer.height) * -2 + 1,
        0
      )
    }

    function onMouseMove(e: MouseEvent) {
      onMove(e.clientX, e.clientY)
    }

    function onTouch(e: TouchEvent) {
      if (!e.changedTouches.length) return
      onMove(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })

    function onVisibility() {
      if (document.hidden) cancelAnimationFrame(raf)
      else tick()
    }
    document.addEventListener('visibilitychange', onVisibility)

    // Delta-time normalised physics — renders at the native display refresh
    // rate (smooth on 120 Hz ProMotion and 144 Hz gaming panels) while the
    // spring / friction / lerp strength stays identical regardless of FPS.
    //
    // All per-frame operations are scaled by `dtScale` (= elapsed ms / 16.67,
    // i.e. 1.0 at 60 fps):
    //   • spring force    → multiply by dtScale (more force per longer frame)
    //   • friction decay  → f^dtScale (correct exponential decay for any dt)
    //   • position delta  → velocity × dtScale (distance = speed × time)
    //   • lerp factor     → 1 − (1−0.9)^dtScale (same formula as friction)
    let prevTime = 0

    function tick() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(loop)
    }

    function loop(now: number) {
      raf = requestAnimationFrame(loop)
      const dt = now - prevTime
      prevTime = now
      // Skip the first frame (prevTime was 0) and any tab-hidden gaps > 200 ms
      if (dt <= 0 || dt > 200) return
      const dtScale = Math.min(dt * 0.06, 2.5) // 0.06 = 1/(1000/60)
      lines.forEach((line) => {
        for (let i = line.points.length - 1; i >= 0; i--) {
          if (i === 0) {
            tmp.copy(mouse).add(line.mouseOffset).sub(line.points[i]).multiply(line.spring * dtScale)
            line.mouseVelocity.add(tmp).multiply(Math.pow(line.friction, dtScale))
            // Reuse tmp to scale velocity → position delta
            tmp.copy(line.mouseVelocity).multiply(dtScale)
            line.points[i].add(tmp)
          } else {
            line.points[i].lerp(line.points[i - 1], 1 - Math.pow(0.1, dtScale))
          }
        }
        line.polyline.updateGeometry()
      })
      renderer.render({ scene })
    }

    if (!document.hidden) tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
      document.removeEventListener('visibilitychange', onVisibility)
      hostEl.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [lgDown, lowPerf, reduced])

  if (reduced || lgDown) return null

  return (
    <div
      ref={hostRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  )
}
