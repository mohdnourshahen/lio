import { resolve } from 'node:path'
import process from 'node:process'
import projects from './content/projects.json'

/**
 * LON_OFFLINE=1 builds the downloadable single-file edition (scripts/build-offline.mjs):
 * client-rendered with a hash router so every page works from file://, one JS chunk and
 * every asset inlined. The default build is the static site served by nginx on Fly.io.
 */
const offline = process.env.LON_OFFLINE === '1'
const GA_ID = 'G-N31DVNBJV4'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  ssr: !offline,

  alias: {
    '#offline-assets': offline ? resolve('.offline/assets.json') : resolve('app/utils/offline-empty.json'),
  },

  router: offline ? { options: { hashMode: true } } : {},

  experimental: offline ? { appManifest: false, payloadExtraction: false } : {},

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
        { name: 'theme-color', content: '#12100a' },
        { property: 'og:site_name', content: 'Lōn Visuals' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      // the single-file edition embeds its own favicon and font; these would point at files that don't exist there
      link: offline ? [] : [
        { rel: 'preload', href: '/fonts/slack-light.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'alternate', type: 'text/markdown', href: '/llms.txt', title: 'llms.txt' },
      ],
      // Flags the document before hydration so the preloader and hidden reveal states never flash.
      script: [
        { innerHTML: "document.documentElement.classList.add('js')", tagPosition: 'head' },
        // Google Analytics 4 on every page of the live site; GA's enhanced measurement records the
        // client-side route changes between pages. Not in the offline file edition.
        ...(offline ? [] : [
          { src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, async: true, tagPosition: 'head' as const },
          { innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`, tagPosition: 'head' as const },
        ]),
      ],
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
    ...(offline ? { output: { dir: '.output-offline' } } : {}),
    prerender: {
      crawlLinks: true,
      routes: ['/', ...projects.map(p => `/work/${p.slug}`), '/sitemap.xml', '/robots.txt', '/llms.txt', '/llms-full.txt'],
    },
  },

  vite: {
    build: offline
      ? { assetsInlineLimit: 100_000_000, cssCodeSplit: false, rollupOptions: { output: { inlineDynamicImports: true } } }
      : { assetsInlineLimit: 0 },
  },
})
