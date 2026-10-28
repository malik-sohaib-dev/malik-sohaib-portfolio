# Malik Sohaib: portfolio

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
sh art/loops.sh           # the posters' three-second loops -> public/media/loops/
node art/ring.mjs         # the header ring's wobble sprite -> public/brand/ring-spin.webp
node art/og.mjs           # share cards -> public/og/*.jpg, and the home-screen icons
```

The portraits and the film need a Python environment in `art/out/venv` (see the top of
`art/wrapped/voice.py`; it holds Kokoro, faster-whisper and noisereduce):

```bash
art/out/venv/bin/python art/portrait.py <backlit.png> <coat.png>   # footer and About portraits
art/out/venv/bin/python art/wrapped/takes.py rec1.wav rec2.wav …   # narration from my recordings
art/out/venv/bin/python art/wrapped/sound.py                       # the sound bed, timed to it
node art/wrapped/render.mjs                                        # the film, 16:9 and 9:16 -> public/media/wrapped-*
```

The film on the site is the editorial collage (`art/wrapped/collage.html`). Two other directions are
kept as sources: the first reel (`index.html`) and the blueprint (`blueprint.html`); render either
by name (`node art/wrapped/render.mjs blueprint`).

## Deploy

Vercel builds it as an Astro project. `vercel.json` redirects the old `/projects/<slug>` URLs to
`/work/<slug>`.
