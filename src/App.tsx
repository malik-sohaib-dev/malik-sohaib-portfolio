import { Navigation } from './components/Navigation'
import { SiteAurora } from './components/SiteAurora'
import { ContactSection } from './sections/ContactSection'
import { EducationSection } from './sections/EducationSection'
import { ExperienceSection } from './sections/ExperienceSection'
import { HeroSection } from './sections/HeroSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { SkillsSection } from './sections/SkillsSection'
import { SummarySection } from './sections/SummarySection'

function App() {
  return (
    <>
      <SiteAurora />
      <div className="grain" aria-hidden />
      <div className="relative bg-void text-foam">
        <Navigation />
        <main>
          <HeroSection />
          <SummarySection />
          <SkillsSection />
          <ExperienceSection />
          <ProjectsSection />
          <EducationSection />
          <ContactSection />
        </main>
      </div>
    </>
  )
}

export default App
