import { motion } from 'framer-motion'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { buildThemedMermaidDefinition } from '../data/architecture/mermaidThemedDefinition'
import { useTheme } from '../theme'

type Props = {
  /** Flowchart source only; init + classDef are applied for the active site theme. */
  mermaidBody: string
  /** Short line under the heading */
  description?: string
  /** Accessible name for the SVG graphic */
  ariaLabel: string
}

let mermaidInitialized = false

function ExpandIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
    </svg>
  )
}

function CloseIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function CaseStudyArchitectureDiagram({
  mermaidBody,
  description,
  ariaLabel,
}: Props) {
  const { theme } = useTheme()
  const instanceId = useId().replace(/:/g, '')
  const hostRef = useRef<HTMLDivElement>(null)
  const modalHostRef = useRef<HTMLDivElement>(null)
  const expandButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const definition = useMemo(
    () => buildThemedMermaidDefinition(mermaidBody, theme),
    [mermaidBody, theme],
  )

  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [modalRenderKey, setModalRenderKey] = useState(0)

  const closeModal = useCallback(() => {
    setExpanded(false)
    modalHostRef.current?.replaceChildren()
    setModalError(null)
    queueMicrotask(() => expandButtonRef.current?.focus())
  }, [])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const mermaid = (await import('mermaid')).default

        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'loose',
            fontFamily: 'Outfit, ui-sans-serif, system-ui',
          })
          mermaidInitialized = true
        }

        const host = hostRef.current
        if (!host || cancelled) return

        host.replaceChildren()
        const renderId = `mmd-inline-${instanceId}`
        const { svg, bindFunctions } = await mermaid.render(renderId, definition)

        if (cancelled || !hostRef.current) return

        hostRef.current.innerHTML = svg
        bindFunctions?.(hostRef.current)
        if (!cancelled) setError(null)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not render diagram')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [definition, instanceId])

  useEffect(() => {
    if (!expanded) {
      document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'

    let cancelled = false

    void (async () => {
      try {
        const mermaid = (await import('mermaid')).default
        const host = modalHostRef.current
        if (!host || cancelled) return

        host.replaceChildren()
        const renderId = `mmd-modal-${instanceId}-k${modalRenderKey}`
        const { svg, bindFunctions } = await mermaid.render(renderId, definition)

        if (cancelled || !modalHostRef.current) return

        modalHostRef.current.innerHTML = svg
        bindFunctions?.(modalHostRef.current)
        if (!cancelled) setModalError(null)
      } catch (e) {
        if (!cancelled) {
          setModalError(e instanceof Error ? e.message : 'Could not render diagram')
        }
      }
    })()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    queueMicrotask(() => closeButtonRef.current?.focus())

    return () => {
      cancelled = true
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [expanded, definition, instanceId, modalRenderKey, closeModal])

  const openModal = () => {
    setModalRenderKey((k) => k + 1)
    setExpanded(true)
  }

  const modal =
    expanded && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
            role="presentation"
          >
            <button
              type="button"
              className="absolute inset-0 cursor-default bg-void/80 backdrop-blur-md theme-light:bg-[#0f172a]/75"
              aria-label="Close enlarged diagram"
              onClick={closeModal}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              className="relative z-[1] flex max-h-[min(92vh,56rem)] w-full max-w-[min(96rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-border-strong bg-void shadow-[0_24px_80px_-20px_rgb(0_0_0_/_0.55)] theme-light:border-border"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border-muted px-4 py-3 sm:px-5">
                <p className="font-display text-sm font-semibold tracking-tight text-foam">
                  Architecture — enlarged
                </p>
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="flex h-9 w-9 cursor-pointer shrink-0 items-center justify-center rounded-xl border border-border-strong text-mist transition hover:border-teal-400/35 hover:bg-frost-e hover:text-foam"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
                {modalError ? (
                  <p className="text-sm text-red-400/95" role="alert">
                    {modalError}
                  </p>
                ) : null}
                <div
                  ref={modalHostRef}
                  className="text-foam [&_svg]:block [&_svg]:h-auto [&_svg]:max-h-none [&_svg]:max-w-none [&_svg]:min-w-0"
                />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="mt-10 border-b border-border-subtle py-12 sm:mt-12 sm:py-14"
      aria-labelledby="diagram-arch-title"
    >
      <p className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.24em] text-teal-400/95">
        00
      </p>
      <h2
        id="diagram-arch-title"
        className="font-display mt-2 text-xl font-semibold tracking-tight text-foam sm:text-2xl"
      >
        Architecture
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-mist/95 sm:text-[0.9375rem]">
          {description}
        </p>
      ) : null}

      <div
        className="group relative mt-6 rounded-2xl border border-border-muted bg-void p-3 shadow-[inset_0_1px_0_var(--tp-card-shine-line)] sm:p-4 theme-light:border-border theme-light:shadow-[inset_0_1px_0_rgb(15_23_42_/_0.06)]"
        role="presentation"
      >
        {error ? null : (
          <button
            ref={expandButtonRef}
            type="button"
            disabled={Boolean(error)}
            aria-expanded={expanded}
            aria-label="Open architecture diagram in a larger view"
            title="Enlarge diagram"
            onClick={openModal}
            className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-border-muted bg-void/85 text-mist/70 opacity-0 shadow-sm backdrop-blur-sm transition duration-200 hover:border-teal-400/30 hover:text-teal-400/95 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-teal-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:pointer-events-none disabled:opacity-0 theme-light:bg-[#f4f7fb]/90 theme-light:focus-visible:ring-offset-[#f4f7fb]"
          >
            <ExpandIcon className="size-[1.125rem]" />
          </button>
        )}
        {error ? (
          <p className="text-sm text-red-400/95" role="alert">
            {error}
          </p>
        ) : null}
        <div
          ref={hostRef}
          className="min-h-28 w-full overflow-x-auto text-foam [&_svg]:block [&_svg]:h-auto [&_svg]:max-h-[min(80vh,52rem)] [&_svg]:min-h-0 [&_svg]:min-w-0 [&_svg]:w-full [&_svg]:max-w-full"
          aria-label={ariaLabel}
        />
      </div>

      {modal}
    </motion.section>
  )
}
