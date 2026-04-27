import { motion } from 'framer-motion'
import { experience } from '../data/content'
import { SectionLabel } from '../components/SectionLabel'

export function ExperienceSection() {
  return (
    <section
      className="relative border-b border-white/5 py-20 sm:py-28"
      aria-labelledby="experience-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div id="experience-heading">
          <SectionLabel
            id="experience"
            kicker="Journey"
            title="Experience"
            subtitle="Impact across SaaS, compliance, and real-time infrastructure."
          />
        </div>
        <ol className="relative space-y-12 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-gradient-to-b before:from-teal-500/50 before:via-white/20 before:to-violet-500/40 sm:pl-0 sm:before:left-3">
          {experience.map((job, idx) => (
            <motion.li
              key={`${job.company}-${job.period}`}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-5%' }}
              transition={{ delay: 0.05 * idx, duration: 0.45 }}
              className="relative pl-9 sm:pl-12"
            >
              <span
                className="absolute left-0 top-1.5 size-[11px] rounded-full border-2 border-teal-400/80 bg-void shadow-[0_0_12px_rgba(45,212,191,0.5)] sm:left-1.5"
                aria-hidden
              />
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <h3 className="font-display text-lg font-medium text-foam sm:text-xl">
                    {job.role}
                  </h3>
                  <p className="text-sm text-mist/95">
                    {job.company} · {job.location}{' '}
                    <span className="text-mist/60">({job.model})</span>
                  </p>
                </div>
                <p className="shrink-0 text-xs font-medium uppercase tracking-wider text-teal-400/80">
                  {job.period}
                </p>
              </div>
              <ul className="mt-4 list-disc space-y-2 pl-4 text-sm leading-relaxed text-mist/90 marker:text-teal-500/70">
                {job.highlights.map((h) => (
                  <li key={h.slice(0, 48)}>{h}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-mist/55">
                <span className="text-mist/70">Stack:</span> {job.stack}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
