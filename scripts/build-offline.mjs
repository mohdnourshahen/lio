// Builds the downloadable single-file edition of the site: offline/lon-visuals.html.
//
//   node scripts/build-offline.mjs
//
// 1. embeds every image (960w WebP) and client logo as data URIs in .offline/assets.json
// 2. runs `nuxt generate` with LON_OFFLINE=1 (client-rendered, hash router, one JS chunk)
// 3. inlines the CSS, JS, Slack font and favicon into a single HTML file that opens from disk
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const pub = join(root, 'public')
const dataUri = (file, type) => `data:${type};base64,${readFileSync(file).toString('base64')}`

// 1 — asset map
const media = JSON.parse(readFileSync(join(pub, 'media/media.json'), 'utf8'))
const assets = { media: {}, files: {} }
for (const [id, info] of Object.entries(media)) {
  assets.media[id] = dataUri(join(pub, `media/${id}-${info.widths[0]}.webp`), 'image/webp')
}
for (const f of readdirSync(join(pub, 'clients'))) {
  assets.files[`/clients/${f}`] = dataUri(join(pub, 'clients', f), 'image/svg+xml')
}
mkdirSync(join(root, '.offline'), { recursive: true })
writeFileSync(join(root, '.offline/assets.json'), JSON.stringify(assets))

// 2 — offline build
const build = spawnSync('npx', ['nuxi', 'generate'], {
  cwd: root, stdio: 'inherit', env: { ...process.env, LON_OFFLINE: '1', NUXT_TELEMETRY_DISABLED: '1' },
})
if (build.status !== 0) process.exit(build.status ?? 1)

// 3 — inline everything into one document
const out = join(root, '.output-offline/public')
let html = readFileSync(join(out, 'index.html'), 'utf8')
const local = href => join(out, href.replace(/^\//, ''))
const font = dataUri(join(pub, 'fonts/slack-light.woff2'), 'font/woff2')

html = html.replace(/<link rel="stylesheet" href="([^"]+)"[^>]*>/g, (_, href) => {
  const css = readFileSync(local(href), 'utf8').replaceAll('/fonts/slack-light.woff2', font)
  return `<style>${css}</style>`
})
html = html.replace(/<script type="module" src="([^"]+)"[^>]*><\/script>/g, (_, src) => {
  const js = readFileSync(local(src), 'utf8').replaceAll('</script', '<\\/script')
  return `<script type="module">${js}</script>`
})
html = html
  .replace(/<link rel="(?:modulepreload|preload|prefetch|manifest|apple-touch-icon|alternate)"[^>]*>/g, '')
  .replace(/<link rel="icon"[^>]*>/g, '')
  .replace('</head>', `<link rel="icon" type="image/svg+xml" href="${dataUri(join(pub, 'favicon.svg'), 'image/svg+xml')}"></head>`)

const left = [...html.matchAll(/(?:src|href)="(\/_nuxt\/[^"]+)"/g)].map(m => m[1])
if (left.length) throw new Error(`unresolved build assets: ${left.join(', ')}`)

mkdirSync(join(root, 'offline'), { recursive: true })
writeFileSync(join(root, 'offline/lon-visuals.html'), html)
console.log(`offline/lon-visuals.html — ${(Buffer.byteLength(html) / 1e6).toFixed(1)} MB`)
