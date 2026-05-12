import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function scrollElementIntoViewSmooth(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

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
        scrollElementIntoViewSmooth(id)
      })
    })
    return () => {
      alive = false
    }
  }, [pathname, hash])

  /** Re-clicking the same section link leaves the hash unchanged, so the effect above never runs. */
  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (e.defaultPrevented) return
      if (e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const anchor = (e.target as Element | null)?.closest?.('a[href]')
      if (!anchor) return
      const a = anchor as HTMLAnchorElement
      if (a.target === '_blank') return

      const hrefAttr = a.getAttribute('href')
      if (!hrefAttr) return

      let url: URL
      try {
        url = new URL(hrefAttr, window.location.origin)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return

      const hashPart = url.hash
      if (!hashPart || hashPart === '#') return

      const targetId = decodeURIComponent(hashPart.slice(1))
      if (!targetId) return
      if (url.pathname !== window.location.pathname) return

      const currentId = window.location.hash.startsWith('#')
        ? decodeURIComponent(window.location.hash.slice(1))
        : ''
      if (currentId !== targetId) return

      e.preventDefault()
      scrollElementIntoViewSmooth(targetId)
    }

    document.addEventListener('click', onClickCapture, true)
    return () => document.removeEventListener('click', onClickCapture, true)
  }, [])

  return null
}
