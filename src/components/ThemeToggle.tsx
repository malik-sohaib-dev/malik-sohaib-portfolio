import { useTheme } from '../theme'

function SunIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

type Props = { className?: string }

/**
 * Switches `data-theme` on `<html>` (colors live in `index.css` under `:root` / `[data-theme="light"]`).
 */
export function ThemeToggle({ className = '' }: Props) {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-glass-fill text-foam shadow-[0_0_0_1px_var(--tp-btn-ring)] transition hover:border-teal-400/35 hover:bg-glass-fill-strong ${className}`}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      aria-pressed={isLight}
    >
      <span className="relative size-[18px]">
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isLight ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-90'
          }`}
        >
          <SunIcon />
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isLight ? 'scale-75 opacity-0 -rotate-90' : 'scale-100 opacity-100 rotate-0'
          }`}
        >
          <MoonIcon />
        </span>
      </span>
    </button>
  )
}
