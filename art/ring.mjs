// Renders the header mark's wobble (art/blender/ring.py) and packs it into a sprite strip.
//   node art/ring.mjs [path/to/Blender]   -> public/brand/ring-spin.webp (48 frames of 52px, shown at 26px)
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const blender = process.argv[2] ?? '/Applications/Blender.app/Contents/MacOS/Blender';
const out = path.join(root, 'art/out/ring');
const S = 52;
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
execFileSync(blender, ['-b', '--factory-startup', '-P', path.join(root, 'art/blender/ring.py'), '--', path.join(out, 'r'), '64', '48'], { stdio: 'ignore' });

const files = readdirSync(out).filter((f) => f.endsWith('.png')).sort();
const frames = await Promise.all(files.map((f) => sharp(path.join(out, f)).resize(S, S).toBuffer()));
const info = await sharp({ create: { width: S * frames.length, height: S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite(frames.map((input, i) => ({ input, left: i * S, top: 0 })))
  .webp({ quality: 70, alphaQuality: 80, effort: 6 })
  .toFile(path.join(root, 'public/brand/ring-spin.webp'));
console.log(`ring: ${frames.length} frames, ${info.size} bytes`);
