import { Navigation } from './components/Navigation'
import { PolylineCursor } from './components/PolylineCursor'
import { SiteAurora } from './components/SiteAurora'
import { ContactSection } from './sections/ContactSection'
import { ExperienceSection } from './sections/ExperienceSection'
import { HeroSection } from './sections/HeroSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { SkillsSection } from './sections/SkillsSection'
import { SummarySection } from './sections/SummarySection'
import { TestimonialsSection } from './sections/TestimonialsSection'

function App() {
  return (
    <>
      {/* Base tint behind decorative layers; ribbons/site sit above this but below content (z-auto would cover −z overlays). */}
      <div className="pointer-events-none fixed inset-0 -z-30 bg-void" aria-hidden />
      <SiteAurora />
      <PolylineCursor />
      <div className="grain" aria-hidden />
      <div className="relative z-10 text-foam">
        <Navigation />
        <main>
          <HeroSection />
          <SummarySection />
          <SkillsSection />
          <ExperienceSection />
          <ProjectsSection />
          <TestimonialsSection />
          <ContactSection />
        </main>
      </div>
    </>
  )
}

export default App
