export default defineEventHandler((event) => {
  const base = siteUrl(event)
  const urls = [
    { loc: `${base}/`, priority: '1.0', image: `${base}/og/home.jpg` },
    ...projects.map(p => ({ loc: `${base}/work/${p.slug}`, priority: '0.8', image: `${base}/og/${p.slug}.jpg` })),
  ]
  const body = urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
    <image:image><image:loc>${u.image}</image:loc></image:image>
  </url>`).join('\n')
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`
})
