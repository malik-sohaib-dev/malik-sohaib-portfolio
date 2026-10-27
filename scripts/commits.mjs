#!/usr/bin/env node
// Writes src/data/commits.json: commits per day for each product, from the local git repos.
// The repos are private, so this runs on my machine, not on Vercel. Re-run before a deploy.
//   node scripts/commits.mjs [--root ~/Personal] [--to YYYY-MM-DD]
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i > -1 ? args[i + 1] : d;
};
const root = opt('root', path.join(homedir(), 'Personal'));
const to = opt('to', new Date().toISOString().slice(0, 10));
const from = '2026-07-30'; // EzVenda's first commit

// Every address I have committed from. Commits by anyone else are left out.
const authors = ['asohaib575@gmail.com', 'sohaib@arthur.digital', 'maliksohaib.official@gmail.com'];
const products = [
  { slug: 'ezvenda', repo: 'EzVenda' },
  { slug: 'mini-havoc', repo: 'brain-clash' },
  { slug: 'gympaid', repo: 'gympaid' },
];

const days = [];
for (let d = new Date(`${from}T00:00:00Z`); d <= new Date(`${to}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
  days.push(d.toISOString().slice(0, 10));
}
const index = new Map(days.map((d, i) => [d, i]));

const series = {};
for (const p of products) {
  // Non-merge commits on every branch, deduplicated by hash (a commit on two branches counts once).
  const out = execFileSync('git', ['-C', path.join(root, p.repo), 'log', '--all', '--no-merges', '--format=%H %ae %ad', '--date=short'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const seen = new Set();
  const counts = new Array(days.length).fill(0);
  for (const line of out.trim().split('\n')) {
    const [hash, email, day] = line.split(' ');
    if (seen.has(hash) || !authors.includes(email) || !index.has(day)) continue;
    seen.add(hash);
    counts[index.get(day)]++;
  }
  series[p.slug] = counts;
}

const total = Object.values(series).flat().reduce((a, b) => a + b, 0);
const data = { from, to, days: days.length, total, series };
const file = path.resolve('src/data/commits.json');
writeFileSync(file, `${JSON.stringify(data)}\n`);
console.log(`${file}: ${days.length} days, ${total} commits`, Object.fromEntries(Object.entries(series).map(([k, v]) => [k, v.reduce((a, b) => a + b, 0)])));
