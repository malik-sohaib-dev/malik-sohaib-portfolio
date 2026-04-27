import { motion } from 'framer-motion'

type Props = {
  id: string
  kicker: string
  title: string
  subtitle?: string
  /** Optional step index, e.g. "01" */
  step?: string
}

export function SectionLabel({ id, kicker, title, subtitle, step }: Props) {
  return (
    <div id={id} className="mb-12 scroll-mt-28 sm:scroll-mt-32">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
        {step ? (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 0.45 }}
            className="font-mono text-sm tabular-nums text-teal-500/50 sm:pt-1.5"
            aria-hidden
          >
            {step}
          </motion.span>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-3">
            <span
              className="h-px w-8 bg-gradient-to-r from-teal-400/60 to-transparent sm:w-12"
              aria-hidden
            />
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20%' }}
              transition={{ duration: 0.4 }}
              className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.24em] text-teal-400/95"
            >
              {kicker}
            </motion.p>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 0.55, delay: 0.04 }}
            className="font-display text-3xl font-semibold tracking-tight text-foam sm:text-4xl md:text-[2.5rem] md:leading-tight"
          >
            <span className="bg-gradient-to-br from-foam via-foam to-mist/90 bg-clip-text text-transparent">
              {title}
            </span>
          </motion.h2>
          {subtitle ? (
            <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-mist/95 sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
