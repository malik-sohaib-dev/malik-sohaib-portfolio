import { stackMarquee } from '../data/content'

const doubled = [...stackMarquee, ...stackMarquee]

type Props = { reduceMotion?: boolean }

export function TechMarquee({ reduceMotion }: Props) {
  if (reduceMotion) {
    return (
      <div className="pointer-events-none relative mt-12 border-y border-white/[0.08] bg-black/30 py-4 backdrop-blur-sm sm:mt-16">
        <p className="px-4 text-center font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-mist/75">
          {stackMarquee.join(' · ')}
        </p>
      </div>
    )
  }
  return (
    <div className="pointer-events-none relative mt-12 overflow-hidden border-y border-white/[0.08] bg-gradient-to-r from-void/80 via-black/50 to-void/80 py-4 backdrop-blur-sm sm:mt-16">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--color-void)] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--color-void)] to-transparent"
        aria-hidden
      />
      <div
        className="hero-marquee flex w-max gap-12 pl-4 font-mono text-[0.65rem] font-medium uppercase tracking-[0.2em] text-mist/75"
        aria-hidden
      >
        {doubled.map((word, i) => (
          <span key={`${word}-${i}`} className="inline-flex shrink-0 items-center gap-12">
            {word}
            <span
              className="text-teal-500/50 shadow-[0_0_20px_rgba(45,212,191,0.35)]"
              aria-hidden
            >
              ·
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
