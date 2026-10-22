# Lōn Visuals — v2

Static site for Lōn Visuals, built with Nuxt 4 (`nuxt generate`) and GSAP 3.13, served by nginx on Fly.io.

The design and motion system follows Exo Ape's (exoape.com), recovered from its production bundles:
12-column / 8.333vw-margin grid (10 columns on mobile), viewport-relative type scale, the three custom
eases, the clip-path + 7° page transition, the "next project" hand-off, the 0.1-lerp smooth scroll,
line-by-line text reveals, masked image parallax, the cursor bubble and the tilting menu.
Content, colours and imagery are Lōn's. Type: Slack Light (Lōn's licensed face, `public/fonts`) for upright
titles and uppercase subtitles, Cormorant Garamond italic for accents, Inter Tight for reading text.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static output in .output/public
npm run typecheck
```

`NUXT_PUBLIC_SITE_URL` sets the canonical origin used in canonical links, Open Graph, JSON-LD,
`sitemap.xml` and `llms.txt` (default `https://lonvisuals.com`).

## Layout

- `app/pages/index.vue` — homepage; `app/pages/work/[slug].vue` — case studies (`/work/<slug>`)
- `app/utils/scroll.ts` — smooth scroll; `app/plugins/motion.ts` — `v-reveal` / `v-parallax`
- `app/app.vue` — page transitions, menu choreography
- `content/projects.json` — case-study content; `public/media` — responsive AVIF/WebP images
- `server/routes` — prerendered `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`
- `legacy/` — the v1 single-file pages the content was extracted from

## Regenerating content and assets from `legacy/`

```bash
python3 scripts/extract_media.py legacy <raw-dir> <clean-dir>   # base64 images -> files
python3 scripts/optimise_media.py <raw-dir> public/media        # AVIF + WebP, media.json
python3 scripts/build_content.py <clean-dir> content            # projects.json
python3 scripts/extract_clients.py legacy/lon-visuals-final.html public/clients
python3 scripts/make_brand_assets.py                            # favicons, logo.png, og/*.jpg
```

## Deploy

Pushing to `main` runs `.github/workflows/fly-deploy.yml`; the Dockerfile builds the static site
and serves it from nginx (`nginx.conf`), which also 301s the v1 URLs to their v2 routes.
