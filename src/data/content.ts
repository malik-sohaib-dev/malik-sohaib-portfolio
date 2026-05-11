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
  { label: 'Shipped in prod', value: '3+ yrs' },
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
} as const

export const summary =
  'Full Stack & AI Engineer with over 3 years of professional experience building scalable, secure, and high-performance applications across multi-cloud environments (AWS & GCP). Strong expertise in backend systems, frontend applications, real-time communication, and AI/ML integration. Experienced in leading projects end-to-end, collaborating with cross-functional teams, and mentoring junior developers.'

export const skillGroups = [
  {
    name: 'Frontend',
    items: [
      'React',
      'TailwindCSS',
      'Three.js',
      'HTML',
      'CSS',
      'JavaScript',
      'TypeScript',
    ],
  },
  {
    name: 'Backend',
    items: [
      'Node.js',
      'Express',
      'Fastify',
      'Golang (Fiber)',
      'Elixir (Phoenix)',
      'Python',
      'MERN stack',
    ],
  },
  {
    name: 'AI / ML',
    items: [
      'OpenAI',
      'Gemini',
      'Claude',
      'RAG pipelines',
      'Whisper / Faster-Whisper',
      'Coqui TTS',
      'Embeddings',
      'Vector DBs',
    ],
  },
  {
    name: 'Databases',
    items: [
      'PostgreSQL (PG Vector)',
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
      'ECS',
      'Cloud Run',
      'S3',
      'Lambda',
      'Step Functions',
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
      'WebSockets',
      'Microservices',
      'SaaS products',
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
      'Re-implemented Photon client SDK in Elixir Phoenix: channels, ETS, real-time at huge scale.',
      'SOC compliance with security partners; ClamAV in the processing pipeline.',
      'Arthur Vibe – AI async collaboration: org/team access, STT/TTS, translation, RAG in Postgres Vector, multi-model (OpenAI, Gemini, Claude), self-hosted Whisper & Coqui on Cloud Run.',
      'Mentoring, Notion onboarding, and stronger team culture.',
    ],
    stack:
      'JS, TS, React, Tailwind, Node, Go (Fiber), Elixir (Phoenix), Python, Redis, Postgres, SQLite, Prisma, MongoDB, Docker, AWS, GCP, AI/ML',
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

export const projects = [
  {
    name: 'Photon Client → Elixir Phoenix',
    blurb:
      'Scalable real-time system replacing Photon Client SDK, massive concurrency with channels and ETS.',
  },
  {
    name: 'Arthur Vibe',
    blurb:
      'End-to-end async collaboration: multi-model AI, self-hosted services, advanced reporting.',
  },
  {
    name: 'Solar Design Tool (pvx.ai)',
    blurb: 'Web PV design with rich UI and real-time engineering calculations.',
  },
] as const

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
