import { useEffect, useId, useState } from 'react'
import { site } from '../data/content'

const links = [
  { href: '#summary', label: 'Summary' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
] as const

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const id = useId()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
    <header
      className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-void/80 py-3 shadow-[0_0_50px_-12px_rgba(45,212,191,0.12)] backdrop-blur-xl'
          : 'bg-gradient-to-b from-void/80 to-transparent py-5 backdrop-blur-[2px]'
      }`}
    >
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
        aria-label="Primary"
      >
        <a
          href="#top"
          className="group font-display text-sm font-medium tracking-tight text-foam/95 transition hover:text-teal-300"
        >
          <span className="text-teal-400/80 group-hover:text-teal-300">◆</span>{' '}
          {site.name.split(' ')[0]}
        </a>
        <ul className="hidden items-center gap-1 text-sm text-mist/90 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-3 py-1.5 transition hover:bg-white/5 hover:text-foam"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a
            href={site.linkedIn}
            target="_blank"
            rel="noreferrer"
            className="hidden text-xs font-medium text-teal-300/90 transition hover:text-teal-200 sm:inline"
          >
            LinkedIn ↗
          </a>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-foam md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={id}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span className="text-lg leading-none">{open ? '×' : '≡'}</span>
          </button>
        </div>
      </nav>
      {open ? (
        <div
          id={id}
          className="border-b border-white/10 bg-void/95 px-4 py-3 backdrop-blur-xl md:hidden"
        >
          <ul className="flex flex-col gap-1 text-sm text-mist/95">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="block rounded-lg px-2 py-2 transition hover:bg-white/5"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={site.linkedIn}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg px-2 py-2 text-teal-300"
                onClick={() => setOpen(false)}
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  )
}
