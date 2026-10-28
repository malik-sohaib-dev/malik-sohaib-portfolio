#!/usr/bin/env node
// Writes src/data/activity.json: contributions per day, both GitHub accounts merged (personal and
// work), private contributions included. Only the daily counts are stored: no repo or org names.
// Needs `gh` logged in to both accounts. Re-run before a deploy.
//   node scripts/activity.mjs [--from 2024-01-01] [--to YYYY-MM-DD]
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i > -1 ? args[i + 1] : d;
};
const from = opt('from', '2024-01-01');
const to = opt('to', new Date().toISOString().slice(0, 10));
const accounts = ['malik-sohaib-dev', 'its-sohaib'];

const counts = new Map();
for (const login of accounts) {
  const token = execFileSync('gh', ['auth', 'token', '-u', login], { encoding: 'utf8' }).trim();
  // The API caps a contributions window at one year, so ask year by year.
  for (let y = +from.slice(0, 4); y <= +to.slice(0, 4); y++) {
    const query = `query { viewer { contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") { contributionCalendar { weeks { contributionDays { date contributionCount } } } } } }`;
    const out = execFileSync('gh', ['api', 'graphql', '-f', `query=${query}`], {
      encoding: 'utf8',
      env: { ...process.env, GH_TOKEN: token },
    });
    const weeks = JSON.parse(out).data.viewer.contributionsCollection.contributionCalendar.weeks;
    for (const w of weeks) for (const d of w.contributionDays) counts.set(d.date, (counts.get(d.date) ?? 0) + d.contributionCount);
  }
}

const days = [];
for (let d = new Date(`${from}T00:00:00Z`); d <= new Date(`${to}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
  days.push(counts.get(d.toISOString().slice(0, 10)) ?? 0);
}
const total = days.reduce((a, b) => a + b, 0);
const file = path.resolve('src/data/activity.json');
writeFileSync(file, `${JSON.stringify({ from, to, total, days })}\n`);
console.log(`${file}: ${days.length} days, ${total} contributions`);
