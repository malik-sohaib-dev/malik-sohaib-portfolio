# Sohaib Malik: portfolio

The personal site of Malik Sohaib Ahmad, full-stack and AI engineer. Static Astro, no
animation libraries, about 400 KB for the home page including images.

Design decisions are in [DESIGN.md](DESIGN.md).

## Run

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check and build to dist/
npm run preview   # serve the build
```

## Refresh the data and art

These run on my machine, not on Vercel (they need private repos, GitHub logins or Blender):

```bash
npm run activity          # GitHub contributions from both accounts -> src/data/activity.json
sh art/posters.sh         # Blender poster scenes -> src/assets/posters/*-art.webp
node art/og.mjs           # share card -> public/og.png
```

## Deploy

Vercel builds it as an Astro project. `vercel.json` redirects the old `/projects/<slug>` URLs to
`/work/<slug>`.
