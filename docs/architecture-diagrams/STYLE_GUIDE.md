# Architecture diagram style guide

Use this guide for **all** portfolio/system architecture diagrams (Mermaid, exported SVG/PNG, or tools like Figma/Excalidraw) so visuals stay aligned with the site and with each other.

## 1. Purpose & audience

- **Goal:** Explain **trust boundaries**, **data flow**, and **ownership** (who calls whom, what owns state), not every micro-endpoint.
- **Reader:** Engineers and hiring managers skimming quickly; prefer **few words per node**, **one idea per box**.

## 2. Theme (canonical: dark)

Diagrams default to **dark**, matching the portfolio’s primary theme (`:root` in `src/index.css`).

| Token        | Role              | Hex       | Use                                      |
|-------------|-------------------|-----------|------------------------------------------|
| Void        | Canvas background | `#010409` | Outer background, diagram margins        |
| Ink         | Panel / swimlane  | `#060b16` | Group backgrounds, subgraphs             |
| Surface     | Node fill         | `#0a101f` | Primary rectangles, services             |
| Foam        | Primary text      | `#e2e8f0` | Titles, main labels                      |
| Mist        | Secondary text    | `#94a3b8` | Sub-labels, annotations, protocol names  |
| Accent      | Flow / emphasis   | `#2dd4bf` | Primary arrows, active path, borders    |
| Accent dim  | Secondary accent  | `#14b8a6` | Hover/alt emphasis (static diagrams)     |
| Iris        | External / vendor | `#a78bfa` | Third-party systems (e.g. Photon)        |
| Border      | Box stroke        | `rgb(255 255 255 / 0.1)` | Node outline              |

**Light exports** (slides, print): invert text/background using `[data-theme='light']` equivalents from the same CSS file (`--tp-void`, `--tp-foam`, `--tp-accent`, etc.), keeping **accent hue** recognizable.

## 3. Typography

Match `index.html` / site usage:

| Use              | Font                    | Weight   | Notes |
|------------------|-------------------------|----------|-------|
| Diagram title    | **Syne**                | 600–700  | One line; title case or sentence case |
| Section / lane   | **Outfit**              | 600      | Subgraph titles, swimlane headers     |
| Node labels      | **Outfit**              | 500–600  | Short phrases; avoid all-caps blocks  |
| Protocols, ports | **JetBrains Mono**      | 400–500  | `SSE`, `Channels`, `HTTP`, file names |

- **Max width:** ~24 characters per line inside a node where possible; wrap with `<br/>` in Mermaid only when needed.
- **Forbidden:** decorative emoji in production diagrams; tiny unreadable text.

## 4. Layout & block structure

1. **Primary direction:** **Top-to-bottom** (`flowchart TB`) for story flow (user → edge → core → data). Use **left-to-right** only for tight before/after comparisons.
2. **Swimlanes / subgraphs:** Named stages: e.g. `Clients`, `Application`, `Realtime vendor`, `Data`, `Platform`. One physical concern per lane.
3. **Spacing metaphor:** Consistent **grid of 8** (multiples of 8px) when drawing in Figma/Excalidraw; Mermaid handles spacing automatically—avoid huge nodes.
4. **Before/after:** Prefer **two stacked or side-by-side subgraphs** with clear titles (`Before — …`, `After — …`), not two separate files unless comparing entirely different systems.
5. **Legend:** Only if a symbol is non-obvious; otherwise rely on short edge labels (`SSE`, `Phoenix Channels`).

## 5. Node taxonomy (shapes)

Use the same semantics across diagrams:

| Shape / style        | Meaning |
|----------------------|---------|
| Rounded rectangle    | Service or app you own |
| Cylinder `[(...)]`    | Durable store (DB, blob, cache on disk) |
| Stadium / pill       | Client or browser surface |
| Hexagon (if tool)    | Optional: API gateway (rare) |
| Double-border        | Optional: existing system boundary (legacy) |

**External products** (SaaS, vendor realtime): use **Iris-bordered** or **accent-dim** stroke in manual tools; in Mermaid use `classDef` (see §8).

## 6. Connectors

- **Solid arrow `-->`:** Primary, synchronous or long-lived **intended** production path.
- **Dotted/dashed `-.->`:** Secondary, optional, or **legacy path being retired** (label explicitly).
- **Bidirectional `<-->`:** Only when both directions matter equally (e.g. SDK ↔ cloud); otherwise one-way + short label.
- **Labels:** Protocol or intent on the edge: `SSE`, `HTTP`, `Phoenix Channels`, `Photon protocol`, not vague `data`.

Avoid crossing lines; reorder nodes or use subgraphs first.

## 7. Copy style

- **Sentence case** for subgraph titles; **no marketing superlatives**.
- Prefer **concrete nouns** over vague “service layer”.
- **Numbers:** Allowed when they illustrate scale (e.g. connections per user); cite as **order-of-magnitude** if not exact (`~20–30 MB`, `2 SSEs / user`).
- **NDA:** No customer names, logos, or environment hostnames; say `AWS · GCP` not account IDs.

## 8. Mermaid (repo standard)

- **Live site:** Store **flowchart body only** (no `%%{init}` / no `classDef`) in `src/data/architecture/<project-slug>.mmd`. Register it in `src/data/architecture/index.ts`. At runtime, `src/data/architecture/mermaidThemedDefinition.ts` (`buildThemedMermaidDefinition`) prepends **`%%{init}%%` and `classDef` layers** for **`dark` and `light`** using the same hex roles as `src/index.css`. Toggle the site theme to verify both.
- **Docs / GitHub:** Example pages under `docs/architecture-diagrams/examples/` may include a **full** fenced diagram (init + classes) so previews render without the app; keep that in sync with the `.mmd` body when the graph changes.
- **File naming:** `docs/architecture-diagrams/examples/<slug>.md` with a single ` ```mermaid ` block (or leading `%%` config), so GitHub previews work.
- **Titles:** First line in the file is `# Title` (markdown outside the fence).
- **Subgraphs:** Quote titles with spaces: `subgraph id["Before — colocated datasync"]`.
- **Theming:** For consistent exports, prefer an `init` directive and shared `classDef`s:

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "background": "#010409",
    "primaryColor": "#0a101f",
    "primaryTextColor": "#e2e8f0",
    "primaryBorderColor": "#2dd4bf",
    "lineColor": "#94a3b8",
    "secondaryColor": "#060b16",
    "tertiaryColor": "#060b16",
    "fontFamily": "Outfit, ui-sans-serif, system-ui"
  }
}}%%
flowchart TB
  classDef client fill:#060b16,stroke:#2dd4bf,color:#e2e8f0
  classDef service fill:#0a101f,stroke:#2dd4bf,color:#e2e8f0
  classDef vendor fill:#060b16,stroke:#a78bfa,color:#e2e8f0
  classDef store fill:#0a101f,stroke:#94a3b8,color:#e2e8f0
```

Apply with: `class A,B client` etc.

- **Version:** Target Mermaid syntax supported by **GitHub-flavored markdown** (avoid bleeding-edge only features unless you also document render tool).

## 9. Exports (PNG / SVG)

- **Background:** `#010409` or transparent PNG only if the slide deck supplies its own void background.
- **Minimum width:** 1200px for hero slides; **2×** for retina.
- **Filename:** `<project-slug>-architecture-<variant>.png` (e.g. `photon-datasync-before-after.png`).

## 10. Checklist before merging a new diagram

- [ ] Subgraphs read in one pass (before/after or user → data).
- [ ] Every edge has a reason (protocol or dependency).
- [ ] Colors match §2; type matches §3.
- [ ] No confidential identifiers; NDA note in doc if needed.
- [ ] Linked from this folder or from the relevant case study in `src/data/content.ts` if you want the site to reference it later.

---

## Reference

- Site palette: `src/index.css` (`:root` and `[data-theme='light']`).
- Example applying this guide: `examples/photon-datasync-architecture.md`.
