/** Infinite marquee strip in hero (duplicated in UI for loop). */
export const stackMarquee = [
  'React',
  'TypeScript',
  'Three.js',
  'Node.js',
  'Elixir · Phoenix',
  'OpenAI · Gemini · Claude',
  'RAG',
  'Postgres + pgvector',
  'AWS',
  'GCP',
  'Docker',
  'WebSockets',
  'AI in production',
] as const

export const heroStats = [
  { label: 'Shipped in prod', value: '4+ yrs' },
  { label: 'Cloud', value: 'AWS · GCP' },
  { label: 'Stack depth', value: 'FE → BE → AI' },
] as const

export const site = {
  name: 'Sohaib Ahmad',
  title: 'Full Stack & AI Engineer',
  tagline: 'I architect multi-cloud platforms, real-time systems, and RAG / AI products end-to-end.',
  location: 'Pakistan',
  remote: 'Remote-friendly',
  email: 'maliksohaib.official@gmail.com',
  phone: '+92-305-4990819',
  /** Replace with your public profile URL if different. */
  linkedIn: 'https://www.linkedin.com/in/malik-sohaib',
  resume:
    'https://docs.google.com/document/d/1Xuink9j5MOcRVhdgnSlA8IDMjlZOPqXcIbaOhKbGwKw/edit?usp=sharing',
} as const

export const summary =
  'Full Stack & AI Engineer with around 4 years of professional experience building scalable, secure, and high-performance applications across multi-cloud environments (AWS & GCP). Strong expertise in backend systems, frontend applications, real-time communication, and AI/ML integration. Experienced in leading projects end-to-end, collaborating with cross-functional teams, and mentoring junior developers.'

export const skillGroups = [
  {
    name: 'Frontend',
    items: [
      'React',
      'TypeScript',
      'TailwindCSS',
      'Three.js',
      'HTML · CSS · JavaScript',
    ],
  },
  {
    name: 'Backend',
    items: [
      'Node.js',
      'Express',
      'Fastify',
      'Python',
      'Golang (Fiber)',
      'Elixir (Phoenix)',
      'Phoenix Channels',
      'MERN stack',
      'SSE (Server-Sent Events)',
      'Photon',
    ],
  },
  {
    name: 'AI / ML',
    items: [
      'OpenAI · Realtime API',
      'Gemini',
      'Claude',
      'Groq',
      'RAG pipelines',
      'STT / TTS',
      'HeyGen',
      'Embeddings',
      'Vector DBs',
      'MuseTalk Real-time Lip-sync'
    ],
  },
  {
    name: 'Databases',
    items: [
      'PostgreSQL · pgvector',
      'SQLite',
      'MongoDB',
      'Prisma',
      'Redis',
      'Firebase',
      'ETS (Elixir)',
    ],
  },
  {
    name: 'Cloud & DevOps',
    items: [
      'AWS',
      'GCP',
      'Docker',
      'Docker Compose',
      'ECS',
      'Cloud Run',
      'S3',
      'Lambda',
      'Step Functions',
      'Cron / scheduled jobs',
      'CI/CD',
    ],
  },
  {
    name: 'Security & more',
    items: [
      'SOC readiness',
      'ClamAV file sanitization',
      'Vulnerability resolution',
      'System design',
      'Microservices',
      'SaaS products',
      'Stripe',
      'ActiveCampaign',
      'LiveKit',
      'WebRTC',
    ],
  },
] as const

export type Job = {
  company: string
  location: string
  model: string
  role: string
  period: string
  highlights: string[]
  stack: string
}

export const experience: readonly Job[] = [
  {
    company: 'Arthur',
    location: 'Germany',
    model: 'Remote',
    role: 'Senior Full Stack Engineer',
    period: 'Nov 2023 – Present',
    highlights: [
      'Multi-cloud (AWS + GCP) via adapter pattern and monorepo; Express, Fastify, React, Lambdas, crons.',
      'Photon room & file datasync moved off Express (Photon JS SDK, SSE fan-out, large in-memory snapshots) into dedicated Elixir: custom Photon client using the JS SDK as reference, Phoenix Channels, ETS for inactive/active/file lists, MongoDB, Docker Compose, multi-env AWS & GCP.',
      'SOC compliance with security partners; ClamAV in the processing pipeline.',
      'Arthur Vibe: AI-led async interviews with configurable bot-led meetings (Three.js), Go Fiber plus Lambdas behind one adapter layer for picking AI providers, Redis-backed resumable sessions, S3 transcripts, Step Functions for reports, Postgres pgvector for RAG, and optional anonymous participants.',
      'Mentoring, Notion onboarding, and stronger team culture.',
    ],
    stack:
      'JS, TS, React, Tailwind, Node, Go (Fiber), Elixir (Phoenix, ETS), Python, Redis, Postgres, SQLite, Prisma, MongoDB, Docker, AWS, GCP, AI/ML',
  },
  {
    company: 'BH Group',
    location: 'Lahore',
    model: 'Hybrid',
    role: 'Full Stack Developer',
    period: 'Nov 2022 – Nov 2023',
    highlights: [
      'Solar Design Tool (pvx.ai): landing, dashboards, auth, real-time solar calculations.',
      'Infra, security hardening, and vulnerability fixes; demos and intern training.',
    ],
    stack: 'React, Node, Express, Firebase, GCP, MongoDB',
  },
  {
    company: 'Council for Education (Cfored)',
    location: 'USA',
    model: 'Remote',
    role: 'Associate Software Engineer',
    period: 'Jun 2022 – Apr 2023',
    highlights: [
      'Landing & donation pages with ActiveCampaign; Stripe for donations; fast delivery in a small team.',
    ],
    stack: 'HTML, CSS, JavaScript, ActiveCampaign, Stripe, C#',
  },
] as const

export type ProjectCaseStudy = {
  context: readonly string[]
  problem: readonly string[]
  approach: readonly string[]
  technical: readonly string[]
  outcomes: readonly string[]
  /** Shown when work is under NDA (no client identifiers). */
  ndaNote?: string
}

export type Project = {
  slug: string
  name: string
  blurb: string
  tagline: string
  stack: readonly string[]
  caseStudy: ProjectCaseStudy
}

export const projects: readonly Project[] = [
  {
    slug: 'photon-elixir-phoenix',
    name: 'Photon Client → Elixir Phoenix',
    blurb:
      'Datasync moved off Express: room and file metadata from Photon, pushed to browsers via Phoenix Channels instead of many long-lived SSE connections on Node.',
    tagline:
      'Replacing a Photon-driven, SSE-heavy data-sync path on Express with a dedicated Elixir service: Channels to browsers, a custom Photon client on the BEAM, and multi-cloud deployment.',
    stack: [
      'Elixir · Phoenix',
      'Phoenix Channels',
      'ETS',
      'Photon',
      'MongoDB',
      'AWS · GCP',
      'Docker Compose',
      'Express · Node (legacy path)',
    ],
    caseStudy: {
      context: [
        'The portal exposed a data sync surface backed by Photon: room list state (inactive rooms on one side, active rooms on the other) and, inside a room, live file metadata as uploads changed.',
        'An Express server used the Photon JavaScript SDK, held the canonical snapshot in Node memory (on the order of 20–30 MB JSON for active + inactive room payloads), and pushed updates to browsers over SSE. Clients received room identity, password/metadata changes, and for active rooms participant lists (e.g. display name, avatar URL, and related fields). Opening room detail added another SSE stream for file listings kept in sync the same way.',
        'In one Node process it was easy to follow; at scale it got expensive: many concurrent portal users meant many SSE connections stuck on the same Express instance that still had to serve the rest of the APIs.',
      ],
      problem: [
        'Connection fan-out grew fast: the rooms UI alone used two SSE connections per user (inactive list and active list), and that was before per-room file sync streams. Roughly a hundred concurrent portal users meant on the order of two hundred list SSEs, still not counting room-detail file traffic.',
        'That load shared the Express runtime with the rest of the product, so datasync fought ordinary HTTP for CPU and event-loop time and made unrelated APIs slower and less stable.',
      ],
      approach: [
        'We reviewed several directions and settled on Elixir / Phoenix, primarily for Channels as the long-lived, bidirectional primitive and for the BEAM’s strength under mass connection counts.',
        'I built a custom Photon client in Elixir, using the Photon JS SDK as the behavioral reference, so we could speak Photon’s protocol without anchoring that work in Node.',
        'We pulled room and file metadata sync out of Express into a dedicated Elixir service. Clients subscribe over Channels instead of long-lived SSE on Node. Hot reads for inactive rooms, active rooms, and per-room file lists sit in ETS so every push does not hit MongoDB. Persistence and cloud quirks sit behind adapters so one codebase runs on AWS and GCP.',
      ],
      technical: [
        'The Elixir datasync service uses ETS for inactive, active, and file-list snapshots that mirror what Express previously kept in Node memory, connects to MongoDB for durable storage, ships with Docker Compose, and runs across five environments (three AWS, two GCP), with adapters isolating cloud-specific concerns from core sync logic.',
        'Join and topic rules on Channels mirror the same trust boundaries we enforced when those streams lived on Express; payloads remain structured around room and file events the UI already understood.',
        'Express keeps non-sync responsibilities; the heavy, connection-rich path migrates off the shared Node footprint.',
      ],
      outcomes: [
        'Datasync no longer drags on the main Express server: realtime room and file lists run on a runtime meant for concurrency, while the rest of the API stays predictable.',
        'One codebase path for Photon integration on the BEAM, repeatable Docker-based rollouts, and multi-cloud operations without forking the service per vendor.',
      ],
      ndaNote:
        'Product and company names, traffic figures, and internal diagrams are omitted. This summary reflects architecture and engineering tradeoffs only.',
    },
  },
  {
    slug: 'arthur-vibe',
    name: 'Arthur Vibe',
    blurb:
      'AI assistant that schedules bot-led meetings with invited teammates: configurable behavior and tone, Three.js meeting room, Go Lambdas and Step Functions pipelines, and RAG-backed reports.',
    tagline:
      'From creating a vibe and sending invites through branded 3D interviews, S3 transcripts, reports orchestrated with Step Functions, and a RAG report assistant, mostly implemented in Go with Postgres pgvector.',
    stack: [
      'React',
      'Three.js',
      'Go · Fiber',
      'AWS Lambda',
      'Step Functions',
      'S3',
      'Redis',
      'Postgres',
      'pgvector',
      'MongoDB',
      'OpenAI · Gemini · Anthropic',
      'Go AI provider adapters',
      'RAG',
    ],
    caseStudy: {
      context: [
        'Vibe is an AI assistant for scheduling meetings and inviting teammates. The creator configures a “vibe”: type (for example sync alignment, project management, or root cause analysis), bot details such as name, voice, and prompts, optional reference questions, and how strictly the bot follows that script versus investigating further.',
        'Participants get an email after the vibe is created; the creator can set a deadline. During interviews the bot runs the conversation with each person. People can join anonymously so names stay out of transcripts and reports. When interviews finish or someone kicks off reporting, the creator can generate different report types, and the report UI includes an assistant for questions about single interviews or the whole run.',
        'The backend is Go (Fiber) with Postgres as the primary database, MongoDB for syncing with the broader ecosystem, and OpenAI, Gemini, and Anthropic reachable through one custom adapter implementation shared across the API and all Lambdas so the active provider is chosen dynamically per call.',
      ],
      problem: [
        'The product mixes realtime dialogue, resumable sessions, multilingual transcripts, big batch report jobs, and semantic Q&A on corpora that keep growing. Each piece fails, costs, and needs consistency in its own way.',
        'Privacy and sharing semantics had to hold end-to-end: anonymous participation, public versus private reports, and targeted shares must stay aligned from Redis conversation state through S3 objects and pgvector indexes.',
      ],
      approach: [
        'Separated the synchronous API tier (Go Fiber, Postgres, MongoDB) from meeting orchestration on a Go Lambda connected to Redis for question state and dialogue continuity, including pause-and-resume by reloading conversation from Redis.',
        'Used S3 as the handoff for transcripts: the meeting lambda uploads transcripts (with translation to English when the session was not in English), then an S3-triggered processing lambda chunks and vectorizes meetings into Postgres with the vector extension.',
        'Report generation runs under an AWS Step Functions orchestrator when all participants finish, the deadline hits, or the creator starts the pipeline: a report lambda pulls transcripts in batches (five at a time), applies report-type-specific prompts loaded from Postgres (customizable from the portal), merges incrementally until the full report exists, then optionally translates the report if the vibe’s locale is not English, runs embeddings for the report back into pgvector, completes the pipeline, and notifies the user by email.',
      ],
      technical: [
        'Meeting UX: participants choose language and voice, then join a Three.js 3D environment with company branding and a bot with animation states (thinking, talking, listening, and similar). The Go meeting lambda fetches prompts dynamically, implements question-generation logic and strictness rules, and drives STT/TTS and dialogue completions through the shared adapter layer so the runtime provider stays configurable.',
        'Post-meeting path: transcript artifacts on S3 drive ingestion into pgvector; the Step Functions workflow isolates report generation, translation, and report embedding so stages can be observed, retried, or revised without entangling the Fiber API.',
        'Across Fiber and every Go Lambda, AI calls share one adapter pattern: batch reports, translation, embeddings, and assistant completions all pick OpenAI, Gemini, or Anthropic at call time instead of branching vendor code through handlers.',
        'Report and assistant layer: the UI pulls the right report JSON from S3 for the selected language, renders a fixed component schema, and supports public, private, or targeted sharing, with optional translation and assistant voice. Queries embed the question, pull chunks with pgvector search, and answer through the LLM (RAG) with the same adapter-backed backend.',
      ],
      outcomes: [
        'A coherent story from configurable bot-led interviews to durable, searchable reports without forcing one runtime to own realtime, batch LLM work, and heavy file IO.',
        'Go Lambdas and Step Functions keep heavy AI and merge work off the request path while Postgres pgvector stays one retrieval layer for interview chunks and report Q&A; swapping providers stays inside the adapters.',
      ],
      ndaNote:
        'Case study is anonymized: no customer data, metrics, or screenshots. Descriptions reflect how the system was engineered, not proprietary prompts or documents.',
    },
  },
  {
    slug: 'zoom-meeting-agent',
    name: 'Zoom Meeting Agent',
    blurb:
      'Configurable voice agents for Zoom: admin UI for prompts and models, a bridge page for audio and OpenAI WebRTC, a LiveKit bot worker, and a parallel HeyGen avatar flow.',
    tagline:
      'From authenticated agent configuration through Zoom audio bridging and session bootstrapping on Node, to a LiveKit room and an MCP-style Python dispatcher that launches the bot with the right prompt, voice, and avatar.',
    stack: [
      'React',
      'Node.js',
      'OpenAI · Groq',
      'OpenAI Realtime · WebRTC',
      'LiveKit',
      'Python',
      'Zoom',
      'HeyGen',
      'STT · TTS',
    ],
    caseStudy: {
      context: [
        'Operators configure meeting agents in a React app: display name, wake word, system prompt, LLM (OpenAI or Groq), speech-to-text and text-to-speech choices, and optional avatar imagery. Access to agent management is behind email-and-password authentication with proper session handling.',
        'Participants use a dedicated webpage that joins the Zoom meeting and shuttles meeting audio in both directions between Zoom and that page. After the Node.js backend initializes the realtime session, the page connects to OpenAI over WebRTC for low-latency dialogue.',
        'On a separate path a worker spins up a LiveKit room; a small Python CLI (MCP-style) drops the bot into that room with the same prompt, avatar, and runtime settings the operator saved. HeyGen uses another frontend that streams the avatar while reusing the same OpenAI realtime “brain” logic.',
      ],
      problem: [
        'In real meetings, several people talk at once. Without a gate, voice activity could wake the assistant constantly and produce wrong or rude interruptions.',
        'Zoom, WebRTC, and LiveKit each have different connection and lifecycle rules; the product still had to feel like one agent with one configured personality.',
      ],
      approach: [
        'Treat the wake word as an explicit activation step: the model only commits to a full reply after the trigger phrase (for example “Hey, engineering expert, …”), which keeps cross-talk from spoofing user intent.',
        'Keep session creation authoritative on the Node layer, then let the browser own the WebRTC peer to OpenAI while the bridge page handles Zoom audio I/O.',
        'LiveKit hosts bot media; a thin Python dispatcher keeps “send this agent config to the room” a small, automatable contract, in the same spirit as an MCP tool that runs one job with a fixed payload.',
      ],
      technical: [
        'Admin React UI persists agent definitions (models, TTS/STT, prompts, assets) and enforces authenticated sessions.',
        'The bridge page: Zoom join + capture/playout, backend-initiated OpenAI Realtime session, WebRTC attach, and error recovery tuned for meeting-length runs.',
        'Node coordinates tokens or session bootstrap for the realtime client; the stack wires STT/TTS through the supported OpenAI-family or Groq-facing paths the product exposes.',
        'LiveKit hosts the bot media leg; the Python CLI/server dispatches the bot with the stored prompt and avatar metadata. HeyGen integration adds a streaming presentation path on the frontend without forking the core reasoning stack.',
      ],
      outcomes: [
        'One configuration surface drives both the Zoom bridge experience and the LiveKit bot worker, so demos and production agents stay aligned.',
        'Wake-word gating made multi-participant rooms usable: the assistant activates on intent, not on every background sentence.',
      ],
      ndaNote:
        'No customer names, meeting content, or internal runbooks; only architecture and how the product behaved.',
    },
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export type Testimonial = {
  author: string
  title: string
  organization: string
  /** Verbatim excerpt from LinkedIn; full recommendation on profile. */
  excerptParagraphs: readonly string[]
}

export const testimonials = [
  {
    author: 'Syed Mujtaba Raza',
    title: 'Team Lead',
    organization: 'Arthur',
    excerptParagraphs: [
      'I had the pleasure of working with Malik Sohaib during his time at Arthur, where he served as a Full Stack Developer before earning a well-deserved promotion to Senior Developer, a milestone that came as no surprise to anyone who worked with him.',
    ],
  },
  {
    author: 'Harold Huggins',
    title: 'Director',
    organization: 'Council for Education',
    excerptParagraphs: [
      'I have had the pleasure of working closely with Sohaib Ahmad on several projects where he showcased his exceptional skills as an API developer and full-stack engineer. Sohaib consistently delivered high-quality results and demonstrated a deep understanding of both front-end and back-end development.',
    ],
  },
  {
    author: 'Irtaza Hussan',
    title: 'Team Lead',
    organization: 'BH Group',
    excerptParagraphs: [
      'I highly recommend Sohaib for his exceptional communication skills, technical expertise, and strong teamwork abilities. He consistently demonstrates a deep understanding of his responsibilities and collaborates effectively with team members to achieve goals. He would be a valuable asset to any team or project.',
    ],
  },
] as const satisfies readonly Testimonial[]
