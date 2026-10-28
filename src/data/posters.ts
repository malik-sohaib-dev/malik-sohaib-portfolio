// The project posters: a grayscale Blender scene that depicts each product as a sculpture
// (art/blender/poster.py, rendered by art/posters.sh), with the type in its own band below it.
// Representations, not screenshots: the real screens live on the case pages.
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
    caption: 'Online shops for small sellers in Pakistan, paid cash on delivery.',
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
    caption: 'Party games for friends, played on everyone’s phone.',
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
    caption: 'Memberships and renewals for a gym that ran on paper.',
    status: 'In hand-over',
    art: gpArt,
  },
  'photon-elixir-phoenix': {
    slug: 'photon-elixir-phoenix',
    title: 'Photon to Elixir',
    href: '/work/photon-elixir-phoenix',
    index: '04',
    kind: 'Real-time sync',
    meta: ['At Arthur'],
    caption: 'Real-time room and file sync, moved from Node to Elixir.',
    status: 'Shipped',
    art: phArt,
  },
  'arthur-vibe': {
    slug: 'arthur-vibe',
    title: 'Arthur Vibe',
    href: '/work/arthur-vibe',
    index: '05',
    kind: 'AI interviews',
    meta: ['At Arthur'],
    caption: 'An AI that interviews your team, then writes the report.',
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
    caption: 'Design a solar system, simulate it, print the report.',
    status: 'pvx.ai',
    art: bhArt,
  },
};
