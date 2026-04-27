import { motion } from 'framer-motion'
import { lazy, Suspense, useState } from 'react'
import { useLgDown } from '../hooks/useMediaQuery'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { heroStats, site } from '../data/content'
import { StaticHeroBackdrop } from '../components/StaticHeroBackdrop'
import { TechMarquee } from '../components/TechMarquee'

const HeroBackground = lazy(() =>
  import('../components/HeroBackground').then((m) => ({ default: m.HeroBackground }))
)

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
} as const

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
} as const

const name = site.name.split(' ')

export function HeroSection() {
  const reduced = usePrefersReducedMotion()
  const lgDown = useLgDown()
  const [glow, setGlow] = useState<{ x: number; y: number } | null>(null)
  const staticBackdrop = reduced || lgDown

  return (
    <section
      id="top"
      className="relative min-h-svh overflow-hidden border-b border-white/[0.06]"
      onPointerMove={(e) => {
        if (reduced || lgDown) return
        if (window.matchMedia('(pointer: coarse)').matches) {
          setGlow(null)
          return
        }
        const r = e.currentTarget.getBoundingClientRect()
        setGlow({ x: e.clientX - r.left, y: e.clientY - r.top })
      }}
      onPointerLeave={() => setGlow(null)}
    >
      {glow && !reduced && !lgDown && (
        <div
          className="pointer-events-none absolute inset-0 z-[1] mix-blend-screen"
          style={{
            background: `radial-gradient(520px circle at ${glow.x}px ${glow.y}px, rgba(45,212,191,0.14), rgba(99,102,241,0.06) 38%, transparent 55%)`,
          }}
          aria-hidden
        />
      )}

      {staticBackdrop ? (
        <StaticHeroBackdrop />
      ) : (
        <Suspense fallback={<StaticHeroBackdrop />}>
          <HeroBackground />
        </Suspense>
      )}

      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(120deg, rgba(1,4,9,0.15) 0%, rgba(1,4,9,0.45) 42%, #010409 100%), linear-gradient(180deg, rgba(1,4,9,0.05) 0%, rgba(1,4,9,0.9) 68%, #010409 100%)',
        }}
        aria-hidden
      />

      <div className="mesh-spotlight pointer-events-none absolute -left-1/4 top-0 hidden h-[60%] w-[60%] rounded-full bg-teal-500/12 blur-[100px] lg:block sm:w-[50%]" />
      <div className="mesh-spotlight pointer-events-none absolute -right-1/4 top-1/3 hidden h-1/2 w-1/2 rounded-full bg-violet-500/11 blur-[90px] [animation-delay:2.5s] lg:block" />

      <div className="pointer-events-none absolute inset-x-0 top-[12%] z-[2] hidden justify-center sm:top-[14%] lg:flex">
        <div
          className="h-24 w-px max-w-px bg-gradient-to-b from-teal-400/50 via-white/20 to-transparent sm:h-32"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-svh max-w-6xl flex-col px-4 pb-14 pt-28 sm:px-6 sm:pt-32">
        <div className="grid flex-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-8"
          >
            <motion.p
              variants={item}
              className="mb-6 inline-flex max-w-full flex-wrap items-center gap-2.5 rounded-full border border-white/10 bg-gradient-to-r from-white/[0.1] to-white/[0.02] px-3.5 py-2 text-xs text-mist/95 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_32px_-12px_rgba(0,0,0,0.4)] backdrop-blur-xl"
            >
              <span
                className={`size-1.5 shrink-0 rounded-full bg-gradient-to-r from-teal-400 to-cyan-300 shadow-[0_0_12px_2px_rgba(45,212,191,0.55)] ${reduced || lgDown ? '' : 'animate-pulse'}`}
                aria-hidden
              />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist/80">
                {site.location}
              </span>
              <span className="text-mist/40" aria-hidden>
                ·
              </span>
              <span>{site.remote}</span>
              <span className="text-mist/40" aria-hidden>
                ·
              </span>
              <span className="text-foam/95">Open to impact roles</span>
            </motion.p>
            <motion.h1
              variants={item}
              className="font-display text-[2.65rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl md:text-[4.5rem] lg:text-[4.9rem]"
            >
              <span className="hero-gradient-text block drop-shadow-2xl">{name[0]}</span>
              <span className="mt-1.5 block text-[0.48em] font-semibold text-mist/90 sm:mt-2 sm:text-[0.45em]">
                {name.slice(1).join(' ')}
              </span>
            </motion.h1>
            <motion.p
              variants={item}
              className="font-display text-lg font-medium tracking-wide text-teal-200/90 sm:text-xl"
            >
              {site.title}
            </motion.p>
            <motion.p
              variants={item}
              className="mt-5 max-w-xl text-balance text-base leading-relaxed text-mist/95 sm:text-lg"
            >
              {site.tagline}
            </motion.p>
            <motion.div variants={item} className="mt-9 flex flex-wrap gap-3 sm:gap-4">
              {heroStats.map((s) => (
                <div
                  key={s.label}
                  className="group relative min-w-[8.5rem] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_50px_-24px_rgba(45,212,191,0.2)] backdrop-blur-md transition duration-300 hover:border-teal-400/30 hover:shadow-[0_24px_60px_-20px_rgba(45,212,191,0.35)]"
                >
                  <div
                    className="pointer-events-none absolute -right-6 -top-6 hidden size-24 rounded-full bg-teal-400/10 blur-2xl transition group-hover:scale-110 lg:block"
                    aria-hidden
                  />
                  <p className="font-display text-2xl font-bold tracking-tight text-foam sm:text-3xl">
                    {s.value}
                  </p>
                  <p className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist/75">
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>
            <motion.div
              variants={item}
              className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <a href="#experience" className="btn-primary group">
                <span className="relative z-10 flex items-center gap-2">
                  Explore experience
                  <span
                    className="transition group-hover:translate-x-0.5"
                    aria-hidden
                  >
                    →
                  </span>
                </span>
              </a>
              <a href="#contact" className="btn-ghost">
                Start a conversation
              </a>
            </motion.div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:col-span-4 lg:block"
            aria-hidden
          >
            <div className="card-shine relative ml-auto max-w-sm rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-5 shadow-[0_0_80px_-30px_rgba(124,58,237,0.35)]">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-mist/70">
                Focus
              </p>
              <p className="mt-3 font-display text-lg font-semibold text-foam/95">
                Real-time systems, AI in production, platform craft.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-mist/88">
                <li className="flex gap-2">
                  <span className="text-teal-400/80">—</span>
                  Multi-cloud & edge
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-400/80">—</span>
                  RAG & data planes
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-400/80">—</span>
                  Product velocity
                </li>
              </ul>
            </div>
          </motion.aside>
        </div>

        <TechMarquee reduceMotion={reduced} liteViewport={lgDown} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-8 text-center text-xs text-mist/50 md:mt-6"
        >
          <span
            className={`inline-block translate-y-0.5 text-teal-400/50 ${reduced || lgDown ? '' : 'animate-bounce'}`}
            aria-hidden
          >
            ↓
          </span>{' '}
          Scroll
        </motion.div>
      </div>
    </section>
  )
}
