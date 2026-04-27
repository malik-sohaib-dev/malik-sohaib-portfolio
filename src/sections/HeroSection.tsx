import { motion } from 'framer-motion'
import { lazy, Suspense, useState } from 'react'
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
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
} as const

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
} as const

const name = site.name.split(' ')

export function HeroSection() {
  const reduced = usePrefersReducedMotion()
  const [glow, setGlow] = useState<{ x: number; y: number } | null>(null)

  return (
    <section
      id="top"
      className="relative min-h-svh overflow-hidden border-b border-white/5"
      onPointerMove={(e) => {
        if (reduced) return
        if (window.matchMedia('(pointer: coarse)').matches) {
          setGlow(null)
          return
        }
        const r = e.currentTarget.getBoundingClientRect()
        setGlow({ x: e.clientX - r.left, y: e.clientY - r.top })
      }}
      onPointerLeave={() => setGlow(null)}
    >
      {glow && !reduced && (
        <div
          className="pointer-events-none absolute inset-0 z-[1] mix-blend-screen"
          style={{
            background: `radial-gradient(520px circle at ${glow.x}px ${glow.y}px, rgba(45,212,191,0.16), rgba(99,102,241,0.05) 38%, transparent 55%)`,
          }}
          aria-hidden
        />
      )}

      {reduced ? (
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
            'linear-gradient(120deg, rgba(3,7,18,0.2) 0%, rgba(3,7,18,0.5) 40%, #030712 100%), linear-gradient(180deg, rgba(3,7,18,0.1) 0%, rgba(3,7,18,0.88) 70%, #030712 100%)',
        }}
        aria-hidden
      />

      <div className="mesh-spotlight pointer-events-none absolute -left-1/4 top-0 h-[60%] w-[60%] rounded-full bg-teal-500/10 blur-[100px] sm:w-[50%]" />
      <div className="mesh-spotlight pointer-events-none absolute -right-1/4 top-1/3 h-1/2 w-1/2 rounded-full bg-violet-500/10 blur-[90px] [animation-delay:2.5s]" />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-6xl flex-col px-4 pb-12 pt-24 sm:px-6 sm:pt-28">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-12 lg:gap-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-8"
          >
            <motion.p
              variants={item}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-white/[0.08] to-white/[0.02] px-3 py-1.5 text-xs text-mist/95 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-md"
            >
              <span
                className="size-1.5 animate-pulse rounded-full bg-gradient-to-r from-teal-400 to-cyan-300 shadow-[0_0_10px_2px_rgba(45,212,191,0.5)]"
                aria-hidden
              />
              {site.location} · {site.remote} · Open to impact roles
            </motion.p>
            <motion.h1
              variants={item}
              className="font-display text-[2.5rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl md:text-[4.5rem] lg:text-[4.8rem]"
            >
              <span className="hero-gradient-text block">{name[0]}</span>
              <span className="mt-1 block text-[0.5em] font-semibold text-mist/85 sm:mt-2 sm:text-[0.45em]">
                {name.slice(1).join(' ')}
              </span>
            </motion.h1>
            <motion.p
              variants={item}
              className="font-display text-lg font-medium tracking-wide text-teal-200/80 sm:text-xl"
            >
              {site.title}
            </motion.p>
            <motion.p
              variants={item}
              className="mt-5 max-w-xl text-balance text-base leading-relaxed text-mist/95 sm:text-lg"
            >
              {site.tagline}
            </motion.p>
            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap gap-4"
            >
              {heroStats.map((s) => (
                <div
                  key={s.label}
                  className="min-w-[9rem] rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_0_30px_-12px_rgba(45,212,191,0.2)]"
                >
                  <p className="text-2xl font-bold tracking-tight text-foam sm:text-3xl">
                    {s.value}
                  </p>
                  <p className="text-[0.7rem] uppercase tracking-[0.15em] text-mist/70">
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>
            <motion.div
              variants={item}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <a
                href="#experience"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 px-7 py-3 text-sm font-bold text-void shadow-[0_0_50px_-8px_rgba(45,212,191,0.65),inset_0_1px_0_rgba(255,255,255,0.3)] transition hover:brightness-110"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore experience
                  <span className="transition group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </span>
              </a>
              <a
                href="#contact"
                className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-foam/95 backdrop-blur transition hover:border-teal-400/40 hover:shadow-[0_0_30px_-8px_rgba(45,212,191,0.25)]"
              >
                Start a conversation
              </a>
            </motion.div>
          </motion.div>
          {/* <div
            className="pointer-events-none relative hidden h-48 max-h-[50vh] lg:col-span-4 lg:block"
            aria-hidden
          >
            <div className="absolute inset-0 scale-110 bg-gradient-to-tr from-teal-500/0 via-cyan-500/10 to-violet-500/5 blur-3xl" />
            <div className="absolute right-0 top-1/2 w-32 -translate-y-1/2 rounded-2xl border border-white/5 bg-gradient-to-b from-white/10 to-transparent p-3 text-right text-xs text-mist/60 backdrop-blur">
              <p className="font-display text-lg font-semibold text-teal-200/90">
                WebGL
              </p>
              <p className="mt-0.5">Immersive hero</p>
            </div>
          </div> */}
        </div>

        <TechMarquee reduceMotion={reduced} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-6 text-center text-xs text-mist/50 md:mt-4"
        >
          <span className="inline-block translate-y-0.5 animate-bounce" aria-hidden>
            ↓
          </span>{' '}
          Scroll
        </motion.div>
      </div>
    </section>
  )
}
