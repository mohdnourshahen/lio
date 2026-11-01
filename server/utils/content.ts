import projectsJson from '../../content/projects.json'
import solutionsJson from '../../content/solutions.json'

export interface ServerProject {
  slug: string
  title: string
  category: string
  lede: string
  year: string
  hero: string
  meta: [string, string][]
  info: [string, string][]
  blocks: { type: string, images?: { id: string, alt?: string }[], label?: string | null, title?: string | null, paras?: string[], tags?: string[], items?: { num?: string, name: string, desc?: string | null }[] }[]
}

export const projects = projectsJson as unknown as ServerProject[]

export function siteUrl(event: Parameters<typeof useRuntimeConfig>[0]) {
  return useRuntimeConfig(event).public.siteUrl.replace(/\/$/, '')
}

/** Build date stamped into the sitemap — the content only changes when the site is rebuilt. */
export const buildDate = new Date().toISOString().slice(0, 10)

export const studio = {
  name: 'Lōn Visuals',
  summary: 'Lōn Visuals is a strategic brand and visual communication studio based in Amman, Jordan. Creativity meets strategy to shape how organizations communicate, evolve, and grow through design.',
  email: 'hello@lonvisuals.com',
  stats: ['11+ years of strategic brand practice', '60+ brands built across the region & beyond', '12+ industries served, from government to tech', '100% long-term client partnerships'],
  services: [
    ['Strategy', 'Brand Strategy — defining direction, positioning, and the visual foundations that guide how brands communicate.'],
    ['Design', 'Visual Identity & Communication Design — complete brand systems, corporate collateral, and all designed touchpoints.'],
    ['Support', 'Corporate Visual Support & Brand Evolution — ongoing partnership to keep brands consistent and current.'],
    ['Experience', 'Brand Experience & Events, Corporate & Employee Kits — bringing the brand to life in physical spaces.'],
  ],
  disciplines: ['Brand Identity', 'Visual Strategy', 'Brand Systems', 'Print & Editorial', 'Creative Direction'],
  clients: ['Joramco', 'Friedrich Naumann Foundation Jordan', 'Rababa', 'National Cyber Security Center', 'NEOM', 'Norwegian Refugee Council', 'Globitel', 'Rambourg Fondation', 'DAI', 'UNFPA', 'Omantel', 'Aircraft Marketing', 'SkyFalcons', 'World Health Organization', 'Halcyon', 'Save the Children', 'Art Engine Media & Films', 'Brinc', 'Tabuk', 'Roycelysian'],
  socials: ['https://www.instagram.com/lonvisuals/', 'https://www.behance.net/lon-visuals', 'https://www.linkedin.com/company/l%C5%8Dnvisuals'],
}

/** Sector landing pages under /solutions. */
export const solutions = solutionsJson as unknown as { slug: string, title: string, sector: string, description: string, lede: string, hero: string, faq: { items: [string, string][] }, services: { items: [string, string][] }, touchpoints: { images: { id: string }[] }, portfolio?: { groups: { rows: { id: string }[][] }[] }, work: { items: { image: string }[] } }[]
