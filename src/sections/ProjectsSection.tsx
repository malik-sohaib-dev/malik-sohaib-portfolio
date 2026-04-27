import { motion } from 'framer-motion'
import { projects } from '../data/content'
import { SectionLabel } from '../components/SectionLabel'
import { TiltCard } from '../components/TiltCard'

export function ProjectsSection() {
  return (
    <section
      className="section-ambient relative overflow-hidden border-b border-white/[0.06] py-22 sm:py-32"
      aria-labelledby="projects-heading"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,52rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-teal-400/45 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div id="projects-heading">
          <SectionLabel
            id="projects"
            step="04"
            kicker="Highlights"
            title="Notable projects"
            subtitle="Systems built for scale, real-time, and product velocity."
          />
        </div>
        <ul className="grid gap-6 md:grid-cols-3">
          {projects.map((p, i) => (
            <motion.li
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.08 * i,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <TiltCard>
                <article className="group card-shine relative flex h-full min-h-[16rem] cursor-default flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ink/98 via-void/85 to-void/98 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_28px_70px_-34px_rgba(99,102,241,0.35)] transition duration-300 [transform-style:preserve-3d] hover:-translate-y-1 hover:border-teal-400/38 hover:shadow-[0_32px_80px_-30px_rgba(45,212,191,0.42)]">
                  <div
                    className="absolute -right-4 -top-2 font-mono text-[4.5rem] font-bold leading-none text-white/[0.04] tabular-nums transition group-hover:text-teal-400/[0.08]"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-teal-500/5 to-transparent opacity-0 transition group-hover:opacity-100"
                    aria-hidden
                  />
                  <div className="relative">
                    <h3 className="font-display text-lg font-semibold text-foam">
                      {p.name}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-mist/90">
                      {p.blurb}
                    </p>
                  </div>
                  <p className="relative mt-5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.2em] text-teal-400/90 opacity-0 transition group-hover:opacity-100">
                    Architect → ship → scale
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
