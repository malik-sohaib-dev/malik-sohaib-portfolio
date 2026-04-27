type Props = { className?: string }

export function StaticHeroBackdrop({ className = '' }: Props) {
  return (
    <div
      className={`absolute inset-0 -z-10 ${className}`}
      aria-hidden
      style={{
        background:
          'radial-gradient(ellipse 120% 100% at 20% 0%, rgba(45,212,191,0.2) 0%, transparent 45%), radial-gradient(ellipse 90% 80% at 100% 20%, rgba(99,102,241,0.18) 0%, transparent 40%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(6,182,212,0.1) 0%, transparent 50%), #010409',
      }}
    />
  )
}
