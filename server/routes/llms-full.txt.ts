// Every page's copy as one markdown document, for language models and answer engines.
export default defineEventHandler((event) => {
  const base = siteUrl(event)
  setHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  const cases = projects.map((p) => {
    const facts = [...p.meta, ...p.info].filter(([, v], i, all) => v && all.findIndex(([k]) => k === all[i]![0]) === i)
    const blocks = p.blocks.map((b) => {
      if (b.type === 'text') {
        return [b.label && `### ${b.label}${b.title ? ` — ${b.title}` : ''}`, !b.label && b.title && `### ${b.title}`, ...(b.paras || []), b.tags?.length ? `Disciplines: ${b.tags.join(', ')}` : '']
          .filter(Boolean).join('\n\n')
      }
      if (b.type === 'list') {
        return [`### ${b.title || b.label || 'Details'}`, (b.items || []).map(it => `- ${it.name}${it.desc ? `: ${it.desc}` : ''}`).join('\n')].join('\n\n')
      }
      return ''
    }).filter(Boolean).join('\n\n')
    return `## ${p.title}

URL: ${base}/work/${p.slug}
${p.category}${p.year ? ` · ${p.year}` : ''}

${facts.map(([k, v]) => `- ${k}: ${v}`).join('\n')}

${p.lede}

${blocks}`
  }).join('\n\n---\n\n')

  return `# ${studio.name} — full text

> ${studio.summary}

Website: ${base}/
Email: ${studio.email}
Location: Amman, Jordan

## About

Lōn Visuals is a strategic brand and visual communication studio dedicated to helping organizations communicate with clarity and impact. We combine creativity with structured thinking to build visual systems that support brands across their daily communication, corporate presence, and long-term evolution.

Lōn Visuals provides strategic design and visual communication services that help organizations maintain clarity, consistency, and strong brand presence across all visual touchpoints. We act as a reliable visual partner — translating ideas into clear, consistent, and meaningful design.

${studio.stats.map(s => `- ${s}`).join('\n')}

## Services

${studio.services.map(([n, d]) => `- ${n}: ${d}`).join('\n')}

Disciplines: ${studio.disciplines.join(', ')}.

## Clients

${studio.clients.join(', ')}.

## Case studies

${cases}
`
})
