import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../data/content'
import { ThemeToggle } from './ThemeToggle'

const links = [
  { to: '/#summary', label: 'Summary' },
  { to: '/#skills', label: 'Skills' },
  { to: '/#experience', label: 'Experience' },
  { to: '/#projects', label: 'Projects' },
  { to: '/#testimonials', label: 'Testimonials' },
  { to: '/#contact', label: 'Contact' },
] as const

function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 2v20M3 7l9 5 9-5"
        stroke="currentColor"
        strokeWidth="1.2"
        className="text-logo-dim"
      />
    </svg>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden
      >
        <path d="M6 6L18 18M18 6L6 18" />
      </svg>
    )
  }
  return (
    <svg
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const id = useId()

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        setScrolled(window.scrollY > 24)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={`pointer-events-auto mx-auto max-w-6xl transition-all duration-500 ${
          scrolled ? 'nav-glass-scrolled' : 'nav-glass'
        }`}
      >
        <nav
          className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-5 sm:py-3"
          aria-label="Primary"
        >
          <Link
            to="/#top"
            className="group flex cursor-pointer items-center gap-2.5 font-display text-sm font-semibold tracking-tight text-foam/95 transition hover:text-accent"
          >
            <span className="text-accent transition group-hover:scale-105 theme-dark:text-teal-400/90 theme-light:text-accent-dim">
              <LogoMark />
            </span>
            <span>{site.name.split(' ')[0]}</span>
          </Link>
          <ul className="hidden items-center gap-0.5 text-[0.8125rem] text-mist/90 md:flex">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="cursor-pointer rounded-full px-3.5 py-2 font-medium text-mist/95 transition duration-200 hover:bg-frost-d hover:text-foam"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <a
              href={site.linkedIn}
              target="_blank"
              rel="noreferrer"
              className="hidden cursor-pointer text-xs font-medium text-accent transition duration-200 hover:text-accent-dim sm:inline"
            >
              LinkedIn ↗
            </a>
            <Link
              to="/#contact"
              className="hidden cursor-pointer rounded-full border border-border-strong bg-frost-d px-3 py-1.5 text-xs font-medium text-foam/90 shadow-[0_0_20px_-8px_rgb(45_212_191_/_0.25)] transition duration-200 hover:border-teal-400/40 hover:bg-frost-c theme-light:shadow-[0_0_18px_-8px_rgb(13_148_136_/_0.2)] sm:inline"
            >
              Connect
            </Link>
            <button
              type="button"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-border-strong text-foam transition hover:border-border hover:bg-frost-e md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={id}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <MenuIcon open={open} />
            </button>
          </div>
        </nav>
        {open ? (
          <div
            id={id}
            className="border-t border-border-muted bg-void/90 px-3 py-3 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col gap-0.5 text-sm text-mist/95">
              {links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="block cursor-pointer rounded-xl px-3 py-2.5 font-medium transition hover:bg-frost-e"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={site.linkedIn}
                  target="_blank"
                  rel="noreferrer"
                  className="block cursor-pointer rounded-xl px-3 py-2.5 text-accent"
                  onClick={() => setOpen(false)}
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        ) : null}
      </div>
    </header>
  )
}
