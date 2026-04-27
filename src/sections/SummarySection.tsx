import { motion } from 'framer-motion'
import { summary } from '../data/content'
import { SectionLabel } from '../components/SectionLabel'

export function SummarySection() {
  return (
    <section
      className="section-ambient relative overflow-hidden border-b border-white/[0.06] py-22 sm:py-32"
      aria-labelledby="summary-heading"
    >
      <div
        className="pointer-events-none absolute right-0 top-1/4 hidden h-64 w-64 rounded-full bg-violet-500/6 blur-3xl lg:block"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionLabel
          id="summary"
          step="01"
          kicker="Profile"
          title="Summary"
        />
        <motion.div
          id="summary-heading"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.55 }}
          className="card-shine relative max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_32px_80px_-32px_rgba(45,212,191,0.12)] backdrop-blur-xl sm:p-10"
        >
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-teal-400/80">
            Statement
          </p>
          <p className="mt-4 text-pretty text-lg font-light leading-[1.75] text-mist/95 sm:text-xl">
            {summary}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
