import arthurVibe from './arthur-vibe.mmd?raw'
import photonElixirPhoenix from './photon-elixir-phoenix.mmd?raw'

export type ProjectArchitectureDiagram = {
  mermaidBody: string
  description: string
  ariaLabel: string
}

/**
 * Flowchart body only per slug; runtime applies `buildThemedMermaidDefinition` for light/dark.
 */
const projectArchitectureDiagram: Partial<Record<string, ProjectArchitectureDiagram>> = {
  'photon-elixir-phoenix': {
    mermaidBody: photonElixirPhoenix.trim(),
    description:
      'Before: Photon via the JS SDK on Express, large in-memory snapshots, and many SSE streams per browser. After: Elixir datasync with a custom Photon client, Phoenix Channels, ETS for inactive/active/file lists, MongoDB, and cloud adapters — Express handles non-sync HTTP only.',
    ariaLabel:
      'Photon Client to Elixir Phoenix — system architecture before and after migration',
  },
  'arthur-vibe': {
    mermaidBody: arthurVibe.trim(),
    description:
      'Flow from vibe creation (Go Fiber, Postgres, MongoDB) through Three.js meetings and Lambdas; all Fiber and Lambda AI traffic passes through shared Go adapters for dynamic provider choice (OpenAI, Gemini, Anthropic). Transcripts land in S3 and are chunked into pgvector; Step Functions orchestrates batched reports, translation, and embeddings; React renders structured reports and a RAG assistant.',
    ariaLabel: 'Arthur Vibe — meeting, transcript processing, and report pipeline architecture',
  },
}

export function getArchitectureDiagramForProject(
  slug: string,
): ProjectArchitectureDiagram | undefined {
  return projectArchitectureDiagram[slug]
}
