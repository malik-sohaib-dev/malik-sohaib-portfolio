import { motion } from 'framer-motion'
import { experience } from '../data/content'
import { SectionLabel } from '../components/SectionLabel'

export function ExperienceSection() {
  return (
    <section
      className="section-ambient relative border-b border-white/[0.06] py-22 sm:py-32"
      aria-labelledby="experience-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div id="experience-heading">
          <SectionLabel
            id="experience"
            step="03"
            kicker="Journey"
            title="Experience"
            subtitle="Impact across SaaS, compliance, and real-time infrastructure."
          />
        </div>
        <ol className="relative space-y-8 sm:space-y-10">
          <div
            className="absolute left-0 top-2 bottom-2 hidden w-px sm:left-[11px] sm:block sm:top-3 sm:bottom-3"
            style={{
              background:
                'linear-gradient(180deg, rgba(45,212,191,0.45) 0%, rgba(255,255,255,0.12) 45%, rgba(167,139,250,0.4) 100%)',
            }}
            aria-hidden
          />
          {experience.map((job, idx) => (
            <motion.li
              key={`${job.company}-${job.period}`}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-5%' }}
              transition={{ delay: 0.05 * idx, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative pl-0 sm:pl-12"
            >
              <span
                className="absolute left-0 top-6 z-[1] hidden h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-teal-300/90 bg-void shadow-[0_0_16px_4px_rgba(45,212,191,0.5)] sm:left-[11px] sm:top-7 sm:block"
                aria-hidden
              />
              <div className="card-shine group rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_50px_-28px_rgba(0,0,0,0.4)] transition hover:border-white/15 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foam sm:text-xl">
                      {job.role}
                    </h3>
                    <p className="text-sm text-mist/95">
                      {job.company} · {job.location}{' '}
                      <span className="text-mist/55">({job.model})</span>
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-xs font-medium uppercase tracking-[0.12em] text-teal-400/85">
                    {job.period}
                  </p>
                </div>
                <ul className="mt-4 list-none space-y-2.5 pl-0 text-sm leading-relaxed text-mist/90">
                  {job.highlights.map((h) => (
                    <li
                      key={h.slice(0, 48)}
                      className="relative pl-4 before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-teal-500/60"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-white/6 pt-4 font-mono text-[0.65rem] text-mist/55">
                  <span className="text-mist/65">Stack:</span> {job.stack}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
