import { motion } from 'framer-motion'
import { education } from '../data/content'
import { SectionLabel } from '../components/SectionLabel'

export function EducationSection() {
  return (
    <section className="relative border-b border-white/5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionLabel
          id="education"
          kicker="Education"
          title="Academic"
        />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
        >
          <h3 className="font-display text-xl font-medium text-foam">
            {education.degree}
          </h3>
          <p className="mt-1 text-sm text-mist/80">{education.years}</p>
        </motion.div>
      </div>
    </section>
  )
}
