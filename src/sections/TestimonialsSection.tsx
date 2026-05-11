import { motion } from 'framer-motion'
import { site, testimonials } from '../data/content'
import { SectionLabel } from '../components/SectionLabel'

const recommendationsUrl = `${site.linkedIn}/details/recommendations/`

export function TestimonialsSection() {
  return (
    <section
      className="section-ambient relative overflow-hidden border-b border-border-subtle py-22 sm:py-32"
      aria-labelledby="testimonials-heading"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,52rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-400/35 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div id="testimonials-heading">
          <SectionLabel
            id="testimonials"
            step="05"
            kicker="Testimonials"
            title="From colleagues & clients"
            subtitle="Verbatim excerpts from LinkedIn recommendations (truncated at natural paragraph breaks). Full text is on the profile."
          />
        </div>
        <ul className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.li
              key={t.author}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.08 * i,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <blockquote className="card-shine flex h-full flex-col rounded-2xl border border-border bg-gradient-to-b from-ink/95 via-void/88 to-void/98 p-6 shadow-[inset_0_1px_0_var(--tp-card-shine-line),0_22px_56px_-28px_rgb(167_139_250_/_0.22)] theme-light:shadow-[inset_0_1px_0_var(--tp-card-shine-line),0_20px_52px_-26px_rgb(109_40_217_/_0.12)] sm:p-7">
                <div className="mb-4 flex items-start gap-3">
                  <span
                    className="font-display text-4xl leading-none text-teal-400/25"
                    aria-hidden
                  >
                    “
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <cite className="not-italic">
                      <span className="font-display text-base font-semibold text-foam">
                        {t.author}
                      </span>
                    </cite>
                    <p className="mt-1 text-sm text-mist/85">
                      {t.title}
                      <span className="text-mist/55"> · </span>
                      {t.organization}
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 border-t border-border-muted pt-4">
                  {t.excerptParagraphs.map((para, j) => (
                    <p
                      key={j}
                      className="text-sm leading-relaxed text-mist/92"
                    >
                      {para}
                    </p>
                  ))}
                </div>
                <p className="mt-5">
                  <a
                    href={recommendationsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-accent underline-offset-4 transition hover:text-accent-dim hover:underline"
                  >
                    Read more on LinkedIn
                    <span aria-hidden>↗</span>
                  </a>
                </p>
              </blockquote>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
