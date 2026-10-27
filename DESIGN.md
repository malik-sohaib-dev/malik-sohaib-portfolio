# Design notes: the Changelog portfolio

The plan for the 2026 rebuild. Later passes follow this file, and it changes when a decision does.

## Brief

- **Who:** Malik Sohaib Ahmad, full-stack and AI engineer in Pakistan. Senior Full Stack Engineer
  at Arthur (Germany, remote) since Nov 2023. Alongside the day job he has shipped his own
  products: EzVenda (commerce platform, live), Mini Havoc (multiplayer party games, live) and
  GymPaid (gym memberships, in hand-over).
- **Audience, in order:** (1) international clients (startups and small businesses in the US,
  UK, EU and Gulf) who want a product built; (2) hiring managers, who get this link next to his
  résumé.
- **The site's job:** a client emails or WhatsApps him about a project. Second job: a hiring
  manager finds the résumé and the depth of the engineering in under a minute.
- **Contact:** email `maliksohaib.official@gmail.com`, WhatsApp `+92 305 4990819`. Résumé on
  Google Drive. Same names for the actions everywhere: "Email me", "WhatsApp".
- **Domain:** `https://maliksohaib.com` (canonical, OG, sitemap). Hosted on Vercel.
- **Constraints from the owner:**
  - Fast and light. The old site shipped 1.6 MB (a 928 KB Three.js blob) and rendered an empty
    `<div id="root">` to crawlers. Budget here: home under 150 KB before media, all content in
    the HTML, no third-party requests at all (fonts self-hosted).
  - Mobile first, composed for 390 px.
  - Never say where or how the products are hosted. Specs and stats are fine.
- **Lessons from the owner's reference reels:**
  - About pages convert when they show a real face, a real story and specifics. So: a portrait
    and a first-person account of how he works.
  - Scannable grids with big cards on mobile beat clever layouts. So: the work index is plain
    and large on phones.
  - Bold display type and a hard "let's talk" ending. Yes. 3D carousels, liquid glass and
    shader blobs: no, they are the weight the owner wants gone.

## Concept card

The owner asked for a combination of three concepts (one box, decision log, 90 days), without
the one-box hosting story. The combination is one idea: a changelog.

```
Idea:        Every product I ship, shown the way I built it: day by day, decision by decision.
Metaphor:    a release log. Commits are the days, decisions are the entries, products are releases.
Signature:   the commit strip. A bar chart of real commits per day since 30 Jul 2026, drawn from
             git. On load the bars rise and a playhead runs the 90 days while the counter ticks
             to the total and each product tag snaps onto the day it began. Afterwards the
             visitor scrubs it with pointer or finger to read any day.
Emotion:     first 3 seconds: "this person ships, a lot, and on purpose".
Motion verb: snap like a merge. Short, decisive, lands without bounce (expo out). Things rise
             from a baseline, tick, and lock.
Screenshot:  the hero: the statement in huge condensed type over the strip, with the tags
             "EzVenda · 30 Jul", "Mini Havoc · 24 Sep", "GymPaid · 2 days".
```

Anchors (facts only true of him): the commit history of three private repos; numbered decision
logs (EzVenda has 305 entries in DECISIONS.md, GymPaid 48); the dates (EzVenda started 30 Jul,
Mini Havoc 24 Sep, GymPaid built against a two-day deadline on 26 to 28 Sep).

How the idea reaches every page:
- **Home hero:** the full strip.
- **Work index:** each product card carries its own slice of the strip.
- **Case study:** the hero is that product's strip, and the decisions are pinned to it.
- **Day job (Arthur):** NDA work has no public commits, so it is a single long bar from Nov 2023
  to now, labelled "Day job". This is honest: no invented data.
- **404:** "No commits on this page." with an empty strip and a way home.
- **Footer:** "Next commit: yours." with the contact actions.

Numbers: all strip data comes from `scripts/commits.mjs`, which reads the local repos (they are
private, so Vercel can't) and writes `src/data/commits.json`. Non-merge commits on all branches
by the owner. Re-run it before deploying to refresh.

## Art direction

**Archetype:** Swiss index mutated toward a release log: one paper ground, ink, one signal colour
that means "the thing you are looking at".

**Palette**

| Role | Hex | Use |
|---|---|---|
| ground | `#F0F0EC` | page (cool paper, low chroma, not cream) |
| ink | `#111110` | text, bars, primary buttons |
| muted | `#5C5C57` | secondary text (AA on ground, 5.9:1) |
| line | `rgba(17,17,16,.14)` | hairlines, the strip baseline |
| signal | `#FF5A1F` | fills only: the playhead, the highlighted product's bars, button floods. Ink text on signal is 6.1:1; signal on ground is 2.7:1, so never text in signal. |
| night | `#111110` / `#F0F0EC` | the finale footer inverts |

**Type**

- Display and numerals: **Big Shoulders** (Google, OFL), condensed and industrial, 800 to 900.
  Its numerals make the stats and dates the image. Uppercase is designed for it.
- Text and UI: **Host Grotesk** (Google, OFL), 400 and 600.
- No mono: data uses Big Shoulders tabular figures. That avoids the "mono label everywhere" tell.
- Scale: `--t-mega clamp(4.5rem, 1rem + 15vw, 15rem)` with line-height 0.82, tracking -0.01em
  (the face is already condensed, so it needs less negative tracking than a grotesk);
  `--t-xl clamp(3rem, 1.5rem + 6vw, 7rem)`; body 17 to 18 px with 1.5 leading.

**Grid and rhythm**

- 12 columns desktop, 4 on phones, gutter `clamp(16px, 2.5vw, 32px)`. Hang text from columns 1, 5
  and 9.
- Section moods: hero full viewport; work airy; services tight; decisions normal; finale full.

**Shape:** 0 radius on cards and media; buttons are 999 px pills (the one round thing, so the
actions read at a glance).

**Motion language**

- Ease `cubic-bezier(0.16, 1, 0.3, 1)` (expo out) for everything. 240 ms small things, 600 ms
  blocks, 900 ms the strip. Stagger 8 ms per bar, 40 ms per text line.
- Animate transform, opacity and clip-path only.
- **Engine decision:** no GSAP, no Lenis. The owner's top complaint is weight, and nothing here
  needs a timeline library. One clock (`src/motion/clock.ts`, a single rAF that only runs while
  something is animating) drives the strip and counters; IntersectionObserver drives reveals;
  page transitions use Astro's ClientRouter with the native View Transitions API (the product
  card's strip slice morphs into the case-study hero). Native scrolling, no smooth-scroll.
- **Idle:** the playhead rests on today and breathes (the today bar's top pulses 2 px, every 2.4 s),
  so the concept is alive at rest. Off under reduced motion.
- **Hover treatments (one per role):**
  - Primary buttons: signal floods up from the baseline under the label, arrow travels.
  - Product cards: their bars on the strip turn signal; media lifts 6 px.
  - Nav links: underline draws left to right.
  - Utility links: colour only.
- **Reduced motion:** strip is drawn complete, counter shows the total, no playhead run, no
  reveals, view transitions off.

## Composition (home)

```
1 HERO · poster + strip (full viewport)
  ┌──────────────────────────────────────────────────────┐
  │ Sohaib Malik              Work  Services  About  Résumé│
  │                                                      │
  │ I BUILD WHOLE                                         │
  │ PRODUCTS.                     [Email me] [WhatsApp]   │
  │ App, backend, AI and launch, for teams anywhere.     │
  │                                                      │
  │ ▁▂▅▇▃▂▆█▇▅▃▂▁▃▅▇██▇▆▅▄▃▅▆▇█▆▅▃▂▅▇▆▄▁▂  1,720 commits │
  │ ^EzVenda 30 Jul        ^Mini Havoc 24 Sep ^GymPaid    │
  └──────────────────────────────────────────────────────┘
2 WORK · stacked releases (one product per band, alternating media side)
3 SERVICES · index list (4 rows: what I build, for whom, a real example)
4 HOW I WORK · statement + three real decisions as log entries
5 DAY JOB · Arthur, one long bar + 3 case-study rows
6 ABOUT · portrait (slot) + bio + testimonials
7 FINALE · night footer: "Next commit: yours." + Email me / WhatsApp / Résumé
```

Phones: hero statement re-tuned to fit 4 columns, the strip spans the full width (90 bars at
about 3 px), scrubbing by touch-drag; work bands become single-column cards with large media.

## Genericness test

- "Dark dev portfolio with a terminal": rejected, light paper plus a condensed poster face instead.
- "Big gradient name": the name is small; the statement and the data are the image.
- "Three equal service cards": services are an index list with real examples.
- "Stats row of years and stacks": every number on the site is from git, a test suite or a load test.
