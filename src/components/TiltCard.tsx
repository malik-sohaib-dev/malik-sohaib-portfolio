import { type ReactNode, useRef } from 'react'
import { useLgDown } from '../hooks/useMediaQuery'

type Props = {
  children: ReactNode
  className?: string
}

/**
 * 3D tilt on hover — disabled below `lg` to avoid extra compositing and pointer work on touch devices.
 */
export function TiltCard({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const lgDown = useLgDown()

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

  if (lgDown) {
    return <div className={className}>{children}</div>
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
