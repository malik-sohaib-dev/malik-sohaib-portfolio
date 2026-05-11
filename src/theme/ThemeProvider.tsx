import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ThemeContext } from './context'
import { isThemeId, THEME_STORAGE_KEY, type ThemeId } from './constants'

function readStoredTheme(): ThemeId | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeId(raw) ? raw : null
  } catch {
    return null
  }
}

function systemPrefersLight(): boolean {
  return window.matchMedia('(prefers-color-scheme: light)').matches
}

function resolveInitialTheme(): ThemeId {
  const stored = readStoredTheme()
  if (stored) return stored
  return systemPrefersLight() ? 'light' : 'dark'
}

function applyDocumentTheme(theme: ThemeId) {
  document.documentElement.dataset.theme = theme
}

type Props = { children: ReactNode }

export function ThemeProvider({ children }: Props) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof document === 'undefined') return 'dark'
    const attr = document.documentElement.dataset.theme
    return isThemeId(attr) ? attr : resolveInitialTheme()
  })

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      /* ignore quota / private mode */
    }
  }, [theme])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => {
      if (readStoredTheme() !== null) return
      const next = mq.matches ? 'light' : 'dark'
      applyDocumentTheme(next)
      setThemeState(next)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((t: ThemeId) => {
    applyDocumentTheme(t)
    setThemeState(t)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      applyDocumentTheme(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}
