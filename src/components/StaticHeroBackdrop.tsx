type Props = { className?: string }

export function StaticHeroBackdrop({ className = '' }: Props) {
  return (
    <div
      className={`static-hero-backdrop absolute inset-0 -z-10 ${className}`}
      aria-hidden
    />
  )
}
