<script setup lang="ts">
import { EASE, clamp, gsap, isMobileWidth, prefersReducedMotion } from '~/utils/motion'
import { onFrame, scrollToElement } from '~/utils/scroll'
import { appState } from '~/utils/state'
import { media, projectBySlug, projects, site } from '~/utils/site'

const route = useRoute()
const project = projectBySlug(String(route.params.slug))
if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
const p = project
const next = p.next ? projectBySlug(p.next) : projects[(projects.indexOf(p) + 1) % projects.length]

/* Hero meta: Exo Ape's Client / Services / Industries / Date columns, from Lōn's own fields. */
const facts = computed(() => {
  const seen = new Set<string>()
  const rows: [string, string][] = []
  for (const [k, v] of [...p.meta, ...p.info]) {
    const key = k.toLowerCase()
    if (seen.has(key) || !v) continue
    seen.add(key)
    rows.push([k, v])
  }
  return rows
})
/* body sections follow the project's surface: the house dark tones, or one flat surface (`theme: 'paper' | 'black'`) */
/* a block may also step onto paper (`theme: 'paper'`) inside a coloured case, e.g. a white opening before the surface takes over */
const toneName = (dark: 'dark' | 'light', b?: { surface?: string, theme?: 'paper' }) => b?.theme ?? ((b?.surface || p.surface) ? 'surface' : (p.theme ?? dark))
const tone = (dark: 'dark' | 'light', b?: { surface?: string, theme?: 'paper' }) => `theme-${toneName(dark, b)}`
/* a block may take its own dark colour (e.g. MFA maroon between white sections) */
const surfaceStyle = (b: { surface?: string }) => (b.surface ? { '--case-surface': b.surface } : undefined)
const discipline = computed(() => p.category.split('·')[0]!.trim())
const plainLede = p.lede.length > 158 ? `${p.lede.slice(0, p.lede.lastIndexOf(' ', 155))}…` : p.lede

const base = useSiteUrl()
const url = `${base}/work/${p.slug}`
const heroAlt = `${p.title} — ${p.category}`
useSeo({
  title: p.seoTitle ?? `${p.title} — ${p.category} | Lōn Visuals`,
  description: plainLede,
  path: `/work/${p.slug}`,
  ogImage: `${p.slug}.jpg`,
  ogImageAlt: heroAlt,
  type: 'article',
  jsonLd: [
    organizationLd(base),
    founderLd(base),
    {
      '@type': 'CreativeWork',
      '@id': `${url}#work`,
      'name': p.title,
      'headline': `${p.title} — ${p.category}`,
      'description': p.lede,
      'url': url,
      'image': [`${base}/og/${p.slug}.jpg`, ...[...new Set([p.hero, ...p.blocks.flatMap(b => (b.type === 'media' ? b.images.map(i => i.id) : []))])].slice(0, 12).map(id => `${base}/media/${id}-${Math.max(...(media[id]?.widths ?? [960]))}.webp`)],
      'genre': p.category,
      'dateCreated': p.year || undefined,
      'creator': [{ '@id': `${base}/#organization` }, { '@id': `${base}/#founder` }],
      'sourceOrganization': facts.value.find(([k]) => k === 'Client') ? { '@type': 'Organization', 'name': facts.value.find(([k]) => k === 'Client')![1] } : undefined,
      'publisher': { '@id': `${base}/#organization` },
      'keywords': p.blocks.flatMap(b => (b.type === 'text' ? b.tags : [])).join(', ') || undefined,
      'locationCreated': facts.value.find(([k]) => k === 'Location')?.[1],
      'inLanguage': 'en',
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': site.name, 'item': `${base}/` },
        { '@type': 'ListItem', 'position': 2, 'name': 'Work', 'item': `${base}/#work` },
        { '@type': 'ListItem', 'position': 3, 'name': p.title, 'item': url },
      ],
    },
  ],
})

/* hero image parallax + dim, as on Exo Ape's project hero */
const hero = ref<HTMLElement>()
const heroMedia = ref<HTMLElement>()
let stop: (() => void) | undefined
onMounted(() => {
  if (prefersReducedMotion()) return
  const tl = gsap.timeline({ paused: true })
  if (isMobileWidth()) tl.fromTo(heroMedia.value!, { scale: 1, opacity: 1 }, { scale: 1.4, opacity: 0.3, ease: 'none' })
  else tl.fromTo(heroMedia.value!, { y: 0, opacity: 1 }, { y: () => hero.value!.offsetHeight / 2, opacity: 0.5, ease: 'none' })
  stop = onFrame(() => {
    const r = hero.value!.getBoundingClientRect()
    if (r.bottom < 0) return
    tl.progress(clamp(-r.top / r.height, 0, 1))
  })
})
onBeforeUnmount(() => stop?.())

/* "Next project": Exo Ape's loadProject hand-off — bring the block to full screen, wipe its image
   up (clip-path + -7° / 1.3 scale), lift the title lines out, and route underneath it. */
const nextSection = ref<HTMLElement>()
const leaving = ref(false)
async function goNext(e: MouseEvent) {
  if (!next || leaving.value || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
  e.preventDefault()
  const to = `/work/${next.slug}`
  if (prefersReducedMotion()) return navigateTo(to)
  leaving.value = true
  const el = nextSection.value!
  scrollToElement(el)
  // wait for the eased scroll to land (bounded, like Exo Ape's scroll:bottom)
  await new Promise<void>((resolve) => {
    const t0 = performance.now()
    const stopWait = onFrame((s) => {
      const t = performance.now() - t0
      if ((t > 60 && Math.abs(s.current - s.target) < 2) || t > 1200) { stopWait(); resolve() }
    })
  })
  appState.transition = 'loadProject'
  const media = el.querySelector<HTMLElement>('.media')!
  gsap.fromTo(media, { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }, { clipPath: 'polygon(0 0, 100% 0, 100% 0%, 0 0%)', duration: 1, ease: EASE.inOut })
  gsap.fromTo(media.firstElementChild, { yPercent: 0, scale: 1, rotate: 0 }, { yPercent: -50, scale: 1.3, rotate: -7, duration: 1, ease: EASE.inOut })
  gsap.fromTo(el.querySelectorAll('.c-next-inner > *'), { rotate: 0, yPercent: 0, opacity: 1 }, { rotate: -7, yPercent: -100, opacity: 0, stagger: 0.05, ease: EASE.in, duration: 0.5 })
  gsap.set(el, { backgroundColor: 'transparent', delay: 0.5 })
  navigateTo(to)
}

const ratio = (id: string) => (media[id] ? media[id].w / media[id].h : 1.5)
</script>

<template>
  <PageShell>
    <article class="case" :class="p.surface ? 'is-surface' : p.theme ? `is-${p.theme}` : undefined" :style="p.surface ? { '--case-surface': p.surface } : undefined" :aria-labelledby="'case-title'">
      <!-- HERO -->
      <header ref="hero" class="c-hero theme-dark" data-theme="dark">
        <div ref="heroMedia" class="c-hero-media atmos-soft grain" :class="{ 'is-natural': p.heroNatural }">
          <MediaImage :id="p.hero" :alt="heroAlt" sizes="100vw" eager :mobile-id="p.heroMobile" :position="p.heroFocus" />
        </div>
        <div class="c-hero-shade" :class="{ 'is-dense': p.heroDense }" aria-hidden="true" />
        <div class="container c-hero-inner">
          <nav class="crumbs caps" aria-label="Breadcrumb">
            <ol>
              <li><NuxtLink to="/" class="u-link u-link--rev">Lōn Visuals</NuxtLink></li>
              <li><NuxtLink to="/#work" class="u-link u-link--rev">Work</NuxtLink></li>
              <li aria-current="page">{{ p.title }}</li>
            </ol>
          </nav>
          <h1 id="case-title" v-reveal="{ intro: true }" class="c-title t-h1" :class="{ 'is-long': p.title.length > 18 }">
            <span class="line-mask"><span data-line>{{ p.title }}</span></span>
          </h1>
          <p v-reveal="{ intro: true, delay: 0.2 }" class="c-cat caps">{{ p.category }}</p>
        </div>
      </header>

      <!-- INTRO -->
      <section class="c-intro" :class="tone('dark', { theme: p.introTheme })" :data-theme="toneName('dark', { theme: p.introTheme })" aria-label="Project overview">
        <div class="container">
          <p v-reveal class="c-lede t-h3">{{ p.lede }}</p>
          <dl class="c-facts">
            <div v-for="[k, v] in facts" :key="k" class="c-fact">
              <dt class="caps">{{ k }}</dt>
              <dd class="t-small">{{ v }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <!-- BLOCKS -->
      <template v-for="(b, i) in p.blocks" :key="i">
        <section v-if="b.type === 'text'" class="b-text" :class="tone('light', b)" :style="surfaceStyle(b)" :data-theme="toneName('light', b)" :aria-label="b.title || b.label || undefined">
          <div class="container">
            <p v-if="b.label" v-reveal class="label b-label">{{ b.label }}</p>
            <h2 v-if="b.title" v-reveal class="b-title t-h2">{{ b.title }}</h2>
            <div v-if="b.paras.length" class="b-body">
              <p v-for="(para, j) in b.paras" :key="j" v-reveal class="t-p">{{ para }}</p>
            </div>
            <p v-if="b.links?.length" class="b-links">
              <a v-for="l in b.links" :key="l.href" v-reveal :href="l.href" target="_blank" rel="noopener" class="u-link t-small">{{ l.label }} ↗</a>
            </p>
            <ul v-if="b.tags.length" class="b-tags" aria-label="Disciplines">
              <li v-for="t in b.tags" :key="t" class="t-sub">{{ t }}</li>
            </ul>
          </div>
        </section>

        <!-- gallery images keep their own proportions (no frame crop) with a light drift -->
        <figure v-else-if="b.type === 'media'" class="b-media" :data-theme="toneName('light', b)" :style="surfaceStyle(b)" :class="[tone('light', b), `is-${b.layout}`, { 'is-portrait': b.layout === 'full' && !b.wide && ratio(b.images[0]!.id) < 1 }]">
          <div class="container b-media-grid">
            <div v-for="(img, j) in b.images" :key="img.id" class="b-media-item" :class="`n-${j}`">
              <MediaFrame
                :id="img.id"
                :alt="img.alt"
                :sizes="b.layout === 'full' ? '(max-width: 600px) 100vw, 84vw' : '(max-width: 600px) 100vw, 42vw'"
                :travel="4"
                :scale="[1.045, 1.045]"
              />
            </div>
            <div v-if="b.text?.length" class="b-side">
              <p v-for="(para, j) in b.text" :key="j" v-reveal class="t-p">{{ para }}</p>
            </div>
            <figcaption v-if="b.caption" class="b-caption t-small">{{ b.caption }}</figcaption>
          </div>
        </figure>

        <section v-else-if="b.type === 'list'" class="b-list" :class="tone('dark', b)" :style="surfaceStyle(b)" :data-theme="toneName('dark', b)" :aria-label="b.title || b.label || 'Details'">
          <div class="container">
            <p v-if="b.label" v-reveal class="label b-label">{{ b.label }}</p>
            <h2 v-if="b.title" v-reveal class="b-title t-h2">{{ b.title }}</h2>
            <ol class="b-items" :class="{ 'is-chips': b.items.some(it => it.color), 'is-words': b.items.every(it => !it.desc && !it.color) }">
              <li v-for="it in b.items" :key="it.name" class="b-item" :style="it.color ? { '--chip': it.color } : undefined">
                <span v-if="it.num" class="b-num caps">{{ it.num }}</span>
                <span v-if="it.ar" class="b-ar" lang="ar" dir="rtl">{{ it.ar }}</span>
                <h3 class="b-name t-h3">{{ it.name }}</h3>
                <p v-if="it.desc" class="b-desc t-small">{{ it.desc }}</p>
              </li>
            </ol>
          </div>
        </section>

        <section v-else-if="b.type === 'palette'" class="b-palette" :class="tone('light', b)" :style="surfaceStyle(b)" :data-theme="toneName('light', b)" aria-label="Colour palette">
          <ul class="container">
            <li v-for="sw in b.swatches" :key="sw.hex" class="sw">
              <span class="sw-chip" :style="{ background: sw.hex }" />
              <span v-if="sw.name" class="t-small">{{ sw.name }}</span>
              <span class="caps dim">{{ sw.hex.toUpperCase() }}</span>
            </li>
          </ul>
        </section>
      </template>

      <section v-if="p.credits.length" class="b-credits" :class="tone('light')" :data-theme="toneName('light')" aria-label="Credits">
        <dl class="container">
          <div v-for="c in p.credits" :key="c.role" class="credit">
            <dt class="caps dim">{{ c.role }}</dt>
            <dd class="t-small">
              <a v-if="c.href" :href="c.href" target="_blank" rel="noopener" class="u-link">{{ c.name }}</a>
              <template v-else>{{ c.name }}</template>
            </dd>
          </div>
        </dl>
      </section>
    </article>

    <!-- NEXT -->
    <section v-if="next" ref="nextSection" class="c-next theme-dark" data-theme="dark" aria-label="Next project">
      <!-- plain anchor: RouterLink would navigate before goNext can hand off -->
      <a :href="`/work/${next.slug}`" class="c-next-link" data-cursor="Next" @click="goNext">
        <div class="c-next-media">
          <MediaFrame :id="next.hero" alt="" sizes="100vw" :ratio="16 / 9" :travel="10" />
        </div>
        <div class="container c-next-inner">
          <p class="caps c-next-kicker">Next project</p>
          <p class="c-next-title t-h1" :class="{ 'is-long': next.title.length > 18 }">{{ next.title }}</p>
          <p class="caps dim">{{ next.category }}</p>
        </div>
      </a>
    </section>
  </PageShell>
</template>

<style scoped>
/* HERO */
.c-hero { position: relative; height: calc(var(--vh) * 100); min-height: 520px; overflow: hidden; }
.c-hero-media { position: absolute; inset: 0; will-change: transform, opacity; }
.c-hero-media :deep(picture), .c-hero-media :deep(img) { width: 100%; height: 100%; object-fit: cover; }
.c-hero-media :deep(img) { filter: saturate(0.85) sepia(0.1) brightness(0.78); }
/* brand-coloured heroes keep their true colour, with only a neutral darkening for the title */
.c-hero-media.is-natural :deep(img) { filter: none; }
.c-hero-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(18, 16, 10, 0.55) 0%, rgba(18, 16, 10, 0.05) 32%, rgba(18, 16, 10, 0.8) 100%); }
/* heroes that carry their own lettering (a logo on paper) need the title to sit on near-solid ink */
.c-hero-shade.is-dense { background: linear-gradient(180deg, rgba(18, 16, 10, 0.6) 0%, rgba(18, 16, 10, 0.25) 30%, rgba(18, 16, 10, 0.9) 72%, rgba(18, 16, 10, 0.96) 100%); }
.c-hero-inner { position: relative; height: 100%; grid-template-rows: auto 1fr auto; padding: 2vw 0 3.4vw; }
.crumbs { grid-column: 2 / -1; padding-top: 0.2vw; color: rgba(245, 242, 234, 0.72); font-size: var(--fs-sub); }
.crumbs ol { display: flex; flex-wrap: wrap; gap: 0.6em; }
.crumbs li + li::before { content: '/'; margin-right: 0.6em; opacity: 0.5; }
.c-title { grid-column: 2 / -1; align-self: end; }
.c-title.is-long, .c-next-title.is-long { font-size: 7.4vw; line-height: 7.4vw; }
.c-cat { grid-column: 2 / -1; margin-top: 1.6vw; color: var(--c-title); }

/* INTRO */
.c-intro { padding: 10vw 0 11vw; }
.c-lede { grid-column: 2 / 9; color: var(--c-paper); font-family: var(--f-sans); font-weight: 300; font-size: max(2vw, 20px); line-height: 1.4; letter-spacing: -0.01em; }
.c-facts { grid-column: 2 / 12; margin-top: 7vw; padding-top: 2.4vw; border-top: 1px solid var(--rule); display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.5vw var(--gutter); }
.c-fact dt { color: var(--c-title); font-size: var(--fs-sub); }
.c-fact dd { margin: 0.6vw 0 0; color: var(--fg-2); }

/* TEXT */
.b-text { padding: 10vw 0 4vw; }
.b-label { grid-column: 2 / 5; align-self: start; margin-top: 0.8vw; }
.b-title { grid-column: 5 / 12; }
.b-body { grid-column: 5 / 10; margin-top: 2.6vw; display: grid; gap: 1.2em; color: var(--fg-2); }
.b-body p:first-child { color: rgba(245, 242, 234, 0.86); font-size: max(1.35vw, 16px); line-height: 1.55; }
.b-tags { grid-column: 5 / 12; margin-top: 2.6vw; display: flex; flex-wrap: wrap; gap: 0.5vw; }
.b-tags li { border: 1px solid var(--rule); border-radius: 99px; padding: 0.5em 1.1em; font-family: var(--f-title); text-transform: uppercase; letter-spacing: 0.08em; color: var(--c-title); }

/* MEDIA */
.b-media { margin: 0; padding: 2.2vw 0; }
.b-media-grid { align-items: start; }
.is-full .n-0 { grid-column: 2 / 12; }
.is-full.is-portrait .n-0, .is-portrait .b-caption { grid-column: 4 / 10; }
.is-pair .n-0 { grid-column: 2 / 7; margin-top: 8vw; }
.is-pair .n-1 { grid-column: 7 / 12; }
/* split: one image with its text alongside */
.is-split .n-0 { grid-column: 2 / 8; }
.b-side { grid-column: 9 / 12; align-self: center; display: grid; gap: 1.2em; color: var(--fg-2); }
.b-side p:first-child { color: var(--fg); }
.is-trio .b-media-item { grid-column: span 3; }
.is-trio .n-0 { grid-column: 2 / span 3; }
.is-trio .n-1 { grid-column: 5 / span 4; margin-top: 6vw; }
.is-trio .n-2 { grid-column: 9 / span 3; }
.is-grid .b-media-item { grid-column: span 5; margin-bottom: var(--gutter); }
.is-grid .b-media-item:nth-child(odd) { grid-column: 2 / span 5; }
.is-grid .b-media-item:nth-child(even) { grid-column: 7 / span 5; }
.b-caption { grid-column: 2 / 9; margin-top: 1.2vw; color: var(--fg-2); padding-left: 1.2em; position: relative; }
.b-caption::before { content: ''; position: absolute; left: 0; top: 0.75em; width: 0.6em; height: 1px; background: var(--c-title); }

/* LIST */
.b-list { padding: 12vw 0; margin: 6vw 0; }
/* on a coloured surface the band must stay continuous with its neighbours: margin becomes padding */
.b-list.theme-surface { margin: 0; padding: 18vw 0; }
.b-items { grid-column: 2 / 12; margin-top: 5vw; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 var(--gutter); }
.b-item { padding: 2vw 0 2.8vw; border-top: 1px solid var(--rule); display: flex; flex-direction: column; gap: 0.8vw; }
.b-num { color: var(--c-title); font-size: var(--fs-sub); }
.b-name { color: var(--c-paper); }
.b-desc { color: var(--fg-2); max-width: 26em; }
.b-items.is-words { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.b-name { overflow-wrap: break-word; hyphens: auto; }
.b-items.is-chips { gap: var(--gutter); }
.is-chips .b-item { border: 0; background: var(--chip); color: #fff; padding: 2vw; aspect-ratio: 4 / 3; justify-content: flex-end; border-radius: 2px; }
.b-ar { font-size: var(--fs-h4); line-height: 1.4; font-family: system-ui, 'Segoe UI', Tahoma, sans-serif; }

/* PALETTE */
.b-palette { padding: 4vw 0 6vw; }
.b-palette ul { grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); margin: 0 var(--margin); padding-left: calc(var(--col) + var(--gutter)); padding-right: calc(var(--col) + var(--gutter)); }
.sw { display: flex; flex-direction: column; gap: 0.4vw; min-width: 0; }
.sw-chip { display: block; aspect-ratio: 1 / 2.2; border-radius: 2px; margin-bottom: 0.6vw; box-shadow: inset 0 0 0 1px rgba(245, 242, 234, 0.08); }
.dim { color: var(--fg-2); }

/* CREDITS */
.b-links { grid-column: 5 / 11; display: flex; flex-wrap: wrap; gap: 0.6vw 2.4vw; margin-top: 2.2vw; color: var(--c-title); }
.b-credits { padding: 6vw 0 10vw; }
/* the gaps between paper sections must not show the ink page underneath */
.case.is-paper { background: #ffffff; }
.case.is-black { background: #000000; }
.case.is-surface { background: var(--case-surface); }
/* paper surface: swap the gold-on-ink accents for ink and a deep gold that hold up on white */
.theme-paper .c-lede, .theme-paper .b-name { color: var(--c-ink); }
.theme-paper .b-body p:first-child { color: rgba(18, 16, 10, 0.86); }
.theme-paper .c-fact dt, .theme-paper .b-num, .theme-paper .b-tags li, .theme-paper .b-links,
.theme-paper .b-label, .theme-paper .b-title { color: var(--accent); }
.theme-paper .b-title { color: var(--c-ink); }
.theme-paper .b-caption::before { background: var(--accent); }
.theme-paper .sw-chip { box-shadow: inset 0 0 0 1px rgba(18, 16, 10, 0.12); }
.b-credits dl { row-gap: 2vw; }
.credit { grid-column: span 2; }
.credit:first-child { grid-column: 2 / span 3; }
.credit dd { margin: 0.4vw 0 0; }

/* NEXT */
.c-next { overflow: hidden; }
.c-next-link { display: block; position: relative; }
.c-next-media { position: relative; opacity: 0.38; transition: opacity 1s var(--ease-out); }
.c-next-media :deep(.media) { aspect-ratio: auto !important; height: calc(var(--vh) * 100); }
.c-next-inner { position: absolute; inset: 0; align-content: center; }
.c-next-inner > * { grid-column: 2 / -1; }
.c-next-kicker { color: var(--fg-2); }
.c-next-title { margin: 1.6vw 0 1.4vw; color: var(--c-title); transition: transform 1s var(--ease-out); }
@media (hover: hover) {
  .c-next-link:hover .c-next-media { opacity: 0.6; }
  .c-next-link:hover .c-next-title { transform: translateX(1.5vw); }
}

@media (min-width: 601px) and (max-width: 1024px) {
  .c-lede { grid-column: 2 / 11; }
  .c-facts { grid-template-columns: repeat(3, 1fr); }
  .b-label { grid-column: 2 / -1; margin-bottom: 2.4vw; }
  .b-title, .b-tags { grid-column: 2 / 12; }
  .b-body { grid-column: 2 / 11; }
  .is-full .n-0 { grid-column: 1 / -1; }
  .b-items { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .b-items.is-words { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .is-chips .b-item { padding: 2.6vw; }
}

@media (min-width: 601px) and (max-width: 1024px) {
  .is-full.is-portrait .n-0, .is-portrait .b-caption { grid-column: 3 / 11; }
  .is-split .n-0 { grid-column: 1 / 7; }
  .b-side { grid-column: 7 / -1; }
}

@media (max-width: 600px) {
  .is-portrait .b-caption { grid-column: 1 / -1; }
  .crumbs, .c-title, .c-cat { grid-column: 1 / -1; }
  .c-title.is-long, .c-next-title.is-long { font-size: 12vw; line-height: 12.4vw; }
  .c-hero-inner { padding: 22vw 0 8vw; }
  .c-cat { margin-top: 3vw; }
  .c-intro { padding: 18vw 0 20vw; }
  .c-lede { grid-column: 1 / -1; }
  .c-facts { grid-column: 1 / -1; grid-template-columns: repeat(2, 1fr); gap: 7vw 4vw; margin-top: 14vw; }
  .c-fact dd { margin-top: 1.6vw; }

  .b-text { padding: 20vw 0 8vw; }
  .b-label, .b-title, .b-body, .b-tags { grid-column: 1 / -1; }
  .b-title { margin-top: 4vw; }
  .b-body { margin-top: 6vw; }
  .b-tags { gap: 2vw; margin-top: 6vw; }

  .b-media { padding: 3vw 0; }
  .b-media-grid { row-gap: 3vw; margin: 0; }
  .is-full .n-0 { grid-column: 1 / -1; }
  .is-pair .n-0, .is-pair .n-1, .is-trio .b-media-item, .is-grid .b-media-item,
  .is-trio .n-0, .is-trio .n-1, .is-trio .n-2,
  .is-grid .b-media-item:nth-child(odd), .is-grid .b-media-item:nth-child(even) { grid-column: 1 / -1; margin: 0; }
  .b-caption { grid-column: 1 / -1; margin: 2vw var(--margin) 0; }
  .is-split .n-0, .b-side { grid-column: 1 / -1; }
  .b-side { margin: 6vw var(--margin) 0; }

  .b-list { padding: 22vw 0; margin: 10vw 0; }
  .b-list.theme-surface { margin: 0; padding: 32vw 0; }
  .b-items, .b-items.is-words { grid-column: 1 / -1; grid-template-columns: 1fr; margin-top: 10vw; }
  .b-items.is-words { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .b-items.is-chips { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3vw; }
  .is-chips .b-name { font-size: 5.2vw; line-height: 1.2; }
  .b-item { padding: 5vw 0 7vw; gap: 2vw; }
  .is-chips .b-item { padding: 4vw; }

  .b-palette { padding: 8vw 0 12vw; }
  .b-palette ul { padding: 0; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6vw 4vw; }
  .sw .caps { letter-spacing: 0.04em; }
  .sw { gap: 1vw; }

  .b-credits dl { row-gap: 6vw; }
  .b-links { grid-column: 1 / -1; gap: 3vw 6vw; margin-top: 6vw; }
  .credit, .credit:first-child { grid-column: span 5; }
  .c-next-inner > * { grid-column: 1 / -1; }
}
</style>
