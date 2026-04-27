import { useSyncExternalStore } from 'react'

const LG_DOWN = '(max-width: 1023px)'

/**
 * One shared `matchMedia` subscription for the whole tree — used to strip heavy
 * effects (WebGL, continuous animations, blurs) on phones and small tablets.
 */
function subscribeLgDown(onStoreChange: () => void) {
  const m = window.matchMedia(LG_DOWN)
  m.addEventListener('change', onStoreChange)
  return () => m.removeEventListener('change', onStoreChange)
}

function getLgDownSnapshot() {
  return window.matchMedia(LG_DOWN).matches
}

/**
 * `true` when viewport is below the `lg` breakpoint (&lt; 1024px).
 */
export function useLgDown(): boolean {
  return useSyncExternalStore(
    subscribeLgDown,
    getLgDownSnapshot,
    () => false
  )
}
