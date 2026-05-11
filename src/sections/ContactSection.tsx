import { motion } from 'framer-motion'
import { site } from '../data/content'

function copyToClipboard(text: string) {
  void navigator.clipboard.writeText(text)
}

export function ContactSection() {
  return (
    <section
      id="contact"
      className="section-ambient relative scroll-mt-28 overflow-hidden py-22 sm:scroll-mt-32 sm:py-32"
      aria-labelledby="contact-heading"
    >
      <div
        className="pointer-events-none absolute -left-1/4 bottom-0 hidden h-80 w-80 rounded-full bg-teal-500/8 blur-3xl lg:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-1/4 top-0 hidden h-72 w-72 rounded-full bg-violet-500/8 blur-3xl lg:block"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-accent">
              Contact
            </p>
            <h2
              id="contact-heading"
              className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-foam sm:text-4xl md:text-5xl"
            >
              <span className="bg-gradient-to-br from-foam via-foam to-mist/85 bg-clip-text text-transparent">
                Let&apos;s build the next system.
              </span>
            </h2>
            <p className="mt-4 max-w-md text-pretty text-base text-mist/90 sm:text-lg">
              Open to remote opportunities and thoughtful collaborations across
              product engineering, AI, and platform work.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="card-shine flex flex-col gap-4 rounded-3xl border border-border bg-gradient-to-br from-frost-a to-frost-e p-6 shadow-[0_0_0_1px_var(--tp-btn-ring),0_32px_80px_-28px_rgb(45_212_191_/_0.12)] theme-light:shadow-[0_0_0_1px_var(--tp-btn-ring),0_28px_72px_-26px_rgb(13_148_136_/_0.12)] sm:p-7"
          >
            <a
              href={`mailto:${site.email}`}
              className="group cursor-pointer text-lg text-accent transition duration-200 hover:text-accent-dim sm:text-xl"
            >
              {site.email}
              <span
                className="ml-1 inline opacity-0 transition group-hover:opacity-100"
                aria-hidden
              >
                ↗
              </span>
            </a>
            <a
              href={`tel:${site.phone.replace(/[-\s]/g, '')}`}
              className="cursor-pointer text-mist/90 transition hover:text-foam"
            >
              {site.phone}
            </a>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={site.linkedIn}
                target="_blank"
                rel="noreferrer"
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border-strong bg-glass-fill px-3.5 py-2 text-xs font-medium text-foam transition hover:border-teal-400/35 hover:bg-glass-fill-strong"
              >
                LinkedIn
                <span aria-hidden>↗</span>
              </a>
              <button
                type="button"
                onClick={() => copyToClipboard(site.email)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border-strong bg-glass-fill px-3.5 py-2 text-xs font-medium text-foam transition hover:border-teal-400/35 hover:bg-glass-fill-strong"
              >
                Copy email
              </button>
            </div>
          </motion.div>
        </div>
        <p className="mt-24 text-center font-mono text-[0.65rem] uppercase tracking-[0.15em] text-mist/40">
          © {new Date().getFullYear()} {site.name} · React · Vite · Tailwind · Three.js
        </p>
      </div>
    </section>
  )
}
