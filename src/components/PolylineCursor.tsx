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
    if (reduced || lgDown || lowPerf) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const host = hostRef.current
    if (!host) return
    const hostEl = host

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio ?? 1, 2),
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

    for (let i = 0; i < PALETTE.length; i++) {
      const spring = random(0.035, 0.09)
      const friction = random(0.78, 0.93)
      const line: Omit<TrailLine, 'polyline'> = {
        spring,
        friction,
        mouseVelocity: new Vec3(),
        mouseOffset: new Vec3(random(-1, 1) * 0.025, random(-1, 1) * 0.025, 0),
        points: [],
      }
      const count = 20
      for (let j = 0; j < count; j++) line.points.push(new Vec3())

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

    function tick() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(loop)
    }

    function loop() {
      raf = requestAnimationFrame(loop)
      lines.forEach((line) => {
        for (let i = line.points.length - 1; i >= 0; i--) {
          if (i === 0) {
            tmp.copy(mouse).add(line.mouseOffset).sub(line.points[i]).multiply(line.spring)
            line.mouseVelocity.add(tmp).multiply(line.friction)
            line.points[i].add(line.mouseVelocity)
          } else {
            line.points[i].lerp(line.points[i - 1], 0.9)
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

  if (reduced || lgDown || lowPerf) return null

  return (
    <div
      ref={hostRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  )
}
