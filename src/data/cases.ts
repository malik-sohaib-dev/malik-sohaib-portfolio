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
    oneLiner: 'A multi-tenant commerce platform where small Pakistani merchants run cash-on-delivery shops on their own domains.',
    description: 'EzVenda case study: a multi-tenant commerce platform for Pakistani merchants, with cash on delivery, custom domains and an MCP server.',
    role: 'Solo: product, design, frontend, backend, infrastructure',
    when: 'Jul 2026 to now',
    status: 'Live',
    links: [{ label: 'ezvenda.com', href: 'https://ezvenda.com' }],
    context: [
      'Small merchants in Pakistan sell in rupees, mostly cash on delivery, and their ad spend is wasted on fake orders that never get paid for.',
      'EzVenda gives each merchant a hosted storefront with guest checkout, a merchant app for catalogue, orders and shop design, and a connector so the merchant’s own AI assistant can do the work for them.',
    ],
    decisions: [
      { id: 'D-201', title: 'Custom domains, without running certificates', chose: 'Merchants connect their own domain through Cloudflare for SaaS, which issues and renews the certificates.', insteadOf: 'Issuing certificates on demand from our own servers the first time a new domain connects.', why: 'Merchant traffic gets the same DDoS protection, firewall and caching as the platform, and certificate renewal and rate limits stop being our problem.' },
      { id: 'D-268', title: 'Count a sale when the merchant confirms it', chose: 'The server reports a purchase to Meta and TikTok when the merchant confirms a cash-on-delivery order, with the order id as the event id.', insteadOf: 'Firing the purchase from the shopper’s browser the moment an order is placed.', why: 'Fake COD orders are the biggest problem for Pakistani advertisers. Counting only confirmed orders teaches the ad platforms to find real buyers, and a sale is never counted twice.' },
      { id: 'D-16', title: 'Pixel IDs only, no pasted scripts', chose: 'Merchants enter format-checked pixel IDs, and a first-party script starts each vendor’s tracking.', insteadOf: 'A custom scripts box, or pasting the vendors’ inline snippets.', why: 'Arbitrary JavaScript on a page with a checkout turns any XSS bug into a card skimmer served from our own domain.' },
      { id: 'D-249', title: 'The AI connector uses the API’s own routes', chose: 'Each merchant’s MCP key is tied to one store and one person, and every tool calls the API’s existing routes.', insteadOf: 'Tools that read and write the database directly.', why: 'An agent’s change gets the same validation, permissions, events and audit trail as the merchant’s own click, and design edits stay drafts until the merchant publishes.' },
      { title: 'Stock that cannot be oversold', chose: 'Checkout takes stock with one conditional update that subtracts only while enough is left.', insteadOf: 'Reading the stock, checking it in code, then writing the new number.', why: 'The check and the decrement are one atomic statement, so two shoppers can never both buy the last unit. Checkout also re-prices from live tables.' },
    ],
    outcomes: [
      'Live, with a real merchant trading on it since milestone 1 (Sep 2026), their catalogue imported from Shopify.',
      '39 MCP tools let a merchant’s AI assistant manage the catalogue, pictures, shop design and settings.',
      'Full end-to-end suite green: 152 passed, 0 failed. 139 unit test files and 54 Playwright specs.',
      '307 engineering decisions written down, each with what was chosen, what it was chosen over, and why.',
      'Two storefront themes and 51 screens across the merchant app, the shop and the admin.',
    ],
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
    oneLiner: 'Real-time party games for friends on a call: 23 games from one shared link, fair by design, playable offline against bots.',
    description: 'Mini Havoc case study: 23 browser party games with server-authoritative 3D arenas, client prediction and offline bots.',
    role: 'Solo: game design, 3D, frontend, netcode, backend',
    when: 'Sep 2026 to now',
    status: 'Live',
    links: [{ label: 'mini.ezvenda.com', href: 'https://mini.ezvenda.com' }],
    context: [
      'Friends on a call want something to play together without everyone installing an app. One person makes a room and shares a code, and up to 24 people play on phones and laptops.',
      'Many players are on Pakistani mobile networks, where latency is high and some connections block WebSockets outright.',
    ],
    decisions: [
      { title: 'Server-run worlds, judged at each player’s moment', chose: 'The server runs every arena at 30 ticks a second; each screen predicts its own movement with the same shared code, and hits are judged at the tick the player saw.', insteadOf: 'Trusting each client’s positions, or judging everything at the server’s present, which punishes the laggiest player.', why: 'Nobody can cheat by editing their client, and lag never decides who wins. Snapshots correct you by replaying inputs the server has not seen yet, so play stays smooth.' },
      { title: 'Seeded boards, one message per tick', chose: 'Every round has a seed so each screen builds the board itself, players stream small progress updates, and each screen gets one combined message per tick.', insteadOf: 'Relaying every player’s update to everyone as it arrives.', why: 'Relaying grows with the square of the room. A 50-player room went from a third of a CPU core to about 4%.' },
      { title: 'Secrets stay on the server', chose: 'During secret planning, snapshots carry only what was last revealed; hidden answers and items stay on the server until the reveal.', insteadOf: 'Sending the full state and hiding it in the client.', why: 'Even a modified client cannot see a rival’s moves early, and late inputs count up to the reveal, so a network hiccup costs no turns.' },
      { title: 'A way in when sockets are blocked', chose: 'If a WebSocket never opens but the server answers, the tab switches to an event stream with batched posts, then to long polling.', insteadOf: 'Telling those players they cannot connect.', why: 'It was seen in the field on Android phones on Pakistani networks. The client also races three sockets and keeps the fastest.' },
      { title: 'One room engine, on the server or the phone', chose: 'The room engine is shared code with no server dependencies, saving through a storage interface.', insteadOf: 'A separate offline mode with its own copy of the rules.', why: 'A room of bots runs entirely on the phone, offline, with exactly the same rules, scoring and bots as online.' },
    ],
    outcomes: [
      '23 games, 7 of them real-time 3D arenas in three.js.',
      'Load test: 480 players in 80 rooms, about 400 in live rounds at once, on a quarter of one CPU core and 3 MB/s.',
      '384 automated test cases, including bot-played rounds for every arena.',
      'Seats survive reloads for 12 hours, drops get a 15-second grace, and rooms resume after a server restart.',
      'About 860 commits and over 150 pull requests in its first month.',
    ],
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
    oneLiner: 'A renewals tracker for Pakistani gyms that replaces the paper register and answers one question: who owes me money today?',
    description: 'GymPaid case study: gym memberships and renewals with WhatsApp reminders and a fingerprint door, built in two days.',
    role: 'Solo: requirements, design, frontend, backend',
    when: 'Sep 2026',
    status: 'In hand-over',
    context: [
      'A gym in Punjab kept memberships in a paper register. A member who joined on the 17th pays on the 17th, every month, and with a few hundred members on a few hundred different days the owner could not tell who was due.',
      'GymPaid gives the front desk a due list, WhatsApp reminders and revenue figures that stay correct without anyone maintaining them.',
    ],
    decisions: [
      { id: 'D-3', title: 'Renewals anchored to the join day', chose: 'Each member keeps a pay day separate from their next due date.', insteadOf: 'Computing each due date from the previous one.', why: 'A member anchored on the 31st is due on 28 February; computing March from the 28th would move them to the 28th for good. Keeping the anchor restores the 31st.' },
      { id: 'D-14', title: 'Status is computed, never stored', chose: 'Active, due soon, overdue or lapsed is worked out on every request from the due date and the gym’s grace period.', insteadOf: 'A status column.', why: 'A status column goes stale at midnight because nothing runs to flip it, and every screen, and later the door, would believe it.' },
      { id: 'D-11', title: 'No cron, no queue: reminders are a query', chose: 'The due list is a query, and a reminder opens WhatsApp with the message already typed.', insteadOf: 'A background worker, a queue of reminder records and the WhatsApp Business API.', why: 'A query is always correct and has nothing to retry. It shipped on day one with no verification process and no per-message cost.' },
      { id: 'D-24', title: 'Wrong payments are voided, not deleted', chose: 'An owner can void the latest payment, which restores the previous due date and keeps the receipt.', insteadOf: 'Deleting the payment, or fixing it in SQL.', why: 'Staff will tap Paid on the wrong row. Deleting would free a receipt number a member already holds and erase the record that it happened.' },
      { id: 'D-46', title: 'A door that holds no fingerprints', chose: 'Each minute the door terminal is sent only the difference between who it lets in and who should get in now; fingerprint templates never leave the device.', insteadOf: 'A command queue with retries, and a copy of members’ biometrics.', why: 'A member who lapses at midnight is shut out on the next poll with nothing scheduled, and “we hold no fingerprints” is a promise the design keeps.' },
    ],
    outcomes: [
      'Milestone 1 built against a two-day hand-over deadline.',
      '154 automated tests green, 48 of them on the renewal rule alone.',
      'A pre-deploy security review that found and closed a way around the sign-in rate limit.',
      'Door polling at about 12 ms per poll, with no fingerprints stored.',
    ],
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
