import photonElixirPhoenix from './photon-elixir-phoenix.mmd?raw'

/**
 * Flowchart body only per slug; runtime applies `buildThemedMermaidDefinition` for light/dark.
 */
export const projectArchitectureMermaidBody: Partial<Record<string, string>> = {
  'photon-elixir-phoenix': photonElixirPhoenix.trim(),
}

export function getArchitectureMermaidBodyForProject(
  slug: string,
): string | undefined {
  return projectArchitectureMermaidBody[slug]
}
