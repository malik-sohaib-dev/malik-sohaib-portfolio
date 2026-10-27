// The project posters: grayscale Blender scenes (art/blender/poster.py, rendered by art/posters.sh)
// with real type on top. Representations, not screenshots: the real screens live on the case pages.
import type { ImageMetadata } from 'astro';
import ezArt from '../assets/posters/ezvenda-art.webp';
import mhArt from '../assets/posters/mini-havoc-art.webp';
import gpArt from '../assets/posters/gympaid-art.webp';
import phArt from '../assets/posters/photon-elixir-phoenix-art.webp';
import viArt from '../assets/posters/arthur-vibe-art.webp';
import bhArt from '../assets/posters/bh-group-art.webp';

export type Poster = {
  slug: string;
  title: string;
  href: string;
  /** Top-left: index and what it is. */
  index: string;
  kind: string;
  /** Top-right lines. */
  meta: string[];
  /** Bottom-left sentence. */
  caption: string;
  /** Bottom-right. */
  status: string;
  live?: boolean;
  art: ImageMetadata;
};

export const posters: Record<string, Poster> = {
  ezvenda: {
    slug: 'ezvenda',
    title: 'EzVenda',
    href: '/work/ezvenda',
    index: '01',
    kind: 'Commerce platform',
    meta: ['2026', 'Founder, design, code'],
    caption: 'Hosted shops with cash on delivery for small merchants in Pakistan.',
    status: 'Live',
    live: true,
    art: ezArt,
  },
  'mini-havoc': {
    slug: 'mini-havoc',
    title: 'Mini Havoc',
    href: '/work/mini-havoc',
    index: '02',
    kind: 'Multiplayer party games',
    meta: ['2026', 'Founder, design, code'],
    caption: 'Party games on everyone’s phone. 23 games, up to 24 players.',
    status: 'Live',
    live: true,
    art: mhArt,
  },
  gympaid: {
    slug: 'gympaid',
    title: 'GymPaid',
    href: '/work/gympaid',
    index: '03',
    kind: 'Gym memberships',
    meta: ['2026', 'Built in two days'],
    caption: 'A member who pays on the 31st stays on the 31st, even through February.',
    status: 'In hand-over',
    art: gpArt,
  },
  'photon-elixir-phoenix': {
    slug: 'photon-elixir-phoenix',
    title: 'Photon to Elixir',
    href: '/work/photon-elixir-phoenix',
    index: '04',
    kind: 'Real-time sync',
    meta: ['Arthur', 'Under NDA'],
    caption: 'Many long-lived streams on Node, moved to channels on the BEAM.',
    status: 'Shipped',
    art: phArt,
  },
  'arthur-vibe': {
    slug: 'arthur-vibe',
    title: 'Arthur Vibe',
    href: '/work/arthur-vibe',
    index: '05',
    kind: 'AI interviews',
    meta: ['Arthur', 'Under NDA'],
    caption: 'An AI that runs the interviews, then writes the report you can question.',
    status: 'Shipped',
    art: viArt,
  },
  'bh-group': {
    slug: 'bh-group',
    title: 'PV Smith',
    href: 'https://pvx.ai',
    index: '06',
    kind: 'Solar design tool',
    meta: ['BH Group', '2022 to 2023'],
    caption: 'Design and simulate a solar system, then print a 24-page report.',
    status: 'pvx.ai',
    art: bhArt,
  },
};
