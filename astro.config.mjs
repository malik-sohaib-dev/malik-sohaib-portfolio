// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// `site` feeds the canonical links, the share-card URLs, the structured data and the sitemap, so it
// must be an address that answers. SITE_URL wins if set; on Vercel it is the project's production
// domain (Vercel names the custom domain there once one is attached, if the project exposes system
// environment variables); otherwise the live vercel.app address. Once maliksohaib.com points here,
// set SITE_URL=https://maliksohaib.com in Vercel if the production domain does not follow by itself.
const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site = process.env.SITE_URL ?? (production ? `https://${production}` : 'https://malik-sohaib.vercel.app');

export default defineConfig({
  site,
  integrations: [sitemap()],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  build: { inlineStylesheets: 'auto' },
});
