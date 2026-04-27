import { type ReactNode, useRef } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

/**
 * 3D tilt on hover (CSS perspective) — Awwards-style card depth without extra WebGL.
 */
export function TiltCard({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.setProperty('--tilt-y', String(x * 14))
    ref.current.style.setProperty('--tilt-x', String(-y * 10))
  }

  const onLeave = () => {
    if (!ref.current) return
    ref.current.style.setProperty('--tilt-x', '0')
    ref.current.style.setProperty('--tilt-y', '0')
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        transform:
          'perspective(1000px) rotateX(calc(var(--tilt-x, 0) * 1deg)) rotateY(calc(var(--tilt-y, 0) * 1deg))',
        transition: 'transform 0.1s ease-out',
      }}
    >
      {children}
    </div>
  )
}
