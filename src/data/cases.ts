// Case studies, told as decision logs: what was chosen, what it was chosen over, and why.
// Company work is under NDA: architecture and trade-offs only, no client names or figures.
import type { ImageMetadata } from 'astro';
import ezHome from '../assets/work/ezvenda-home.webp';
import ezProduct from '../assets/work/ezvenda-product.webp';
import ezCheckout from '../assets/work/ezvenda-checkout.webp';
import ezDesktop from '../assets/work/ezvenda-desktop.webp';
import mhHush from '../assets/work/mini-havoc-hush.jpg';
import mhFloor from '../assets/work/mini-havoc-floor.jpg';
import mhHex from '../assets/work/mini-havoc-hexdrop.jpg';
import mhSumo from '../assets/work/mini-havoc-sumo.jpg';
import gpCard from '../assets/work/gympaid-card.png';

export type Decision = { id?: string; title: string; chose: string; insteadOf: string; why: string };
export type Shot = { src: ImageMetadata; alt: string; caption: string; tall?: boolean };

export type CaseStudy = {
  slug: string;
  title: string;
  oneLiner: string;
  description: string;
  role: string;
  /** Only when the dates are on record. */
  when?: string;
  status: string;
  links?: { label: string; href: string }[];
  context: string[];
  decisions: Decision[];
  outcomes: string[];
  stack: string[];
  shots?: Shot[];
  video?: { src: string; poster: ImageMetadata; alt: string; caption: string };
  nda?: string;
};

const NDA = 'Under NDA: no client names, figures or internal diagrams. This is how the system was engineered and why.';

export const cases: CaseStudy[] = [
  {
    slug: 'ezvenda',
    title: 'EzVenda',
    oneLiner: 'A commerce platform for small merchants in Pakistan, built and run by one person.',
    description: 'EzVenda case study: a multi-tenant commerce platform for Pakistani merchants, with cash on delivery, custom domains and an MCP server.',
    role: 'Solo: product, design, frontend, backend, infrastructure',
    when: 'Jul 2026 to now',
    status: 'Live',
    links: [{ label: 'ezvenda.com', href: 'https://ezvenda.com' }],
    context: [],
    decisions: [],
    outcomes: [],
    stack: ['TypeScript', 'Fastify', 'ts-rest', 'Drizzle', 'Postgres', 'BullMQ', 'React', 'TanStack', 'Astro', 'Cloudflare for SaaS', 'R2', 'MCP'],
    shots: [
      { src: ezDesktop, alt: 'A shop built on EzVenda, on a desktop browser.', caption: 'A merchant’s shop on the vitrine theme.' },
      { src: ezHome, alt: 'The shop home page on a phone.', caption: 'Phone first: most shoppers arrive from social apps.', tall: true },
      { src: ezProduct, alt: 'A product page with price, discount and photos.', caption: 'Product pages carry price, stock and structured data.', tall: true },
      { src: ezCheckout, alt: 'Guest checkout asking for a phone number.', caption: 'Guest checkout built around cash on delivery.', tall: true },
    ],
  },
  {
    slug: 'mini-havoc',
    title: 'Mini Havoc',
    oneLiner: 'Real-time party games for friends on a call: one code, everyone’s phone, no download.',
    description: 'Mini Havoc case study: 23 browser party games with server-authoritative 3D arenas, client prediction and offline bots.',
    role: 'Solo: game design, 3D, frontend, netcode, backend',
    when: 'Sep 2026 to now',
    status: 'Live',
    links: [{ label: 'mini.ezvenda.com', href: 'https://mini.ezvenda.com' }],
    context: [],
    decisions: [],
    outcomes: [],
    stack: ['TypeScript', 'three.js', 'cannon-es', 'Fastify', 'WebSockets', 'node:sqlite', 'Web Audio', 'Capacitor'],
    video: { src: '/media/mini-havoc-sumo', poster: mhSumo, alt: 'Gameplay of Sumo Out!', caption: 'Sumo Out!, recorded from a real game.' },
    shots: [
      { src: mhHush, alt: 'Hush: a first-person view down a haunted house corridor.', caption: 'Hush: a two-floor haunted house.' },
      { src: mhFloor, alt: 'Colour Floor: beans on a grid of coloured tiles.', caption: 'Colour Floor.' },
      { src: mhHex, alt: 'Hex Drop: beans on a honeycomb that falls away.', caption: 'Hex Drop.' },
    ],
  },
  {
    slug: 'gympaid',
    title: 'GymPaid',
    oneLiner: 'Membership renewals for a gym that ran on a paper register, built against a two-day deadline.',
    description: 'GymPaid case study: gym memberships and renewals with WhatsApp reminders and a fingerprint door, built in two days.',
    role: 'Solo: requirements, design, frontend, backend',
    when: 'Sep 2026',
    status: 'In hand-over',
    context: [],
    decisions: [],
    outcomes: [],
    stack: ['TypeScript', 'Fastify', 'Drizzle', 'Postgres', 'React', 'TanStack', 'ZKTeco ADMS'],
    shots: [{ src: gpCard, alt: 'GymPaid’s card: who owes you money today.', caption: 'The one question the product answers.' }],
  },
  {
    slug: 'photon-elixir-phoenix',
    title: 'Photon to Elixir',
    oneLiner: 'Real-time room and file sync moved off a busy Node server onto Phoenix Channels.',
    description: 'Case study: moving Photon-driven real-time sync from SSE on Express to an Elixir service with Phoenix Channels and ETS, across AWS and GCP.',
    role: 'Senior Full Stack Engineer at Arthur',
    status: 'Shipped',
    context: [
      'A portal kept room lists and per-room file lists in sync with Photon. An Express server held the snapshot in memory and pushed changes to browsers over server-sent events.',
      'Every user held two long-lived streams for the room lists, plus one per open room. That traffic shared the same Node process as the rest of the API, and slowed it down.',
    ],
    decisions: [
      { title: 'A dedicated Elixir service', chose: 'Move sync into Elixir, with Phoenix Channels to the browsers.', insteadOf: 'Scaling the Express server or adding more SSE workers.', why: 'Channels are built for many long-lived connections, and the BEAM keeps them cheap and isolated from the rest of the API.' },
      { title: 'Our own Photon client', chose: 'Write a Photon client in Elixir, using the JavaScript SDK as the reference.', insteadOf: 'Keeping the JavaScript SDK and bridging to it from Node.', why: 'It removed Node from the sync path completely, so the protocol and the fan-out live in one runtime.' },
      { title: 'Hot state in ETS', chose: 'Keep inactive rooms, active rooms and file lists in ETS tables.', insteadOf: 'Reading MongoDB on every push.', why: 'Pushes read memory, not the database. MongoDB stays the durable copy.' },
      { title: 'One codebase, two clouds', chose: 'Hide cloud differences behind adapters.', insteadOf: 'A fork of the service per cloud.', why: 'The same build runs in five environments across AWS and GCP.' },
    ],
    outcomes: ['Sync no longer competes with the API for the Node event loop.', 'Channel topics enforce the same access rules the SSE endpoints had.', 'Repeatable Docker-based releases across five environments on two clouds.'],
    stack: ['Elixir', 'Phoenix Channels', 'ETS', 'Photon', 'MongoDB', 'Docker Compose', 'AWS', 'GCP'],
    nda: NDA,
  },
  {
    slug: 'arthur-vibe',
    title: 'Arthur Vibe',
    oneLiner: 'An AI that runs interviews with a team, then writes a report you can ask questions of.',
    description: 'Arthur Vibe case study: AI-led async interviews in a 3D room, report pipelines on Step Functions, and RAG over transcripts with pgvector.',
    role: 'Senior Full Stack Engineer at Arthur',
    status: 'Shipped',
    context: [
      'A creator sets up a “vibe”: its purpose, the bot’s name, voice and prompts, reference questions, and how strictly the bot follows them. Teammates get an invite and talk to the bot in a branded 3D room, anonymously if they want.',
      'When the interviews are done, the creator generates reports and asks an assistant about one interview or all of them.',
    ],
    decisions: [
      { title: 'Meetings on their own runtime', chose: 'Run the live interview in a Go Lambda with its state in Redis.', insteadOf: 'Running dialogue inside the API servers.', why: 'Sessions pause and resume by reloading the conversation from Redis, and long calls never hold up the API.' },
      { title: 'S3 as the hand-off', chose: 'Write transcripts to S3 and let that trigger chunking and embedding.', insteadOf: 'Processing inline at the end of the call.', why: 'Each stage can fail and retry on its own, and translation to English happens once, before indexing.' },
      { title: 'Reports as a state machine', chose: 'Generate reports with Step Functions, merging transcripts five at a time.', insteadOf: 'One long job.', why: 'Big runs stay inside model limits, and every stage can be observed and retried.' },
      { title: 'One adapter for every model', chose: 'One provider adapter shared by the API and every Lambda.', insteadOf: 'Vendor code in each handler.', why: 'OpenAI, Gemini or Anthropic is picked per call, and switching never touches the product code.' },
      { title: 'Retrieval in Postgres', chose: 'Store interview and report embeddings in Postgres with pgvector.', insteadOf: 'A separate vector database.', why: 'One store for data and search keeps sharing rules (private, public, targeted) in one place.' },
    ],
    outcomes: ['Bot-led interviews to searchable reports, without one runtime owning realtime, batch AI work and file IO.', 'Anonymous participation kept consistent from Redis to S3 to the vector index.'],
    stack: ['React', 'three.js', 'Go', 'Fiber', 'AWS Lambda', 'Step Functions', 'S3', 'Redis', 'Postgres', 'pgvector', 'OpenAI', 'Gemini', 'Anthropic'],
    nda: NDA,
  },
  {
    slug: 'zoom-meeting-agent',
    title: 'Zoom meeting agent',
    oneLiner: 'Configurable voice agents that join Zoom calls and answer only when asked.',
    description: 'Case study: voice agents for Zoom with a wake word, OpenAI Realtime over WebRTC, a LiveKit bot worker and a HeyGen avatar path.',
    role: 'Full-stack and AI engineer',
    when: '2026', // repo zoom-custom-meeting-agent, Apr 2026
    status: 'Shipped',
    context: [
      'Operators configure an agent in a React app: name, wake word, prompt, model, speech-to-text and text-to-speech, and an avatar. A bridge page joins the Zoom call and carries its audio both ways.',
      'A second path launches the same agent into a LiveKit room, and a third streams it as a HeyGen avatar, all from the same configuration.',
    ],
    decisions: [
      { title: 'A wake word', chose: 'The agent commits to a reply only after its wake phrase.', insteadOf: 'Answering any voice activity.', why: 'In real meetings people talk over each other; without a gate the agent interrupts constantly.' },
      { title: 'Sessions start on the server', chose: 'Node creates the realtime session; the browser owns the WebRTC link to OpenAI.', insteadOf: 'Keys or session setup in the browser.', why: 'Credentials stay on the server, and audio takes the shortest path.' },
      { title: 'A tiny dispatch contract', chose: 'A small Python dispatcher drops the bot into a LiveKit room with one payload.', insteadOf: 'A second agent definition for LiveKit.', why: 'Every surface runs the same saved personality.' },
    ],
    outcomes: ['One configuration drives the Zoom bridge, the LiveKit bot and the avatar stream.', 'Multi-person calls became usable once the wake word was in.'],
    stack: ['React', 'Node', 'OpenAI Realtime', 'WebRTC', 'Groq', 'LiveKit', 'Python', 'HeyGen'],
    nda: 'No customer names or meeting content: only architecture and how the product behaved.',
  },
];

export const caseBySlug = (slug: string) => cases.find((c) => c.slug === slug);
