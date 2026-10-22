// Open to search engines and to AI search / answer engines, so the studio can be found and cited.
// To opt out of model *training* while staying visible in AI search, add Disallow: / under
// GPTBot, ClaudeBot, Google-Extended, CCBot and Applebot-Extended — the search/retrieval agents
// (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot) are separate.
const AGENTS = [
  'Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot',
  'OAI-SearchBot', 'ChatGPT-User', 'GPTBot',
  'Claude-SearchBot', 'Claude-User', 'ClaudeBot',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended', 'CCBot', 'meta-externalagent', 'Amazonbot', 'MistralAI-User',
]

export default defineEventHandler((event) => {
  const base = siteUrl(event)
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return [
    ...AGENTS.map(a => `User-agent: ${a}\nAllow: /\n`),
    'User-agent: *\nAllow: /\n',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n')
})
