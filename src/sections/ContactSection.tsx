import { motion } from 'framer-motion'
import { site } from '../data/content'

function copyToClipboard(text: string) {
  void navigator.clipboard.writeText(text)
}

export function ContactSection() {
  return (
    <section
      id="contact"
      className="section-ambient relative overflow-hidden py-22 sm:py-32"
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
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-teal-400/90">
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
            className="card-shine flex flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_32px_80px_-28px_rgba(45,212,191,0.12)] sm:p-7"
          >
            <a
              href={`mailto:${site.email}`}
              className="group cursor-pointer text-lg text-teal-300 transition duration-200 hover:text-teal-200 sm:text-xl"
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
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/16 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-foam transition hover:border-teal-400/35 hover:bg-white/[0.1]"
              >
                LinkedIn
                <span aria-hidden>↗</span>
              </a>
              <button
                type="button"
                onClick={() => copyToClipboard(site.email)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/16 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-foam transition hover:border-teal-400/35 hover:bg-white/[0.1]"
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
