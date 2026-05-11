import { Outlet } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { PolylineCursor } from './components/PolylineCursor'
import { ScrollToHash } from './components/ScrollToHash'
import { SiteAurora } from './components/SiteAurora'

function App() {
  return (
    <>
      <ScrollToHash />
      {/* Base tint behind decorative layers; ribbons/site sit above this but below content (z-auto would cover −z overlays). */}
      <div className="pointer-events-none fixed inset-0 -z-30 bg-void" aria-hidden />
      <SiteAurora />
      <PolylineCursor />
      <div className="grain" aria-hidden />
      <div className="relative z-10 text-foam">
        <Navigation />
        <main>
          <Outlet />
        </main>
      </div>
    </>
  )
}

export default App
