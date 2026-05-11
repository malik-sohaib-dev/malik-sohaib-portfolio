import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SectionLabel } from '../components/SectionLabel'
import { TiltCard } from '../components/TiltCard'
import { projects } from '../data/content'

export function ProjectsSection() {
  return (
    <section
      className="section-ambient relative overflow-hidden border-b border-border-subtle py-22 sm:py-32"
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
            subtitle="Systems built for scale, real-time, and product velocity. Each card opens a written case study—suited for work that cannot be shown as a public demo."
          />
        </div>
        <ul className="grid gap-6 md:grid-cols-3">
          {projects.map((p, i) => (
            <motion.li
              key={p.slug}
              className="h-full"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.08 * i,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                to={`/projects/${p.slug}`}
                className="group block h-full min-h-[16rem] rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
              >
                <TiltCard className="h-full">
                  <article className="card-shine relative flex h-full min-h-[16rem] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-ink/98 via-void/85 to-void/98 p-6 shadow-[inset_0_1px_0_var(--tp-card-shine-line),0_28px_70px_-34px_rgb(99_102_241_/_0.35)] transition duration-300 [transform-style:preserve-3d] group-hover:-translate-y-1 group-hover:border-teal-400/38 group-hover:shadow-[0_32px_80px_-30px_rgb(45_212_191_/_0.42)] theme-light:group-hover:shadow-[0_30px_76px_-28px_rgb(13_148_136_/_0.22)]">
                  <div
                    className="absolute -right-4 -top-2 font-mono text-[4.5rem] font-bold leading-none text-foam/[0.06] tabular-nums transition group-hover:text-accent/[0.14]"
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
                    Case study →
                  </p>
                </article>
                </TiltCard>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
