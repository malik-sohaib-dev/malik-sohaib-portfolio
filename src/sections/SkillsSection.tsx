import { motion } from 'framer-motion'
import { skillGroups } from '../data/content'
import { SectionLabel } from '../components/SectionLabel'
import { TiltCard } from '../components/TiltCard'

const card = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.04 * i,
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
} as const

export function SkillsSection() {
  return (
    <section
      className="section-ambient relative border-b border-border-subtle py-22 sm:py-32"
      aria-labelledby="skills-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div id="skills-heading">
          <SectionLabel
            id="skills"
            step="02"
            kicker="Stack"
            title="Core skills"
            subtitle="From edge to data plane — product-grade delivery across the full stack and AI."
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group, i) => (
            <TiltCard key={group.name}>
              <motion.article
                custom={i}
                variants={card}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-8%' }}
                className="group card-shine relative cursor-default overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-frost-a via-frost-e to-violet-500/[0.05] p-6 shadow-[0_0_0_1px_var(--tp-btn-ring),0_24px_60px_-30px_rgb(45_212_191_/_0.15)] backdrop-blur-md transition [transform-style:preserve-3d] hover:border-teal-400/35 hover:shadow-[0_0_60px_-18px_rgb(45_212_191_/_0.28)] theme-light:hover:shadow-[0_0_56px_-18px_rgb(13_148_136_/_0.18)]"
              >
                <div
                  className="absolute -right-8 -top-8 hidden size-40 rounded-full bg-gradient-to-br from-teal-500/18 to-violet-500/15 blur-2xl transition group-hover:scale-110 lg:block"
                  aria-hidden
                />
                <h3 className="relative font-display text-lg font-semibold text-foam">
                  {group.name}
                </h3>
                <ul className="relative mt-5 flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <li key={skill}>
                      <span className="inline-block cursor-default rounded-lg border border-border bg-void/60 px-2.5 py-1 text-xs text-mist/95 shadow-[0_0_0_1px_var(--tp-btn-ring)] backdrop-blur-sm transition group-hover:border-border-strong">
                        {skill}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}
