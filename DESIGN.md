# Design notes

The plan for the 2026 rebuild. Later passes follow this file, and it changes when a decision does.

## Brief

- **Who:** Malik Sohaib Ahmad ("Sohaib Malik"), full-stack and AI engineer in Pakistan. Senior
  Full Stack Engineer at Arthur (Germany, remote) since Nov 2023. Before that BH Group (Lahore)
  and Council for Education (US, remote). In 2026 he built three products of his own: EzVenda
  (live), Mini Havoc (live) and GymPaid (in hand-over).
- **The person is the product.** Clients and companies hire him, not the projects. Projects are
  evidence of how he works.
- **Audience, in order:** international clients who want a product built; hiring managers, who
  get this link next to his résumé.
- **The site's job:** a client emails or WhatsApps him. Same action names everywhere: "Email me",
  "WhatsApp".
- **Domain:** `https://maliksohaib.com`, hosted on Vercel.
- **Owner's constraints:**
  - Light and fast (the old site shipped 1.6 MB, a 928 KB Three.js blob, and an empty HTML shell).
    All content in the HTML, no third-party requests, fonts self-hosted.
  - Mobile first, composed for 390 px.
  - Never say where or how the products are hosted. Specs and stats are fine.
  - Activity data merges the personal and work GitHub accounts; counts only, never repo names.
  - No live clock or city.

## Concept

**Who I am, then the proof, in liquid chrome.** The site leads with the person (name at poster
scale, portrait, role), shows the path (a career timeline that zooms from 2022 into the last
months), the consistency (a GitHub-style contribution grid), and then the work as posters: each
project gets a liquid-chrome object rendered in Blender, over grayscale art, with real type. Hovering
a poster floods in the real product from the pointer, like a drop landing. Case studies are decision
logs: what was chosen, over what, and why.

- **Signature moments:**
  - The Path zoom: one value (the visible window) places every year, month, span and label; a
    ghost year behind counts up and grows as you zoom.
  - The poster reveal: clip-path circle from the pointer; over a product the chrome evaporates.
  - The index menu: an orange panel wipes down, words rise in turn, the hovered link previews its poster.
- **Motion verb:** pour and settle. Things rise from a mask and land on an expo-out ease; the chrome
  objects read as poured metal.

## Art direction

**Palette**

| Role | Hex | Use |
|---|---|---|
| paper | `#F0F0EC` | ground of the paper chapters |
| ink | `#111110` | text; ground of the ink chapters |
| muted | `#5C5C57` on paper, `#A9A9A2` on ink | secondary text (AA in both) |
| signal | `#FF5A1F` | the menu, the client chapter, button floods, markers. Never text on paper (2.7:1). |

**Chapter fields.** Each section declares `data-field` (paper, ink, signal). The section crossing
the middle of the screen sets the field on `<html>`, and every colour reads the field's variables,
which are registered with `@property` so the whole page cross-fades. Without JS each section paints
its own field.

**Type:** Big Shoulders (display, numerals, uppercase) and Host Grotesk (text), both variable and
self-hosted. No mono.

**Posters:** 4:5, one subject, chrome object upper, title lower-left, captions in the same four
corners, a thin inset frame. Dark posters use the project's own renders in grayscale with a baked
water warp (`art/warp.mjs`); light posters sit on a grey studio ground. Chrome objects come from
`art/blender/chrome.py` via `art/render.sh`:

| Poster | Object | Why |
|---|---|---|
| EzVenda | "Rs" | rupees, commerce |
| Mini Havoc | a bean | the game's cast |
| GymPaid | "31" | the anchor-day rule: the 31st stays the 31st |
| Photon to Elixir | drops falling into one | many streams become one channel |
| Arthur Vibe | "?" | an AI that asks the questions |
| PV Smith | "kW" | solar |
| 404 | "404" | melted |

**Motion:** expo-out ease (`cubic-bezier(0.16, 1, 0.3, 1)`). No GSAP or Lenis: one rAF clock
(`src/motion/clock.ts`) that runs only while something animates, IntersectionObserver for reveals
and fields, View Transitions (Astro ClientRouter) to morph a poster into its case page.

**Hover treatments (one per role):** buttons flood from the baseline with the arrow travelling;
posters reveal the product; menu links slide and the others dim; inline and nav links draw an
underline; utility links change colour.

**Cursor:** a disc that appears only over things you can act on and names the action (View,
Visit, Open, Copy, Write). The system cursor stays visible; fine pointers only.

**Reduced motion:** no zoom pin (the timeline shows the whole career with buttons to zoom), no
reveals, no marquee, no view-transition morph, the cursor jumps instead of trailing.

## Pages

- `/`: hero (name, portrait, role, facts), Path, contribution grid, Owned end to end (product
  posters with stats), With teams (companies with case posters), For clients and for fun.
- `/about`: hello and portrait, bio, How I work (rows swap posters), stack tiles, testimonials,
  email marquee.
- `/work/<slug>`: case studies as decision logs. `/projects/<slug>` redirects here.
- `/404`.

## Data

- `scripts/activity.mjs` writes `src/data/activity.json` from both GitHub accounts (run locally).
- All copy lives in `src/data/site.ts`, `src/data/posters.ts` and `src/data/cases.ts`; numbers
  carry their source in a comment.
