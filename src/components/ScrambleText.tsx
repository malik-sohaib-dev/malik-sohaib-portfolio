import { useEffect, useMemo, useState } from 'react'

const GLYPHS = '&%@#*^$)[]{}!?<>~|/\\;:'

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!
}

function scramblePreserveSpaces(target: string) {
  let out = ''
  for (const c of target) {
    out += c === ' ' ? ' ' : randomGlyph()
  }
  return out
}

function withLockedPrefix(target: string, lockedNonSpaceCount: number) {
  let locked = 0
  let out = ''
  for (const c of target) {
    if (c === ' ') {
      out += ' '
      continue
    }
    if (locked < lockedNonSpaceCount) {
      out += c
      locked++
    } else {
      out += randomGlyph()
    }
  }
  return out
}

function countNonSpace(s: string) {
  let n = 0
  for (const c of s) {
    if (c !== ' ') n++
  }
  return n
}

type ScrambleTextProps = {
  text: string
  /** ms before the first scramble (align with staggered hero reveal). */
  startDelayMs?: number
  /**
   * Scramble “rolling” speed: minimum ms between full-line glyph reshuffles.
   * Higher = slower, calmer roll; lower = frantic.
   */
  scrambleRollIntervalMs?: number
  /**
   * How long the scramble phase runs before reveal starts.
   * When omitted, scales with `scrambleRollIntervalMs` so a slower roll also runs a bit longer.
   */
  scramblePhaseMs?: number
  /** Reveal speed: ms for the full left-to-right decode. Lower = snappier (usually well below scramble phase). */
  revealMs?: number
  /** ms to hold final text before looping again. */
  loopRestMs?: number
}

/**
 * Glitch-style decode on a rAF timeline; loops after `loopRestMs`.
 * Mount only when motion is allowed; otherwise render `text` in the parent.
 */
export function ScrambleText({
  text,
  startDelayMs = 380,
  scrambleRollIntervalMs = 54,
  scramblePhaseMs: scramblePhaseMsProp,
  revealMs = 115,
  loopRestMs = 5200,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(() => scramblePreserveSpaces(text))

  const scramblePhaseMs = useMemo(
    () =>
      scramblePhaseMsProp ??
      Math.max(420, Math.round(scrambleRollIntervalMs * 8)),
    [scramblePhaseMsProp, scrambleRollIntervalMs]
  )

  useEffect(() => {
    let cancelled = false
    let rafId = 0
    let loopTimeoutId: ReturnType<typeof setTimeout> | undefined
    const nonSpace = countNonSpace(text)

    const runCycle = () => {
      const phaseStart = performance.now()
      let lastScrambleTick = 0
      let prevLockCount = -1

      const scheduleNextLoop = () => {
        setDisplay(text)
        if (cancelled) return
        loopTimeoutId = window.setTimeout(() => {
          if (cancelled) return
          setDisplay(scramblePreserveSpaces(text))
          runCycle()
        }, loopRestMs)
      }

      const frame = (now: number) => {
        if (cancelled) return

        const elapsed = now - phaseStart

        if (elapsed < scramblePhaseMs) {
          if (now - lastScrambleTick >= scrambleRollIntervalMs) {
            lastScrambleTick = now
            setDisplay(scramblePreserveSpaces(text))
          }
          rafId = requestAnimationFrame(frame)
          return
        }

        if (nonSpace === 0) {
          scheduleNextLoop()
          return
        }

        const revealElapsed = elapsed - scramblePhaseMs
        if (revealElapsed < revealMs) {
          const lockCount = Math.min(
            nonSpace,
            Math.max(1, Math.ceil((revealElapsed / revealMs) * nonSpace))
          )
          if (lockCount !== prevLockCount) {
            prevLockCount = lockCount
            setDisplay(withLockedPrefix(text, lockCount))
          }
          if (lockCount >= nonSpace) {
            scheduleNextLoop()
            return
          }
          rafId = requestAnimationFrame(frame)
          return
        }

        scheduleNextLoop()
      }

      rafId = requestAnimationFrame(frame)
    }

    const waitId = window.setTimeout(() => {
      if (cancelled) return
      setDisplay(scramblePreserveSpaces(text))
      runCycle()
    }, startDelayMs)

    return () => {
      cancelled = true
      window.clearTimeout(waitId)
      if (loopTimeoutId !== undefined) window.clearTimeout(loopTimeoutId)
      cancelAnimationFrame(rafId)
    }
  }, [
    text,
    startDelayMs,
    scrambleRollIntervalMs,
    scramblePhaseMs,
    revealMs,
    loopRestMs,
  ])

  return display
}
