import { motion } from 'framer-motion'

type Props = {
  id: string
  kicker: string
  title: string
  subtitle?: string
}

export function SectionLabel({ id, kicker, title, subtitle }: Props) {
  return (
    <div id={id} className="mb-10 scroll-mt-24 sm:scroll-mt-28">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20%' }}
        transition={{ duration: 0.4 }}
        className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-400/90"
      >
        {kicker}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20%' }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="font-display text-3xl font-medium tracking-tight text-foam sm:text-4xl"
      >
        {title}
      </motion.h2>
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-sm text-mist/95 sm:text-base">{subtitle}</p>
      ) : null}
    </div>
  )
}
