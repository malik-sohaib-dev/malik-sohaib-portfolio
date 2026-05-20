import { useEffect, useRef } from 'react'

/**
 * Top-edge scroll progress. Updates via rAF + transform only — no React state on scroll.
 */
export function ScrollProgress() {
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fill = fillRef.current
    if (!fill) return

    let raf = 0

    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      fill.style.transform = `scaleX(${progress})`
    }

    const schedule = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return (
    <div
      className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-[60]"
      aria-hidden
    >
      <div className="scroll-progress-track">
        <div ref={fillRef} className="scroll-progress-fill" />
      </div>
    </div>
  )
}
