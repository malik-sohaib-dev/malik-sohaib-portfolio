import { stackMarquee } from '../data/content'

const doubled = [...stackMarquee, ...stackMarquee]

type Props = { reduceMotion?: boolean }

export function TechMarquee({ reduceMotion }: Props) {
  if (reduceMotion) {
    return (
      <div className="pointer-events-none relative mt-12 border-y border-white/5 bg-black/20 py-3 backdrop-blur-sm sm:mt-16">
        <p className="px-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-mist/70">
          {stackMarquee.join(' · ')}
        </p>
      </div>
    )
  }
  return (
    <div className="pointer-events-none relative mt-12 overflow-hidden border-y border-white/5 bg-black/20 py-3 backdrop-blur-sm sm:mt-16">
      <div
        className="hero-marquee flex w-max gap-10 pl-4 text-xs font-medium uppercase tracking-[0.2em] text-mist/70"
        aria-hidden
      >
        {doubled.map((word, i) => (
          <span key={`${word}-${i}`} className="shrink-0">
            {word}
            <span className="ml-10 text-teal-500/40">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
