import projects from './content/projects.json'

// Static output (`nuxt generate` → .output/public) served by nginx on Fly.io.
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  ssr: true,

  css: [
    '@fontsource/cormorant-garamond/300.css',
    '@fontsource/cormorant-garamond/300-italic.css',
    '@fontsource/cormorant-garamond/400.css',
    '@fontsource/cormorant-garamond/400-italic.css',
    '@fontsource-variable/inter-tight/index.css',
    '~/assets/css/main.css',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      title: 'Lōn Visuals — Visual Strategy Studio',
      meta: [
        { name: 'description', content: 'At Lōn Visuals, creativity meets strategy to shape how organizations communicate, evolve, and grow through design.' },
        { name: 'theme-color', content: '#18160e' },
        { property: 'og:site_name', content: 'Lōn Visuals' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'alternate', type: 'text/markdown', href: '/llms.txt', title: 'llms.txt' },
      ],
      // Flags the document before hydration so the preloader and hidden reveal states never flash.
      script: [{ innerHTML: "document.documentElement.classList.add('js')", tagPosition: 'head' }],
    },
  },

  runtimeConfig: {
    public: {
      // Canonical origin used in canonical links, Open Graph, JSON-LD, sitemap and llms.txt.
      // Override at build time with the NUXT_PUBLIC_SITE_URL environment variable.
      siteUrl: 'https://lonvisuals.com',
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', ...projects.map(p => `/work/${p.slug}`), '/sitemap.xml', '/robots.txt', '/llms.txt', '/llms-full.txt'],
    },
  },

  vite: {
    build: { assetsInlineLimit: 0 },
  },
})
