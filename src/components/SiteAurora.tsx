/**
 * Sits behind all content. Subtle moving aurora + grid for depth (respects reduced motion in CSS).
 */
export function SiteAurora() {
  return (
    <div
      className="site-aurora-root pointer-events-none fixed inset-0 -z-20 overflow-hidden"
      aria-hidden
    >
      <div
        className="site-aurora-1 absolute -left-[20%] -top-[30%] h-[min(120vw,80rem)] w-[min(120vw,80rem)] rounded-full opacity-90"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in oklab, var(--color-aurora-a) 28%, transparent), transparent 70%)',
        }}
      />
      <div
        className="site-aurora-2 absolute -right-[25%] top-[20%] h-[min(100vw,70rem)] w-[min(100vw,70rem)] rounded-full opacity-80 [animation-delay:-8s]"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in oklab, var(--color-aurora-b) 22%, transparent), transparent 72%)',
        }}
      />
      <div
        className="site-aurora-3 absolute bottom-[-20%] left-1/3 h-[min(90vw,60rem)] w-[min(90vw,60rem)] -translate-x-1/2 rounded-full opacity-70 [animation-delay:-14s]"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in oklab, var(--color-aurora-c) 18%, transparent), transparent 75%)',
        }}
      />
      <div
        className="site-grid absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(color-mix(in oklab, var(--color-foam) 4%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in oklab, var(--color-foam) 4%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 80% 60% at 50% 20%, black, transparent 75%)',
        }}
      />
    </div>
  )
}
