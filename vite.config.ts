import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const origin = (env.VITE_SITE_ORIGIN ?? '').replace(/\/$/, '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-social-meta',
        transformIndexHtml(html) {
          const ogImage = origin ? `${origin}/og-image.png` : '/og-image.png'
          const canonicalBlock = origin
            ? `    <link rel="canonical" href="${origin}/" />
    <meta property="og:url" content="${origin}/" />`
            : ''
          return html
            .replace('<!-- __SOCIAL_CANONICAL__ -->', canonicalBlock)
            .replaceAll('__OG_IMAGE__', ogImage)
        },
      },
    ],
  }
})
