import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { CaseStudyArchitectureDiagram } from '../components/CaseStudyArchitectureDiagram'
import { getArchitectureDiagramForProject } from '../data/architecture'
import { getProjectBySlug } from '../data/content'

function StudyBlock({
  sectionId,
  kicker,
  title,
  paragraphs,
}: {
  sectionId: string
  kicker: string
  title: string
  paragraphs: readonly string[]
}) {
  const headingId = `study-${sectionId}`
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-border-subtle py-12 last:border-b-0 sm:py-14"
      aria-labelledby={headingId}
    >
      <p className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.24em] text-teal-400/95">
        {kicker}
      </p>
      <h2
        id={headingId}
        className="font-display mt-2 text-xl font-semibold tracking-tight text-foam sm:text-2xl"
      >
        {title}
      </h2>
      <div className="mt-4 space-y-3.5 text-sm leading-relaxed text-mist/95 sm:text-[0.9375rem]">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-pretty">
            {p}
          </p>
        ))}
      </div>
    </motion.section>
  )
}

export function ProjectCaseStudyPage() {
  const { slug } = useParams<{ slug: string }>()
  const project = slug ? getProjectBySlug(slug) : undefined

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!project) {
    return <Navigate to="/" replace />
  }

  const { caseStudy: cs } = project
  const architectureDiagram = getArchitectureDiagramForProject(project.slug)

  return (
    <article
      className="section-ambient relative border-b border-border-subtle pb-22 pt-28 sm:pb-32 sm:pt-32"
      aria-labelledby="case-study-title"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,52rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-teal-400/45 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          to="/#projects"
          className="inline-flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-teal-400/90 transition hover:text-teal-400"
        >
          <span aria-hidden>←</span> Projects
        </Link>

        <header className="mt-10">
          <h1
            id="case-study-title"
            className="font-display text-3xl font-semibold tracking-tight text-foam sm:text-4xl"
          >
            {project.name}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-mist/95 sm:text-lg">
            {project.tagline}
          </p>
          <ul
            className="mt-6 flex flex-wrap gap-2"
            aria-label="Technologies and themes"
          >
            {project.stack.map((t) => (
              <li
                key={t}
                className="rounded-full border border-border bg-frost-e px-3 py-1 font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em] text-mist/90"
              >
                {t}
              </li>
            ))}
          </ul>
        </header>

        {architectureDiagram ? (
          <CaseStudyArchitectureDiagram
            key={project.slug}
            mermaidBody={architectureDiagram.mermaidBody}
            ariaLabel={architectureDiagram.ariaLabel}
            description={architectureDiagram.description}
          />
        ) : null}

        <StudyBlock
          sectionId="context"
          kicker="01"
          title="Context"
          paragraphs={cs.context}
        />
        <StudyBlock
          sectionId="problem"
          kicker="02"
          title="Problem"
          paragraphs={cs.problem}
        />
        <StudyBlock
          sectionId="approach"
          kicker="03"
          title="Approach"
          paragraphs={cs.approach}
        />
        <StudyBlock
          sectionId="engineering"
          kicker="04"
          title="Engineering"
          paragraphs={cs.technical}
        />
        <StudyBlock
          sectionId="outcomes"
          kicker="05"
          title="Outcomes"
          paragraphs={cs.outcomes}
        />

        {cs.ndaNote ? (
          <aside
            className="mt-4 rounded-2xl border border-border-muted bg-gradient-to-b from-frost-e/80 to-transparent p-5 sm:p-6"
            role="note"
          >
            <p className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.2em] text-teal-400/85">
              Confidentiality
            </p>
            <p className="mt-2 text-sm leading-relaxed text-mist/90">{cs.ndaNote}</p>
          </aside>
        ) : null}
      </div>
    </article>
  )
}
