import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * React Router navigates to `/#id` without firing the browser's native hash scroll.
 * Scroll the target into view whenever the location hash changes (SPA + full load).
 */
export function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = decodeURIComponent(hash.slice(1))
    if (!id) return

    let alive = true
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!alive) return
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
    return () => {
      alive = false
    }
  }, [pathname, hash])

  return null
}
