import { motion } from 'framer-motion'
import { skillGroups } from '../data/content'
import { SectionLabel } from '../components/SectionLabel'
import { TiltCard } from '../components/TiltCard'

const card = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.04 * i, duration: 0.4 },
  }),
} as const

export function SkillsSection() {
  return (
    <section
      className="relative border-b border-white/5 py-20 sm:py-28"
      aria-labelledby="skills-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div id="skills-heading">
          <SectionLabel
            id="skills"
            kicker="Stack"
            title="Core skills"
            subtitle="From edge to data plane — product-grade delivery across the full stack and AI."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group, i) => (
            <TiltCard key={group.name}>
              <motion.article
                custom={i}
                variants={card}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-8%' }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-violet-500/[0.04] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_50px_-28px_rgba(45,212,191,0.12)] backdrop-blur-md transition [transform-style:preserve-3d] hover:border-teal-400/35 hover:shadow-[0_0_50px_-20px_rgba(45,212,191,0.25)]"
              >
                <div
                  className="absolute -right-8 -top-8 size-36 rounded-full bg-gradient-to-br from-teal-500/20 to-violet-500/15 blur-2xl transition group-hover:scale-110"
                  aria-hidden
                />
                <h3 className="relative font-display text-lg font-semibold text-foam">
                  {group.name}
                </h3>
                <ul className="relative mt-4 flex flex-wrap gap-1.5">
                  {group.items.map((skill) => (
                    <li key={skill}>
                      <span className="inline-block rounded-md border border-white/10 bg-void/50 px-2 py-0.5 text-xs text-mist/95">
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
