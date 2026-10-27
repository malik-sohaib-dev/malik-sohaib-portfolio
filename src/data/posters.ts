// The project posters: grayscale art, a liquid-chrome object (art/blender), and real type.
// Hovering one floods in the real product from the pointer, so the poster sells and the product proves.
import type { ImageMetadata } from 'astro';
import ezChrome from '../assets/posters/ezvenda-chrome.webp';
import ezBg from '../assets/posters/ezvenda-bg.webp';
import mhChrome from '../assets/posters/mini-havoc-chrome.webp';
import mhBg from '../assets/posters/mini-havoc-bg.webp';
import gpChrome from '../assets/posters/gympaid-chrome.webp';
import phChrome from '../assets/posters/photon-elixir-phoenix-chrome.webp';
import viChrome from '../assets/posters/arthur-vibe-chrome.webp';
import bhChrome from '../assets/posters/bh-group-chrome.webp';
import ezDesktop from '../assets/work/ezvenda-desktop.webp';
import mhSumo from '../assets/work/mini-havoc-sumo.jpg';

export type Reveal =
  | { kind: 'image'; src: ImageMetadata; alt: string }
  | { kind: 'video'; src: string; poster: ImageMetadata; alt: string }
  | { kind: 'fact'; text: string };

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
  chrome: ImageMetadata;
  bg?: ImageMetadata;
  ground: 'dark' | 'light';
  reveal: Reveal;
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
    chrome: ezChrome,
    bg: ezBg,
    ground: 'dark',
    reveal: { kind: 'image', src: ezDesktop, alt: 'The home page of a shop built on EzVenda.' },
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
    chrome: mhChrome,
    bg: mhBg,
    ground: 'dark',
    reveal: { kind: 'video', src: '/media/mini-havoc-sumo', poster: mhSumo, alt: 'Gameplay of Sumo Out!' },
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
    chrome: gpChrome,
    ground: 'light',
    reveal: { kind: 'fact', text: 'Who owes you money today, answered in one screen.' },
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
    chrome: phChrome,
    ground: 'light',
    reveal: { kind: 'fact', text: 'Five environments on two clouds, one codebase.' },
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
    chrome: viChrome,
    ground: 'light',
    reveal: { kind: 'fact', text: 'Go Lambdas, Step Functions and pgvector, behind one provider adapter.' },
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
    chrome: bhChrome,
    ground: 'light',
    reveal: { kind: 'fact', text: 'Real-time solar calculations and generated electrical diagrams.' },
  },
};
