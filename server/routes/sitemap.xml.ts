import mediaJson from '../../public/media/media.json'

const media = mediaJson as Record<string, { w: number, h: number, widths: number[] }>

/* every image a page shows, at its largest encoded width, so Google Images can index the work itself */
const imageUrl = (base: string, id: string) => {
  const m = media[id]
  return m ? `${base}/media/${id}-${Math.max(...m.widths)}.webp` : undefined
}
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default defineEventHandler((event) => {
  const base = siteUrl(event)
  const pageImages = (p: typeof projects[number]) => [...new Set([p.hero, ...p.blocks.flatMap(b => ('images' in b && b.images ? (b.images as { id: string }[]).map(i => i.id) : []))])]
  /* every page is listed in both languages, each entry naming its counterpart (hreflang) */
  const pair = (en: string, priority: string, images: (string | undefined)[]) => {
    const ar = en === '/' ? '/ar' : `/ar${en}`
    const alt = { en: `${base}${en}`, ar: `${base}${ar}` }
    return [{ loc: alt.en, priority, images, alt }, { loc: alt.ar, priority, images, alt }]
  }
  const urls = [
    ...pair('/', '1.0', [`${base}/og/home.jpg`, ...projects.map(p => imageUrl(base, p.hero))]),
    ...projects.flatMap(p => pair(`/work/${p.slug}`, '0.8', [`${base}/og/${p.slug}.jpg`, ...pageImages(p).map(id => imageUrl(base, id))])),
    ...solutions.flatMap(so => pair(`/solutions/${so.slug}`, '0.9', [`${base}/og/solutions-${so.slug}.jpg`, ...[so.hero, ...so.work.items.map(w => w.image), ...so.touchpoints.images.map(i => i.id), ...(so.portfolio?.groups.flatMap(g => g.rows.flat().map(i => i.id)) ?? [])].map(id => imageUrl(base, id))])),
  ]
  const body = urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${u.alt.en}"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${u.alt.ar}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${u.alt.en}"/>
${[...new Set(u.images.filter(Boolean))].map(i => `    <image:image><image:loc>${esc(i!)}</image:loc></image:image>`).join('\n')}
  </url>`).join('\n')
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`
})
