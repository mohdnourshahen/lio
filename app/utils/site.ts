import projectsJson from '../../content/projects.json'
import mediaJson from '../../public/media/media.json'

/** All copy here comes from the legacy Lōn Visuals site (legacy/lon-visuals-final.html). */

export interface MediaRef { id: string, alt: string }
export interface TextBlock { type: 'text', label: string | null, title: string | null, paras: string[], tags: string[] }
export interface MediaBlock { type: 'media', layout: 'full' | 'pair' | 'trio' | 'grid', images: MediaRef[], caption: string | null }
export interface ListItem { num?: string, name: string, desc?: string | null, ar?: string, color?: string }
export interface ListBlock { type: 'list', label: string | null, title: string | null, items: ListItem[] }
export interface PaletteBlock { type: 'palette', swatches: { hex: string, name: string | null }[] }
export type Block = TextBlock | MediaBlock | ListBlock | PaletteBlock

export interface Project {
  key: string
  slug: string
  title: string
  category: string
  lede: string
  year: string
  meta: [string, string][]
  info: [string, string][]
  hero: string
  next: string | null
  credits: { role: string, name: string, href: string | null }[]
  blocks: Block[]
}

export interface MediaInfo { w: number, h: number, widths: number[], color: string }

export const media = mediaJson as Record<string, MediaInfo>
export const projects = projectsJson as unknown as Project[]
export const projectBySlug = (slug: string) => projects.find(p => p.slug === slug)

export const site = {
  name: 'Lōn Visuals',
  tagline: 'Visual Strategy Studio',
  description: 'At Lōn Visuals, creativity meets strategy to shape how organizations communicate, evolve, and grow through design.',
  email: 'hello@lonvisuals.com',
  city: 'Amman',
  country: 'Jordan',
  countryCode: 'JO',
  socials: [
    { name: 'Instagram', href: 'https://www.instagram.com/lonvisuals/' },
    { name: 'Behance', href: 'https://www.behance.net/lon-visuals' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/l%C5%8Dnvisuals' },
  ],
}

export const nav = [
  { label: 'Work', to: '/#work' },
  { label: 'Services', to: '/#services' },
  { label: 'Studio', to: '/#studio' },
  { label: 'Contact', to: '/#contact' },
]

export const stats = [
  { value: '8', unit: '+', desc: ['Years of strategic', 'brand practice'] },
  { value: '60', unit: '+', desc: ['Brands built across', 'the region & beyond'] },
  { value: '12', unit: '+', desc: ['Industries served,', 'from gov to tech'] },
  { value: '100', unit: '%', desc: ['Long-term client', 'partnerships'] },
]

export const marquee = ['Brand Identity', 'Visual Strategy', 'Brand Systems', 'Print & Editorial', 'Creative Direction']

export const services = [
  { num: '01', name: 'Strategy', desc: 'Brand Strategy — defining direction, positioning, and the visual foundations that guide how brands communicate.' },
  { num: '02', name: 'Design', desc: 'Visual Identity & Communication Design — complete brand systems, corporate collateral, and all designed touchpoints.' },
  { num: '03', name: 'Support', desc: 'Corporate Visual Support & Brand Evolution — ongoing partnership to keep brands consistent and current.' },
  { num: '04', name: 'Experience', desc: 'Brand Experience & Events, Corporate & Employee Kits — bringing the brand to life in physical spaces.' },
]

/** Homepage "Selected Projects", in the legacy order. Two have no case study yet. */
export const selectedWork = [
  { title: 'Zeryab Estates', category: 'Brand Identity · Real Estate', image: 'ab4f72775a', slug: 'zeryab-estates' },
  { title: 'Masar Resort', category: 'Brand Identity · Hospitality', image: '76a786afab', slug: 'masar' },
  { title: 'Lazure Hospitality', category: 'Brand Identity · Hospitality', image: '7e084baf44', slug: 'lazure' },
  { title: 'Sky Falcons', category: 'Visual Identity · Aviation', image: '0f50a57577', slug: 'sky-falcons' },
  { title: 'Rambourg Foundation', category: 'Brand Identity · Foundation', image: '5749a13a08', slug: 'rambourg' },
  { title: 'National Cyber Security Center', category: 'Identity · Government', image: 'ee591a3a9d', slug: null },
  { title: 'Zain Alsharaf Center', category: 'Brand Identity · Culture', image: 'f86a45667b', slug: null },
  { title: 'Wakers17', category: 'Brand Identity · F&B', image: '98976587d0', slug: 'wakers17' },
  { title: 'Sana Interiors', category: 'Brand Identity · Interior Design', image: 'bc30f624ae', slug: 'sana-interiors' },
]

export const clients = [
  'Joramco', 'Friedrich Naumann Foundation Jordan', 'Rababa', 'National Cyber Security Center', 'NEOM',
  'Norwegian Refugee Council', 'Globitel', 'Rambourg Foundation', 'DAI', 'UNFPA', 'Omantel', 'Aircraft Marketing',
  'SkyFalcons', 'World Health Organization', 'Halcyon', 'Save the Children', 'Art Engine Media & Films', 'Brinc', 'Tabuk', 'Roycelysian',
].map((name, i) => ({ name, src: `/clients/${String(i + 1).padStart(2, '0')}.svg` }))

export const HERO_IMAGE = 'b42e0ba664'
