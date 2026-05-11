import { useEffect, useState } from 'react'

/**
 * Module-level cache so the WebGL probe only runs once per page load,
 * regardless of how many components call this hook.
 */
let cachedResult: boolean | null = null

/**
 * Probes available browser signals to decide whether heavy WebGL effects
 * (3-D hero scene, polyline cursor) should be suppressed.
 *
 * Priority order:
 *  1. GPU renderer string via WEBGL_debug_renderer_info (most reliable)
 *  2. CPU-core count + RAM as a broad safety net when the extension is absent
 */
function detectLowPerformance(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false

  // --- 1. GPU renderer probe ---
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null

    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      if (ext) {
        const renderer = (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string).toLowerCase()
        const vendor = (gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) as string).toLowerCase()

        // Pure software renderers – definite low-end
        if (/llvmpipe|swiftshader|software renderer/i.test(renderer)) return true

        // Old Intel integrated graphics (HD / early UHD).
        // Iris Xe and Arc are capable enough – excluded via negative lookahead.
        if (
          vendor.includes('intel') &&
          /\bhd graphics\b|uhd graphics \d{3}\b/i.test(renderer) &&
          !/iris|arc/i.test(renderer)
        )
          return true
      }

      // Silently release the probe context so it doesn't count against the
      // browser's WebGL context budget.
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  } catch {
    // WebGL unavailable → fall through to hardware hints
  }

  // --- 2. Hardware hints (coarse fallback) ---
  // Only flag the device when *both* signals are weak to avoid penalising
  // machines that are slow on one axis but fine overall (e.g. a 2-core Xeon
  // server with 128 GB RAM running a headless browser).
  const cores = navigator.hardwareConcurrency ?? 999
  const ram = (navigator as { deviceMemory?: number }).deviceMemory ?? 999
  return cores <= 2 || ram <= 2
}

/**
 * Returns `true` when the current device is likely too underpowered to run
 * heavy WebGL effects smoothly.  The result is synchronous after the first
 * mount (cached at module level) so there is no layout flash on re-renders.
 *
 * Mirrors the pattern used by `usePrefersReducedMotion` and `useLgDown` so
 * all three can be combined uniformly wherever heavy effects are gated.
 */
export function useLowPerformance(): boolean {
  const [lowPerf, setLowPerf] = useState(false)

  useEffect(() => {
    if (cachedResult === null) {
      cachedResult = detectLowPerformance()
    }
    setLowPerf(cachedResult)
  }, [])

  return lowPerf
}
