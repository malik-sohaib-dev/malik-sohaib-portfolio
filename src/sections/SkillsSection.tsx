import { motion } from 'framer-motion'
import { useLayoutEffect, useRef } from 'react'
import { skillGroups } from '../data/content'
import { SectionLabel } from '../components/SectionLabel'
import { TiltCard } from '../components/TiltCard'
import { useLgDown } from '../hooks/useMediaQuery'

/** One viewport pass + stagger on the grid avoids row-2 cards staying invisible until each one's IO fires. */
const gridContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0,
    },
  },
} as const

const gridItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
} as const

export function SkillsSection() {
  const gridRef = useRef<HTMLDivElement>(null)
  const lgDown = useLgDown()

  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const cardEls = () =>
      [...grid.querySelectorAll<HTMLElement>('[data-skill-card]')]

    const clearMinHeights = () => {
      for (const el of cardEls()) el.style.minHeight = ''
    }

    if (lgDown) {
      clearMinHeights()
      return
    }

    const syncEqualHeights = () => {
      clearMinHeights()
      grid.getBoundingClientRect()
      const els = cardEls()
      if (els.length === 0) return
      let max = 0
      for (const el of els) {
        max = Math.max(max, el.getBoundingClientRect().height)
      }
      const px = `${Math.ceil(max)}px`
      for (const el of els) el.style.minHeight = px
    }

    syncEqualHeights()
    const ro = new ResizeObserver(() => syncEqualHeights())
    ro.observe(grid)
    window.addEventListener('resize', syncEqualHeights)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', syncEqualHeights)
      clearMinHeights()
    }
  }, [lgDown])

  return (
    <section
      className="section-ambient relative border-b border-border-subtle py-22 sm:py-32"
      aria-labelledby="skills-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div id="skills-heading">
          <SectionLabel
            id="skills"
            step="02"
            kicker="Stack"
            title="Core skills"
            subtitle="From edge to data plane — product-grade delivery across the full stack and AI."
          />
        </div>
        <motion.div
          ref={gridRef}
          className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={gridContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12, margin: '0px 0px 28% 0px' }}
        >
          {skillGroups.map((group) => (
            <motion.div
              key={group.name}
              variants={gridItem}
              className="flex min-h-0 h-full min-w-0"
            >
              <TiltCard className="h-full min-h-0 w-full min-w-0">
                <article
                  data-skill-card
                  className="group card-shine relative flex h-full min-h-0 cursor-default flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-frost-a via-frost-e to-violet-500/[0.05] p-6 shadow-[0_0_0_1px_var(--tp-btn-ring),0_24px_60px_-30px_rgb(45_212_191_/_0.15)] backdrop-blur-sm transition [transform-style:preserve-3d] hover:border-teal-400/35 hover:shadow-[0_0_60px_-18px_rgb(45_212_191_/_0.28)] theme-light:hover:shadow-[0_0_56px_-18px_rgb(13_148_136_/_0.18)]"
                >
                  <div
                    className="absolute -right-8 -top-8 hidden size-40 rounded-full bg-gradient-to-br from-teal-500/18 to-violet-500/15 blur-2xl transition group-hover:scale-110 lg:block"
                    aria-hidden
                  />
                  <h3 className="relative font-display text-lg font-semibold text-foam">
                    {group.name}
                  </h3>
                  <ul className="relative mt-5 flex flex-wrap gap-2">
                    {group.items.map((skill) => (
                      <li key={skill}>
                        <span className="inline-block cursor-default rounded-lg border border-border bg-void/60 px-2.5 py-1 text-xs text-mist/95 shadow-[0_0_0_1px_var(--tp-btn-ring)] transition group-hover:border-border-strong">
                          {skill}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
