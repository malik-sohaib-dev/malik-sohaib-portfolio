import { motion } from 'framer-motion'
import { site } from '../data/content'

function copyToClipboard(text: string) {
  void navigator.clipboard.writeText(text)
}

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative py-20 sm:py-28"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
          <div>
            <h2
              id="contact-heading"
              className="font-display text-3xl font-medium tracking-tight text-foam sm:text-4xl"
            >
              Let&apos;s build the next system.
            </h2>
            <p className="mt-3 max-w-md text-mist/90">
              Open to remote opportunities and thoughtful collaborations across
              product engineering, AI, and platform work.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-5 sm:p-6"
          >
            <a
              href={`mailto:${site.email}`}
              className="group text-lg text-teal-300 transition hover:text-teal-200 sm:text-xl"
            >
              {site.email}
              <span className="ml-1 inline opacity-0 transition group-hover:opacity-100" aria-hidden>
                ↗
              </span>
            </a>
            <a
              href={`tel:${site.phone.replace(/[-\s]/g, '')}`}
              className="text-mist/90 transition hover:text-foam"
            >
              {site.phone}
            </a>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={site.linkedIn}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-foam transition hover:border-white/30"
              >
                LinkedIn
                <span aria-hidden>↗</span>
              </a>
              <button
                type="button"
                onClick={() => copyToClipboard(site.email)}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-foam transition hover:border-white/30"
              >
                Copy email
              </button>
            </div>
          </motion.div>
        </div>
        <p className="mt-20 text-center text-xs text-mist/45">
          © {new Date().getFullYear()} {site.name}. Crafted with React, Vite, Tailwind & Three.js.
        </p>
      </div>
    </section>
  )
}
