/** Emerald gradient — mirrors `from-emerald-400 via-emerald-200 to-zinc-300`. */
const emeraldGradient = [
  '#34d399',
  '#3ecf9a',
  '#52d9a8',
  '#6ee7b7',
  '#7eedc0',
  '#94f0c9',
  '#a7f3d0',
  '#b8ead8',
  '#c8e0e0',
  '#d0d8d8',
  '#d4d4d8',
  '#d4d4d8',
] as const

/** Figlet “ANSI Shadow” — Malik Sohaib. */
const asciiLines = [
  '███╗   ███╗ █████╗ ██╗     ██╗██╗  ██╗',
  '████╗ ████║██╔══██╗██║     ██║██║ ██╔╝',
  '██╔████╔██║███████║██║     ██║█████╔╝ ',
  '██║╚██╔╝██║██╔══██║██║     ██║██╔═██╗ ',
  '██║ ╚═╝ ██║██║  ██║███████╗██║██║  ██╗',
  '╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═╝',
  '███████╗ ██████╗ ██╗  ██╗ █████╗ ██╗██████╗ ',
  '██╔════╝██╔═══██╗██║  ██║██╔══██╗██║██╔══██╗',
  '███████╗██║   ██║███████║███████║██║██████╔╝',
  '╚════██║██║   ██║██╔══██║██╔══██║██║██╔══██╗',
  '███████║╚██████╔╝██║  ██║██║  ██║██║██████╔╝',
  '╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═════╝ ',
] as const

const mono =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'

type StyledLine = { text: string; style: string }

function monoStyle(
  color: string,
  opts: { size?: number; weight?: number; spacing?: string; lineHeight?: number } = {},
): string {
  const { size = 10, weight = 400, spacing = '0.01em', lineHeight = 1.55 } = opts
  return [
    `font-family: ${mono}`,
    `font-size: ${size}px`,
    `line-height: ${lineHeight}`,
    `font-weight: ${weight}`,
    `color: ${color}`,
    `letter-spacing: ${spacing}`,
    '-webkit-font-smoothing: antialiased',
  ].join('; ')
}

/** Top frame — marks entry into the hidden layer. */
const openingDivider: StyledLine[] = [
  {
    text: '╭─ ░▒▓ ─────────────────────────────────── ▓▒░ ─╮',
    style: monoStyle('#34d399', { weight: 500, lineHeight: 1.4 }),
  },
  {
    text: '│      ◈  devtools · hidden layer  ◈        │',
    style: monoStyle('#2dd4bf', { size: 11, weight: 600, spacing: '0.1em', lineHeight: 1.45 }),
  },
  {
    text: '╰─ ░▒▓ ─────────────────────────────────── ▓▒░ ─╯',
    style: monoStyle('#34d399', { weight: 500, lineHeight: 1.4 }),
  },
]

/** Bottom frame — closes the section. */
const closingDivider: StyledLine[] = [
  {
    text: '┏━ ◆ ───────────────────────────────────── ◆ ━┓',
    style: monoStyle('#52525b', { weight: 500, lineHeight: 1.4 }),
  },
  {
    text: '┃           end of transmission               ┃',
    style: monoStyle('#71717a', { size: 10, weight: 500, spacing: '0.12em', lineHeight: 1.45 }),
  },
  {
    text: '┗━ ◆ ───────────────────────────────────── ◆ ━┛',
    style: monoStyle('#52525b', { weight: 500, lineHeight: 1.4 }),
  },
]

const footerLines: StyledLine[] = [
  {
    text: '◆ achievement unlocked console spelunker',
    style: monoStyle('#2dd4bf', { size: 11, weight: 600, spacing: '0.06em', lineHeight: 1.6 }),
  },
  {
    text: 'You dig deeper than most visitors.',
    style: monoStyle('#a1a1aa', { size: 11, weight: 500, lineHeight: 1.65 }),
  },
  {
    text: "For that, here's your reward:",
    style: monoStyle('#71717a', { weight: 600, spacing: '0.08em', lineHeight: 1.65 }),
  },
  {
    text: '  → polyline cursor | desktop only, GPU gated',
    style: monoStyle('#52525b'),
  },
  {
    text: '  → hero WebGL silently falls back on low spec hardware',
    style: monoStyle('#52525b'),
  },
  {
    text: '  → case study diagrams are live mermaid (.mmd) under the hood',
    style: monoStyle('#52525b'),
  },
  {
    text: 'Neat console trick:',
    style: monoStyle('#71717a', { weight: 600, spacing: '0.08em', lineHeight: 1.65 }),
  },
  {
    text: "  document.documentElement.dataset.theme = 'light'",
    style: monoStyle('#a7f3d0', { weight: 500 }),
  },
]

function asciiStyle(color: string): string {
  return monoStyle(color, { weight: 600, lineHeight: 1.1 })
}

/**
 * DevTools easter egg — block ASCII banner + hidden-layer hints. Runs once from main.tsx.
 */
export function logConsoleWelcome(): void {
  const asciiStyled = asciiLines.map((text, i) => ({
    text,
    style: asciiStyle(emeraldGradient[i] ?? emeraldGradient.at(-1)!),
  }))

  const body: StyledLine[] = [
    ...openingDivider,
    { text: '', style: monoStyle('#3f3f46', { lineHeight: 1.2 }) },
    ...asciiStyled,
    { text: '', style: monoStyle('#3f3f46', { lineHeight: 1.2 }) },
    ...footerLines,
    { text: '', style: monoStyle('#3f3f46', { lineHeight: 1.2 }) },
    ...closingDivider,
  ]

  const format = body.map(({ text }) => `%c${text}`).join('\n')

  console.log(
    format,
    ...body.map(({ style }) => style),
  )
}
