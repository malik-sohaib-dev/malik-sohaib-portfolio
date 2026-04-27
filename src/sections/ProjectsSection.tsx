import { motion } from 'framer-motion'
import { projects } from '../data/content'
import { SectionLabel } from '../components/SectionLabel'
import { TiltCard } from '../components/TiltCard'

export function ProjectsSection() {
  return (
    <section
      className="relative overflow-hidden border-b border-white/5 py-20 sm:py-28"
      aria-labelledby="projects-heading"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,48rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div id="projects-heading">
          <SectionLabel
            id="projects"
            kicker="Highlights"
            title="Notable projects"
            subtitle="Systems built for scale, real-time, and product velocity."
          />
        </div>
        <ul className="grid gap-5 md:grid-cols-3">
          {projects.map((p, i) => (
            <motion.li
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard>
                <article className="group relative flex h-full min-h-[14rem] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ink/95 via-void/80 to-void/95 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_60px_-30px_rgba(99,102,241,0.25)] transition duration-300 [transform-style:preserve-3d] hover:-translate-y-1 hover:border-teal-400/35 hover:shadow-[0_28px_70px_-28px_rgba(45,212,191,0.45)]">
                  <div
                    className="absolute -right-6 -top-6 text-8xl font-extrabold text-white/[0.04] transition group-hover:text-teal-400/[0.07]"
                    aria-hidden
                  >
                    {String(i==0 ? ('011') : (i + 1)).padStart(2, '0')}
                  </div>
                  <div className="relative">
                    <h3 className="font-display text-lg font-semibold text-foam">
                      {p.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-mist/90">
                      {p.blurb}
                    </p>
                  </div>
                  <p className="relative mt-4 text-xs font-medium uppercase tracking-widest text-teal-400/80 opacity-0 transition group-hover:opacity-100">
                    Architect · ship · scale →
                  </p>
                </article>
              </TiltCard>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
