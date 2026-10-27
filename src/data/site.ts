// Every visible string on the site lives here.
// Numbers come from the repos (sources in the comments), never rounded up.
import commits from './commits.json';

export const site = {
  name: 'Sohaib Malik',
  fullName: 'Malik Sohaib Ahmad',
  role: 'Full-stack and AI engineer',
  url: 'https://maliksohaib.com',
  description:
    'Sohaib Malik builds whole products for startups and small businesses: web apps, online stores, real-time games and AI agents, from first commit to launch.',
  email: 'maliksohaib.official@gmail.com',
  whatsapp: { label: '+92 305 4990819', href: 'https://wa.me/923054990819' },
  resume: 'https://drive.google.com/file/d/1GkmXoQbUvw-G0CaTWXMAeeqX4GtFjBji/view?usp=sharing',
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/malik-sohaib' },
    { label: 'GitHub', href: 'https://github.com/malik-sohaib-dev' },
  ],
  location: 'Pakistan, working remotely with teams worldwide',
} as const;

export const nav = [
  { label: 'Work', href: '/#work' },
  { label: 'Services', href: '/#services' },
  { label: 'About', href: '/#about' },
] as const;

export const hero = {
  title: 'I build whole products.',
  lede: 'Full-stack and AI engineer. Web apps, online stores, real-time games and AI agents, from the first commit to launch.',
  stripCaption: 'on three products I built on my own',
} as const;

export type Status = 'Live' | 'In hand-over';

export type Product = {
  slug: string;
  name: string;
  /** Index into commits.json's day list, for the tag on the strip. */
  started: string;
  status: Status;
  url?: string;
  urlLabel?: string;
  /** One sentence: what it is and who it's for. */
  summary: string;
  /** The tag that snaps onto the strip. */
  tag: string;
  stats: { value: string; label: string }[];
  stack: string[];
  media: { kind: 'video' | 'image'; src: string; poster?: string; alt: string };
};

export const products: Product[] = [
  {
    slug: 'ezvenda',
    name: 'EzVenda',
    started: '2026-07-30',
    status: 'Live',
    url: 'https://ezvenda.com',
    urlLabel: 'ezvenda.com',
    summary:
      'A commerce platform for small merchants in Pakistan: a hosted shop with cash on delivery, custom domains, ad tracking, and an MCP server so an AI assistant can build the shop for you.',
    tag: 'EzVenda',
    stats: [
      { value: '51', label: 'screens across merchant, shop and admin' }, // HANDOVER: M1 = 51 screens
      { value: '39', label: 'tools an AI assistant can use (MCP)' }, // apps/api/src/modules/agents/mcp
      { value: '305', label: 'written engineering decisions' }, // DECISIONS.md, ### D- headings
    ],
    stack: ['TypeScript', 'Fastify', 'Postgres', 'React', 'Astro', 'BullMQ', 'Cloudflare'],
    media: {
      kind: 'image',
      src: 'ezvenda',
      alt: 'An EzVenda shop on a phone: the home page, a product page and the checkout form.',
    },
  },
  {
    slug: 'mini-havoc',
    name: 'Mini Havoc',
    started: '2026-09-24',
    status: 'Live',
    url: 'https://mini.ezvenda.com',
    urlLabel: 'mini.ezvenda.com',
    summary:
      'Party games for friends on a call. One person starts a room, everyone joins from their phone, and the server keeps 3D arenas in sync for up to 24 players.',
    tag: 'Mini Havoc',
    stats: [
      { value: '23', label: 'games, seven of them 3D arenas' }, // shared/games.ts, retired excluded
      { value: '480', label: 'players in a load test, on a quarter of one core' }, // server/scripts/loadtest.ts
      { value: '30 Hz', label: 'server-authoritative physics' },
    ],
    stack: ['TypeScript', 'three.js', 'cannon-es', 'WebSockets', 'Fastify', 'SQLite', 'Capacitor'],
    media: {
      kind: 'video',
      src: 'sumo',
      alt: 'Gameplay of Sumo Out!: four bean characters shove each other around a ring.',
    },
  },
  {
    slug: 'gympaid',
    name: 'GymPaid',
    started: '2026-09-26',
    status: 'In hand-over',
    summary:
      'Membership and renewals for a gym that ran on a paper register. It answers who owes money today, sends WhatsApp reminders and receipts, and can open the fingerprint door only for members who have paid.',
    tag: 'GymPaid',
    stats: [
      { value: '2 days', label: 'from first commit to hand-over' }, // REQUIREMENTS: 26 to 28 Sep
      { value: '154', label: 'tests green' }, // CLAUDE.md status
      { value: '0', label: 'fingerprints stored by the door integration' }, // feat/door, D-46
    ],
    stack: ['TypeScript', 'Fastify', 'Drizzle', 'Postgres', 'React', 'ZKTeco ADMS'],
    media: {
      kind: 'image',
      src: 'gympaid',
      alt: 'The GymPaid wordmark.',
    },
  },
];

export const commitData = commits;
