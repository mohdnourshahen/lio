import projectsJson from '../../content/projects.json'
import mediaJson from '../../public/media/media.json'

/** All copy here comes from the legacy Lōn Visuals site (legacy/lon-visuals-final.html). */

export interface MediaRef { id: string, alt: string }
export interface TextBlock { type: 'text', label: string | null, title: string | null, paras: string[], tags: string[], links?: { label: string, href: string }[], surface?: string }
export interface MediaBlock { type: 'media', layout: 'full' | 'pair' | 'trio' | 'grid', images: MediaRef[], caption: string | null, surface?: string }
export interface ListItem { num?: string, name: string, desc?: string | null, ar?: string, color?: string }
export interface ListBlock { type: 'list', label: string | null, title: string | null, items: ListItem[], surface?: string }
export interface PaletteBlock { type: 'palette', swatches: { hex: string, name: string | null }[], surface?: string }
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
  heroMobile?: string
  heroFocus?: string
  /** darker shade under the title, for heroes with lettering of their own */
  heroDense?: boolean
  /** browser and search title when the default (title — category) runs past ~70 characters */
  seoTitle?: string
  /** page surface: omitted = the house dark tones, 'paper' = pure white, 'black' = pure black */
  theme?: 'paper' | 'black'
  /** a dark brand colour for the page surface (hex), e.g. '#06262d'; light text stays as on the house dark */
  surface?: string
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

/**
 * Homepage "Selected Projects", in the order the studio set. Cards without a slug have no case study yet.
 * Covers are chosen to sit inside the portrait frames without clipping a mark; `focus` is the
 * object-position when the frame still crops, `ratio: 'image'` shows the image uncropped.
 */
/** `more`: further images of the same project, revealed one after another while the cover is hovered ('<id>|<focus>' sets its framing) */
export interface WorkCard { title: string, category: string, image: string, slug: string | null, focus?: string, ratio?: 'image', more?: string[] }
export const selectedWork: WorkCard[] = [
  { title: 'Zeryab Estates', category: 'Brand Identity · Real Estate', image: '618ce8170b', slug: 'zeryab-estates', more: ['92b5c6a3f8', '140e246667', 'cae8301bfd'] },
  { title: 'Masar Resort', category: 'Brand Identity · Hospitality', image: '0793b8d88b', slug: 'masar', more: ['7160f3fd32', '00936a2911', 'b135b8813b'] },
  { title: 'FNF 40 Years in Jordan', category: 'Anniversary Branding · Foundation', image: '6983caa024', slug: 'fnf-jordan-40-years', more: ['ab1c1a45fb|90% 50%', 'fe973c4def', '1cc1dc1ce8|62% 50%', '51e60788f6|62% 50%'] },
  { title: 'Sky Falcons', category: 'Visual Identity · Aviation', image: '0f50a57577', slug: 'sky-falcons', more: ['639d8d09d7', 'cfba7fe891', 'a496defa86'] },
  { title: 'Lazure Hospitality', category: 'Brand Identity · Hospitality', image: '3b6d2e3e84', slug: 'lazure', focus: '52% 50%', more: ['f04c0008a2', '34e712ce6e', '22cc8dfc12'] },
  { title: 'Creativology', category: 'Rebranding · Digital Agency', image: '2f6d874695', slug: 'creativology', more: ['9ba29468b9', '0d67b93def', '77376c3732', 'cc7cab8295', 'b0cab47322', '8c6c72023f'] },
  { title: 'Ministry of Foreign Affairs and Expatriates', category: 'Visual Identity · Government', image: 'db0e23ca6f', slug: 'ministry-of-foreign-affairs-jordan', focus: '58% 50%', more: ['40a0e0f2bb'] },
  { title: 'Wakers17', category: 'Brand Identity · F&B', image: '9bbadab823', slug: 'wakers17', focus: '50% 30%', more: ['9b31bd7444|50% 60%', 'a16077e013', '8b66e321e7', '28c1c11c00'] },
  { title: 'Muscat Tech Week', category: 'Event Identity · Technology', image: '3ed6f77d67', slug: null, focus: '62% 50%' },
  { title: 'Sana Interiors', category: 'Brand Identity · Interior Design', image: '4e29c410bb', slug: 'sana-interiors', more: ['66a3bbd3ad', '58d0e9b72f', '4a1980355c', 'c04711e04a'] },
  { title: 'Rambourg Fondation', category: 'Brand Identity · Foundation', image: 'd4ea00b977', slug: 'rambourg', focus: '50% 50%', more: ['5bcb72c2f7', '0beaeaaa38', '4366bfe7e3', '149fdf4649'] },
  { title: 'National Cyber Security Center', category: 'Identity · Government', image: 'ee591a3a9d', slug: null, ratio: 'image' },
  { title: 'Zain Alsharaf Center', category: 'Brand Identity · Culture', image: 'f86a45667b', slug: null, ratio: 'image' },
]

export const clients = [
  'Joramco', 'Friedrich Naumann Foundation Jordan', 'Rababa', 'National Cyber Security Center', 'NEOM',
  'Norwegian Refugee Council', 'Globitel', 'Rambourg Fondation', 'DAI', 'UNFPA', 'Omantel', 'Aircraft Marketing',
  'SkyFalcons', 'World Health Organization', 'Halcyon', 'Save the Children', 'Art Engine Media & Films', 'Brinc', 'Tabuk', 'Roycelysian',
].map((name, i) => ({ name, src: `/clients/${String(i + 1).padStart(2, '0')}.svg` }))

export const HERO_IMAGE = 'b42e0ba664'
