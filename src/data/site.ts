// Every visible string on the site lives here.
// Numbers come from the repos or GitHub (sources in the comments), never rounded up.
// Placeholders the owner must fill are marked `placeholder: true`.
import activity from './activity.json';

export const site = {
  name: 'Sohaib Malik',
  fullName: 'Malik Sohaib Ahmad',
  role: 'Full-stack and AI engineer',
  url: 'https://maliksohaib.com',
  description:
    'Sohaib Malik is a full-stack and AI engineer who takes products from idea to production for companies and clients worldwide: design, frontend, backend, AI and launch.',
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
  { label: 'Path', href: '/#path' },
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/#about' },
] as const;

export const hero = {
  role: 'Full-stack and AI engineer',
  lede: 'I take products from an idea to production: the design, the frontend, the backend, the AI and the launch. Four years of it, with companies, with clients, and on products of my own.',
  facts: [
    { value: '4+ years', label: 'shipping software since 2022' },
    { value: 'Senior', label: 'full-stack engineer at Arthur, Germany' },
    { value: 'Remote', label: 'from Pakistan, with teams worldwide' },
  ],
} as const;

// The career timeline. Dates are YYYY-MM; `to: null` means ongoing.
export type Span = { label: string; detail: string; from: string; to: string | null; track: 'work' | 'own' | 'side'; href?: string };
export type Mark = { label: string; at: string; track: 'work' | 'own' | 'side' | 'life'; placeholder?: boolean };
// Graduation is a mark on its own track: the degree's start date isn't on record.

export const path = {
  title: 'Path',
  intro: 'From mechatronics to the web, then to AI, then to owning products end to end.',
  from: '2022-01',
  zoomTo: '2026-05',
  tracks: [
    { id: 'life', label: 'Education' },
    { id: 'work', label: 'Companies' },
    { id: 'side', label: 'Clients and side projects' },
    { id: 'own', label: 'My own products' },
  ],
  spans: [
    { label: 'Council for Education', detail: 'Associate Software Engineer, remote (USA)', from: '2022-06', to: '2023-04', track: 'work' },
    { label: 'BH Group', detail: 'Full Stack Developer, Lahore', from: '2022-11', to: '2023-11', track: 'work' },
    { label: 'Arthur', detail: 'Full Stack, then Senior Full Stack Engineer, remote (Germany)', from: '2023-11', to: null, track: 'work' },
    { label: 'EzVenda', detail: 'Commerce platform', from: '2026-07', to: null, track: 'own', href: '#ezvenda' },
    { label: 'Mini Havoc', detail: 'Multiplayer party games', from: '2026-09', to: null, track: 'own', href: '#mini-havoc' },
    { label: 'GymPaid', detail: 'Gym memberships', from: '2026-09', to: null, track: 'own', href: '#gympaid' },
  ] as Span[],
  marks: [
    { label: 'BS Mechatronics, Air University', at: '2023-06', track: 'life' }, // CV: June 2023
    { label: 'PriceWatch', at: '2023-07', track: 'side' }, // repo web-scraper
    { label: 'Photopia', at: '2023-10', track: 'side' }, // repo Photopia
    { label: 'Promptswap', at: '2023-10', track: 'side' }, // repo ai-prompts-next
  ] as Mark[],
} as const;

export const activityData = activity;

export type Status = 'Live' | 'In hand-over';

export type Product = {
  slug: string;
  name: string;
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

export type Company = {
  name: string;
  role: string;
  where: string;
  from: string;
  to: string;
  url?: string;
  points: string[];
  cases?: { title: string; summary: string; slug: string }[];
};

// From the CV and the old site's experience copy. Company work is under NDA: no client names or numbers.
export const companies: Company[] = [
  {
    name: 'Arthur',
    role: 'Full Stack, then Senior Full Stack Engineer',
    where: 'Germany, remote',
    from: 'Nov 2023',
    to: 'now',
    points: [
      'One codebase on AWS and GCP behind an adapter layer: Express, Fastify, React, Lambdas and scheduled jobs.',
      'Moved real-time room and file sync off Express into an Elixir service with Phoenix Channels and a Photon client I wrote.',
      'SOC compliance with security partners, and ClamAV in the file pipeline.',
      'Mentoring and onboarding. Promoted to senior.',
    ],
    cases: [
      { title: 'Photon to Elixir', summary: 'Real-time sync moved to the BEAM, five environments on two clouds.', slug: 'photon-elixir-phoenix' },
      { title: 'Arthur Vibe', summary: 'AI-led interviews in a 3D room, reports from Step Functions and RAG.', slug: 'arthur-vibe' },
    ],
  },
  {
    name: 'BH Group',
    role: 'Full Stack Developer',
    where: 'Lahore, hybrid',
    from: 'Nov 2022',
    to: 'Nov 2023',
    url: 'https://pvx.ai',
    points: [
      'PV Smith (pvx.ai), a solar design and simulation tool: dashboards, auth and real-time solar calculations.',
      'A report generator producing 24-page reports, and generated electrical diagrams and graphs.',
      'Ran the internship hiring and trained the interns.',
    ],
  },
  {
    name: 'Council for Education',
    role: 'Associate Software Engineer',
    where: 'USA, remote',
    from: 'Jun 2022',
    to: 'Apr 2023',
    points: ['Campaign and donation pages with Stripe payments, ActiveCampaign onboarding, SendGrid and reCAPTCHA.'],
  },
];

export type Gig = { name: string; year: string; kind: string; summary: string; url?: string; placeholder?: boolean };

export const gigs: Gig[] = [
  {
    name: 'Your client projects',
    year: '',
    kind: 'Client',
    summary: 'Waiting on the list: name, year, what I built, link, and whether the client can be named.',
    placeholder: true,
  },
  { name: 'LinkedIn Queens generator', year: '2026', kind: 'Side project', summary: 'Generates and plays the LinkedIn Queens puzzle.', url: 'https://linkedin-queens-game.vercel.app' },
  { name: 'Promptswap', year: '2023', kind: 'Side project', summary: 'Create and share AI prompts.', url: 'https://promptswap.vercel.app' },
  { name: 'Photopia', year: '2023', kind: 'Side project', summary: 'Generate images with OpenAI and share them, with the prompt, in a community feed.', url: 'https://photopia-beta.vercel.app' },
  { name: 'PriceWatch', year: '2023', kind: 'Side project', summary: 'Tracks Amazon prices with a scraper and emails you when one drops.', url: 'https://price-watch.vercel.app' },
];
