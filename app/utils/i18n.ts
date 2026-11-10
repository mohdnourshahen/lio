/**
 * The site's two languages. English is the original; the Arabic is written in Arabic, not translated
 * line by line: concise, sound in grammar and usage, with rhetoric only where it serves the meaning.
 * Routes under /ar are Arabic and right-to-left; everything else is English.
 */
export type Lang = 'en' | 'ar'

export const langOf = (path: string): Lang => (path === '/ar' || path.startsWith('/ar/') ? 'ar' : 'en')
export const homeOf = (lang: Lang) => (lang === 'ar' ? '/ar' : '/')
/** the same page in the other language: every page exists in both (/, /work/*, /solutions/*) */
export const switchPath = (path: string) =>
  langOf(path) === 'ar' ? path.replace(/^\/ar/, '') || '/' : path === '/' ? '/ar' : `/ar${path}`

const en = {
  chrome: {
    nav: [
      { label: 'Work', to: '/#work' },
      { label: 'Solutions', to: '/solutions/hospitality-branding', children: [{ label: 'Hospitality', to: '/solutions/hospitality-branding' }, { label: 'Government', to: '/solutions/government-branding' }] },
      { label: 'Services', to: '/#services' },
      { label: 'Studio', to: '/#studio' },
      { label: 'Contact', to: '/#contact' },
    ],
    home: 'Home',
    menu: 'Menu',
    close: 'Close',
    follow: 'Follow',
    switchLabel: 'العربية',
    switchLang: 'ar',
    /** the edition switch: the label names the edition it switches to */
    toLight: 'Light',
    toDark: 'Dark',
    toLightLabel: 'Switch to the light edition',
    /** WhatsApp: the label, and the message a chat opens with */
    whatsapp: 'WhatsApp',
    whatsappCta: 'Message us on WhatsApp',
    whatsappHello: 'Hello Lōn, I’d like to talk about a project.',
    toDarkLabel: 'Switch to the dark edition',
    footer: {
      kicker: 'Let’s Talk',
      title: ['Have a project', 'in mind?'],
      sub: 'We’d love to hear about it. Let’s build something extraordinary together.',
      studio: 'Studio',
      navigate: 'Navigate',
      place: 'Amman, Jordan',
      rights: 'Lōn Visuals. All rights reserved.',
    },
  },
}

type Chrome = typeof en.chrome

const ar: { chrome: Chrome } = {
  chrome: {
    nav: [
      { label: 'الأعمال', to: '/ar#work' },
      { label: 'الحلول', to: '/ar/solutions/hospitality-branding', children: [{ label: 'الضيافة', to: '/ar/solutions/hospitality-branding' }, { label: 'الحكومات', to: '/ar/solutions/government-branding' }] },
      { label: 'الخدمات', to: '/ar#services' },
      { label: 'الاستوديو', to: '/ar#studio' },
      { label: 'تواصل', to: '/ar#contact' },
    ],
    home: 'الرئيسية',
    menu: 'القائمة',
    close: 'إغلاق',
    follow: 'تابعنا',
    switchLabel: 'English',
    switchLang: 'en',
    toLight: 'فاتح',
    toDark: 'داكن',
    toLightLabel: 'التبديل إلى النسخة الفاتحة',
    whatsapp: 'واتساب',
    whatsappCta: 'راسلنا على واتساب',
    whatsappHello: 'مرحبًا لُون، أودّ الحديث عن مشروع.',
    toDarkLabel: 'التبديل إلى النسخة الداكنة',
    footer: {
      kicker: 'لنتحدّث',
      title: ['مشروعك', 'يستحق لغته'],
      sub: 'حدّثنا عنه، ولنبنِ معًا ما يبقى.',
      studio: 'الاستوديو',
      navigate: 'تصفّح',
      place: 'عمّان، الأردن',
      rights: 'لُون. جميع الحقوق محفوظة.',
    },
  },
}

export const chrome = { en: en.chrome, ar: ar.chrome }

/* ---------- homepage ---------- */
export const homeCopy = {
  en: {
    seoTitle: 'Lōn Visuals | Branding & Visual Identity Studio in Amman, Jordan',
    seoDescription: 'Branding and visual identity studio in Amman, Jordan: brand strategy, identity systems, guidelines and brand experience for leading organisations across MENA.',
    ogAlt: 'Lōn Visuals: we translate brands into visual language',
    kicker: 'Visual Strategy Studio · Amman',
    title: ['We translate', 'brands into', 'visual language'],
    accentLine: 2,
    caps: 'Strategic brand & visual communication studio',
    est: 'Est. Amman 2015',
    scroll: 'Scroll',
    loc: '2026 · Amman, JO',
    statement: 'At Lōn Visuals, creativity meets strategy to shape how organisations communicate, evolve and grow through design.',
    stats: [
      ['Years of strategic', 'brand practice'],
      ['Brands built across', 'the region & beyond'],
      ['Industries served,', 'from government to tech'],
      ['Long-term client', 'partnerships'],
    ],
    marquee: ['Brand Identity', 'Visual Strategy', 'Brand Systems', 'Print & Editorial', 'Creative Direction'],
    workLabel: 'Selected Projects',
    workTitle: ['Our ', 'Work'],
    reelLabel: 'The Lōn equation',
    reel: ['Creativity', 'Strategy'],
    servicesLabel: 'Services',
    servicesTitle: ['What We ', 'Do'],
    servicesLead: ['Lōn Visuals offers ', 'strategic design and visual communication', ' that keep organisations clear, consistent and present across every visual touchpoint.'],
    servicesSub: 'A reliable visual partner, translating ideas into clear, consistent and meaningful design.',
    services: null as null | { name: string, desc: string }[],
    clientsLabel: 'Clients',
    clientsTitle: 'Trusted by leading organisations',
    studioLabel: 'Studio · Est. Amman 2015',
    studioTitle: ['Creativity.', 'Direction.', 'Design.'],
    studioBody: 'Lōn Visuals is a strategic brand and visual communication studio. We help organisations communicate with clarity and impact, pairing creativity with structured thinking to build visual systems that support a brand in its daily communication, its corporate presence and its long-term growth.',
  },
  ar: {
    seoTitle: 'لُون | استوديو الهوية البصرية والعلامات التجارية في عمّان',
    seoDescription: 'استوديو للهوية البصرية والعلامة التجارية في عمّان: استراتيجية العلامة، وأنظمة الهوية، والأدلة الإرشادية، وتجربة العلامة لمؤسساتٍ رائدة في المنطقة.',
    ogAlt: 'لُون: نمنح كلّ علامة لونها',
    kicker: 'استوديو الاستراتيجية البصرية · عمّان',
    // «لُون» and «لَون»: the studio's name and the word for colour, and colour in Arabic is also character
    title: ['نمنح', 'كلّ علامة', 'لونها'],
    accentLine: 2,
    caps: 'نُترجِمُ العلاماتِ إلى لغةٍ تُرى',
    est: 'تأسّس في عمّان 2015',
    scroll: 'مرّر',
    loc: 'عمّان، الأردن',
    statement: 'الإبداعُ بلا استراتيجيةٍ زينة، والاستراتيجيةُ بلا إبداعٍ صمت؛ وفي لُون يجتمعان.',
    stats: [
      ['عامًا من الممارسة', 'الاستراتيجية للعلامات'],
      ['علامةً بنيناها في المنطقة', 'وخارجها'],
      ['قطاعًا خدمناه،', 'من الحكومة إلى التقنية'],
      ['من شراكاتنا', 'ممتدّة'],
    ],
    marquee: ['هوية العلامة', 'الاستراتيجية البصرية', 'أنظمة العلامة', 'الطباعة والنشر', 'الإدارة الإبداعية'],
    workLabel: 'مشاريع مختارة',
    workTitle: ['', 'أعمالنا'],
    reelLabel: 'معادلة لُون',
    reel: ['إبداع', 'استراتيجية'],
    servicesLabel: 'الخدمات',
    servicesTitle: ['ما ', 'نتقنه'],
    servicesLead: ['نقدّم ', 'التصميم الاستراتيجي والتواصل البصري', '، فنمنح المؤسساتِ وضوحًا واتساقًا وحضورًا راسخًا في كلّ ما يراه جمهورها.'],
    servicesSub: 'شريكٌ بصريٌّ يُعتمد عليه، يحوّل الفكرة إلى تصميمٍ واضحٍ متّسقٍ ذي معنى.',
    services: [
      { name: 'الاستراتيجية', desc: 'استراتيجية العلامة: نرسم الاتجاه والتموضع والأسس البصرية التي يقوم عليها تواصل العلامة.' },
      { name: 'التصميم', desc: 'الهوية البصرية وتصميم التواصل: أنظمةُ هويةٍ متكاملة، ومطبوعاتٌ مؤسسية، وكلُّ ما تلمسه العلامة من تفاصيل.' },
      { name: 'المرافقة', desc: 'الدعم البصري المؤسسي وتطوّر العلامة: شراكةٌ مستمرة تُبقي العلامة متّسقةً، مواكِبةً لزمنها.' },
      { name: 'التجربة', desc: 'تجربة العلامة والفعاليات والحقائب المؤسسية: نُحيي العلامة في المكان، فتُرى وتُلمَس.' },
    ] as null | { name: string, desc: string }[],
    clientsLabel: 'العملاء',
    clientsTitle: 'مؤسساتٌ رائدة اختارتنا شريكًا',
    studioLabel: 'الاستوديو · تأسّس في عمّان 2015',
    studioTitle: ['إبداع.', 'توجيه.', 'تصميم.'],
    studioBody: 'لُون استوديو للعلامة الاستراتيجية والتواصل البصري، غايتُه أن تتحدّث المؤسساتُ بوضوحٍ وأثر. نمزج الإبداعَ بالتفكير المنهجي، فنبني أنظمةً بصريةً ترافق العلامة في تواصلها اليومي، وحضورها المؤسسي، وتطوّرها على المدى البعيد.',
  },
}

/* project names that carry an official Arabic name; the rest keep their Latin brand names */
const titleAr: Record<string, string> = {
  'Masar Resort': 'منتجع مسار',
  'FNF 40 Years in Jordan': 'مؤسسة فريدريش ناومان · 40 عامًا في الأردن',
  'Ministry of Foreign Affairs and Expatriates': 'وزارة الخارجية وشؤون المغتربين',
  'National Cyber Security Center': 'المركز الوطني للأمن السيبراني',
}
const termAr: Record<string, string> = {
  'Brand Identity': 'هوية العلامة',
  'Visual Identity': 'الهوية البصرية',
  'Identity': 'الهوية',
  'Anniversary Branding': 'هوية الذكرى السنوية',
  'Rebranding': 'تجديد العلامة',
  'Event Identity': 'هوية الفعاليات',
  'Real Estate': 'العقارات',
  'Hospitality': 'الضيافة',
  'Foundation': 'المؤسسات',
  'Aviation': 'الطيران',
  'Digital Agency': 'الوكالات الرقمية',
  'Government': 'القطاع الحكومي',
  'F&B': 'المطاعم والمقاهي',
  'Technology': 'التقنية',
  'Interior Design': 'التصميم الداخلي',
}
export const workTitle = (title: string, lang: Lang) => (lang === 'ar' ? titleAr[title] ?? title : title)
export const workCategory = (cat: string, lang: Lang) =>
  lang === 'ar' ? cat.split(' · ').map(t => termAr[t] ?? t).join(' · ') : cat

/* ---------- inner pages: Arabic text layered over the English content ----------
   content/ar/<name>.json maps each English string of a page to its Arabic; common.json holds the
   terms every page shares. Structure, images and order stay in the English source, so the two
   editions can never drift; a string without an entry (a brand name, an address) stays as it is. */
const arDicts = import.meta.glob<Record<string, string>>('../../content/ar/*.json', { eager: true, import: 'default' })
const dict = (name: string) => ({ ...arDicts['../../content/ar/common.json'], ...arDicts[`../../content/ar/${name}.json`] })
const KEEP = new Set(['id', 'slug', 'key', 'href', 'hex', 'image', 'hero', 'heroMobile', 'next', 'to', 'theme', 'surface', 'layout', 'type', 'color'])
export function localize<T>(o: T, lang: Lang, name: string): T {
  if (lang !== 'ar') return o
  const d = dict(name)
  const walk = (v: unknown, k?: string): unknown =>
    typeof v === 'string' ? (k && KEEP.has(k) ? v : d[v] ?? v)
      : Array.isArray(v) ? v.map(x => walk(x))
        : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([kk, x]) => [kk, walk(x, kk)]))
          : v
  return walk(o) as T
}
/** strings of a page that have no Arabic yet: mirrored by scripts/check_ar.py */
export const arMissing = (o: unknown, name: string) => {
  const d = dict(name), out: string[] = []
  const walk = (v: unknown, k?: string) => {
    if (typeof v === 'string') { if (!(k && KEEP.has(k)) && /[A-Za-z]{3}/.test(v) && !d[v]) out.push(v) }
    else if (Array.isArray(v)) v.forEach(x => walk(x))
    else if (v && typeof v === 'object') Object.entries(v).forEach(([kk, x]) => walk(x, kk))
  }
  walk(o)
  return [...new Set(out)]
}

/* interface words of the case-study and solution pages */
export const pageCopy = {
  en: { work: 'Work', solutions: 'Solutions', overview: 'Project overview', disciplines: 'Disciplines', details: 'Details', palette: 'Colour palette', credits: 'Credits', next: 'Next project', nextCursor: 'Next', view: 'View', seeWork: 'See the work', solutionOverview: 'Overview', start: 'Start a project', allWork: 'All work' },
  ar: { work: 'الأعمال', solutions: 'الحلول', overview: 'نظرة على المشروع', disciplines: 'التخصصات', details: 'التفاصيل', palette: 'لوحة الألوان', credits: 'فريق العمل', next: 'المشروع التالي', nextCursor: 'التالي', view: 'شاهد', seeWork: 'شاهد الأعمال', solutionOverview: 'نظرة عامة', start: 'ابدأ مشروعك', allWork: 'كل الأعمال' },
}
