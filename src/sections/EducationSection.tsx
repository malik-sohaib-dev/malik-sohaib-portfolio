import { motion } from 'framer-motion'
import { education } from '../data/content'
import { SectionLabel } from '../components/SectionLabel'

export function EducationSection() {
  return (
    <section className="section-ambient relative border-b border-white/[0.06] py-22 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionLabel
          id="education"
          step="05"
          kicker="Education"
          title="Academic"
        />
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="card-shine max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_60px_-28px_rgba(45,212,191,0.1)] sm:p-9"
        >
          <h3 className="font-display text-xl font-semibold text-foam">
            {education.degree}
          </h3>
          <p className="mt-2 font-mono text-sm text-mist/75">{education.years}</p>
        </motion.div>
      </div>
    </section>
  )
}
