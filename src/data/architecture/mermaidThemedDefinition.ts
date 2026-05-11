import type { ThemeId } from '../../theme/constants'

/** Removes a leading `%%{init: ... }%%` block if present. */
function stripMermaidInitDirective(raw: string): string {
  return raw.replace(/^\s*%%\{init:[\s\S]*?\}\}\s*%%\s*/m, '').trim()
}

/** Removes trailing `classDef` / `class` assignments so we can re-inject for the active theme. */
function stripMermaidClassDirectives(raw: string): string {
  return raw.replace(/\n\s*classDef[\s\S]*$/m, '').trim()
}

/** Normalized flowchart body only (no theme-specific init or classes). */
function mermaidFlowchartBodyOnly(raw: string): string {
  return stripMermaidClassDirectives(stripMermaidInitDirective(raw))
}

const INIT_DARK = `%%{init: {
  "theme": "base",
  "themeVariables": {
    "background": "#010409",
    "primaryColor": "#0a101f",
    "primaryTextColor": "#e2e8f0",
    "primaryBorderColor": "#2dd4bf",
    "lineColor": "#94a3b8",
    "secondaryColor": "#060b16",
    "tertiaryColor": "#060b16"
  }
}}%%`

const INIT_LIGHT = `%%{init: {
  "theme": "base",
  "themeVariables": {
    "background": "#f4f7fb",
    "primaryColor": "#ffffff",
    "primaryTextColor": "#0f172a",
    "primaryBorderColor": "#0d9488",
    "lineColor": "#475569",
    "secondaryColor": "#eef2f7",
    "tertiaryColor": "#e2e8f0"
  }
}}%%`

const CLASS_LAYER_DARK = `
  classDef client fill:#060b16,stroke:#2dd4bf,color:#e2e8f0
  classDef service fill:#0a101f,stroke:#2dd4bf,color:#e2e8f0
  classDef vendor fill:#060b16,stroke:#a78bfa,color:#e2e8f0
  classDef store fill:#0a101f,stroke:#94a3b8,color:#e2e8f0`

const CLASS_LAYER_LIGHT = `
  classDef client fill:#eef2f7,stroke:#0d9488,color:#0f172a
  classDef service fill:#ffffff,stroke:#0d9488,color:#0f172a
  classDef vendor fill:#f1f5f9,stroke:#7c3aed,color:#0f172a
  classDef store fill:#ffffff,stroke:#64748b,color:#0f172a`

const CLASS_ASSIGNMENTS = `
  class B1,B2 client
  class E,EX,DS,AD service
  class PH1,PH2 vendor
  class DB store`

/**
 * Full Mermaid source for render: portfolio-themed dark or light to match
 * `data-theme` on `document.documentElement`.
 */
export function buildThemedMermaidDefinition(body: string, theme: ThemeId): string {
  const core = mermaidFlowchartBodyOnly(body)
  const init = theme === 'light' ? INIT_LIGHT : INIT_DARK
  const classes =
    theme === 'light' ? CLASS_LAYER_LIGHT : CLASS_LAYER_DARK
  return `${init}\n${core}\n${classes}${CLASS_ASSIGNMENTS}`
}
