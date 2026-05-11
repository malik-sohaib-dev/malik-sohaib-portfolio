export type ThemeId = 'dark' | 'light'

/** Persisted preference; align inline script in index.html if you rename this. */
export const THEME_STORAGE_KEY = 'portfolio-theme'

export function isThemeId(value: unknown): value is ThemeId {
  return value === 'dark' || value === 'light'
}
