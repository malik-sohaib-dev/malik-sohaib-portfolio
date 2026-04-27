import { motion } from 'framer-motion'
import { summary } from '../data/content'
import { SectionLabel } from '../components/SectionLabel'

export function SummarySection() {
  return (
    <section
      className="relative border-b border-white/5 py-20 sm:py-28"
      aria-labelledby="summary-heading"
    >
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionLabel
          id="summary"
          kicker="Profile"
          title="Summary"
        />
        <motion.p
          id="summary-heading"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl text-pretty text-lg leading-relaxed text-mist/95 sm:text-xl"
        >
          {summary}
        </motion.p>
      </div>
    </section>
  )
}
