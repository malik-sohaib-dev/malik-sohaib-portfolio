/** Aurora palette — matches the site’s `--tp-*` tokens. */
const palette = {
  foam: '#f1f5f9',
  accent: '#2dd4bf',
  accentDim: '#14b8a6',
  accentDeep: '#0d9488',
  glow: '#38bdf8',
  iris: '#7c3aed',
  irisDeep: '#5b21b6',
  mist: '#94a3b8',
} as const

/** Layered offsets read as depth in DevTools — teal → cyan → violet. */
const extrudeShadow = [
  `1px 1px 0 ${palette.accent}`,
  `2px 2px 0 ${palette.accentDim}`,
  `3px 3px 0 ${palette.accentDeep}`,
  `4px 4px 0 ${palette.glow}`,
  `5px 5px 0 #6366f1`,
  `6px 6px 0 ${palette.iris}`,
  `7px 7px 0 ${palette.irisDeep}`,
].join(', ')

/** Figlet “standard” — stacked for readability. */
const asciiName = `
  ____        _           _ _     
 / ___|  ___ | |__   __ _(_) |__  
 \\___ \\ / _ \\| '_ \\ / _\` | | '_ \\ 
  ___) | (_) | | | | (_| | | |_) |
 |____/ \\___/|_| |_|\\__,_|_|_.__/ 

    _    _                         _ 
   / \\  | |__  _ __ ___   __ _  __| |
  / _ \\ | '_ \\| '_ \` _ \\ / _\` |/ _\` |
 / ___ \\| | | | | | | | | (_| | (_| |
/_/   \\_\\_| |_|_| |_| |_|\\__,_|\\__,_|
`.trimEnd()

/**
 * DevTools easter egg — 3D ASCII banner + one line. Runs once from main.tsx.
 */
export function logConsoleWelcome(): void {
  console.log(
    '%c\n' +
      asciiName +
      '\n\n%c' +
      'Curiosity is its own kind of compass.',
    `
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      line-height: 1.22;
      font-weight: 600;
      color: ${palette.foam};
      letter-spacing: 0.02em;
      -webkit-font-smoothing: antialiased;
      text-shadow: ${extrudeShadow};
      padding: 4px 8px 6px 0;
    `,
    `
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 15px;
      font-weight: 400;
      line-height: 1.5;
      color: ${palette.mist};
      letter-spacing: 0.01em;
      padding-top: 4px;
    `,
  )
}
