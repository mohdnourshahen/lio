// llms.txt (https://llmstxt.org): a plain-markdown map of the site for language models.
export default defineEventHandler((event) => {
  const base = siteUrl(event)
  setHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  return `# ${studio.name}

> ${studio.summary}

We translate brands into visual language. Lōn Visuals works across brand strategy, visual identity, communication design and brand experience for government entities, hospitality, aviation, NGOs and private brands in Jordan, Saudi Arabia, Morocco and the wider MENA region. Contact: ${studio.email}.

## Studio

- [Home](${base}/): who we are, services, selected projects, clients and contact
- [Full text for language models](${base}/llms-full.txt): every page's copy in one file

## Solutions

${solutions.map(so => `- [${so.title}](${base}/solutions/${so.slug}): ${so.description}`).join('\n')}

## Case studies

${projects.map(p => `- [${p.title}](${base}/work/${p.slug}): ${p.category}${p.year ? `, ${p.year}` : ''}. ${p.lede}`).join('\n')}

## Services

${studio.services.map(([n, d]) => `- ${n}: ${d}`).join('\n')}

## Elsewhere

${studio.socials.map(s => `- ${s}`).join('\n')}
`
})
