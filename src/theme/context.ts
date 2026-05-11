import { createContext } from 'react'
import type { ThemeId } from './constants'

export type ThemeContextValue = {
  theme: ThemeId
  setTheme: (t: ThemeId) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
