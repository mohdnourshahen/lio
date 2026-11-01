<script setup lang="ts">
import { media, projectBySlug, site, solutionBySlug, type MediaRef } from '~/utils/site'

/**
 * Sector landing page (/solutions/<slug>): written for the owners and operators of one sector,
 * in the case-study language — hero, lede and facts, then what they need, what we deliver,
 * the proof, how we work, answers and one clear way to start.
 */
const route = useRoute()
const s = solutionBySlug(route.params.slug as string)
if (!s) throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })

const work = s.work.items.map(w => ({ ...w, p: projectBySlug(w.slug)! })).filter(w => w.p)
const mail = `mailto:${site.email}?subject=${encodeURIComponent(s.cta.subject)}`
const pad = (n: number) => String(n + 1).padStart(2, '0')

/* Exo Ape's work grid: images never sit in a row. Each goes to whichever of two columns (wide left,
   narrow right that starts lower) is shorter, alternating full and inset widths, so the group reads as
   a loose, staggered collage; `order` keeps the original sequence when the columns fold on phones. */
function scatter(rows: MediaRef[][]) {
  const cols: { im: MediaRef, w: 'full' | 'inset', order: number }[][] = [[], []]
  const height: [number, number] = [0, 0.16]
  const span: [number, number] = [6, 4]
  rows.flat().forEach((im, order) => {
    const c = height[0] <= height[1] ? 0 : 1
    const w = cols[c]!.length % 2 ? 'inset' : 'full'
    const r = media[im.id] ? media[im.id]!.h / media[im.id]!.w : 0.75
    height[c] += span[c] / 12 * (w === 'inset' ? 0.76 : 1) * r + 0.07
    cols[c]!.push({ im, w, order })
  })
  return cols
}

const base = useSiteUrl()
const url = `${base}/solutions/${s.slug}`
const img = (id: string) => `${base}/media/${id}-${Math.max(...(media[id]?.widths ?? [960]))}.webp`
useSeo({
  title: s.seoTitle,
  description: s.description,
  path: `/solutions/${s.slug}`,
  ogImage: `solutions-${s.slug}.jpg`,
  ogImageAlt: s.heroAlt,
  jsonLd: [
    organizationLd(base),
    founderLd(base),
    {
      '@type': 'Service',
      '@id': `${url}#service`,
      'name': s.title,
      'serviceType': `${s.sector} branding`,
      'description': s.description,
      'url': url,
      'image': img(s.hero),
      'provider': { '@id': `${base}/#organization` },
      'areaServed': ['Saudi Arabia', 'Jordan', 'United Arab Emirates', 'Qatar', 'Oman', 'Morocco', 'Middle East and North Africa'],
      'audience': { '@type': 'BusinessAudience', 'name': s.audience },
      'hasOfferCatalog': {
        '@type': 'OfferCatalog',
        'name': `${s.sector} branding services`,
        'itemListElement': s.services.items.map(([n, d]) => ({ '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': n, 'description': d } })),
      },
      'subjectOf': work.map(w => ({ '@type': 'CreativeWork', 'name': w.p.title, 'url': `${base}/work/${w.slug}` })),
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      'mainEntity': s.faq.items.map(([q, a]) => ({ '@type': 'Question', 'name': q, 'acceptedAnswer': { '@type': 'Answer', 'text': a } })),
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': site.name, 'item': `${base}/` },
        { '@type': 'ListItem', 'position': 2, 'name': 'Solutions', 'item': url },
        { '@type': 'ListItem', 'position': 3, 'name': s.title, 'item': url },
      ],
    },
  ],
})
</script>

<template>
  <PageShell>
    <article class="sol" aria-labelledby="sol-title">
      <!-- HERO -->
      <header class="s-hero theme-dark" data-theme="dark">
        <div class="s-hero-media atmos-soft grain">
          <MediaImage :id="s.hero" :alt="s.heroAlt" sizes="100vw" eager />
        </div>
        <div class="s-hero-shade" aria-hidden="true" />
        <div class="container s-hero-inner">
          <nav class="crumbs caps" aria-label="Breadcrumb">
            <ol>
              <li><NuxtLink to="/" class="u-link u-link--rev">Lōn Visuals</NuxtLink></li>
              <li>Solutions</li>
              <li aria-current="page">{{ s.sector }}</li>
            </ol>
          </nav>
          <p v-reveal="{ intro: true, delay: -0.1 }" class="s-kicker caps">{{ s.kicker }}</p>
          <h1 id="sol-title" v-reveal="{ intro: true }" class="s-title t-h1">
            <span class="line-mask"><span data-line>{{ s.title }}</span></span>
          </h1>
          <!-- not v-reveal: its line-split wrapper would swallow the flex gap between the two links -->
          <p class="s-hero-cta">
            <a :href="mail" class="btn" data-cursor="Write">Start a {{ s.sector.toLowerCase() }} project</a>
            <a href="#work" class="s-link caps">See the work <span aria-hidden="true">↓</span></a>
          </p>
        </div>
      </header>

      <!-- LEDE + FACTS -->
      <section class="s-intro theme-paper" data-theme="paper" aria-label="Overview">
        <div class="container">
          <p v-reveal class="s-lede">{{ s.lede }}</p>
          <dl class="s-facts">
            <div v-for="[k, v] in s.facts" :key="k" class="s-fact">
              <dt class="caps">{{ k }}</dt>
              <dd class="t-small">{{ v }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <!-- THE BRIEF -->
      <section class="s-text theme-paper" data-theme="paper" :aria-label="s.brief.title">
        <div class="container">
          <p v-reveal class="label s-label">{{ s.brief.label }}</p>
          <h2 v-reveal class="s-h2 t-h2">{{ s.brief.title }}</h2>
          <div class="s-body">
            <p v-for="(para, i) in s.brief.paras" :key="i" v-reveal class="t-p">{{ para }}</p>
          </div>
        </div>
      </section>

      <!-- WHAT WE DELIVER -->
      <section class="s-list theme-dark" data-theme="dark" :aria-label="s.services.title">
        <div class="container">
          <p v-reveal class="label s-label">{{ s.services.label }}</p>
          <h2 v-reveal class="s-h2 t-h2">{{ s.services.title }}</h2>
          <ol class="s-items is-4">
            <li v-for="([n, d], i) in s.services.items" :key="n" class="s-item">
              <span class="s-num caps">{{ pad(i) }}</span>
              <h3 class="s-name t-h3">{{ n }}</h3>
              <p class="s-desc t-small">{{ d }}</p>
            </li>
          </ol>
        </div>
      </section>

      <!-- WORK -->
      <section id="work" class="s-work theme-dark" data-theme="dark" :aria-label="s.work.title">
        <div class="container">
          <p v-reveal class="label s-label">{{ s.work.label }}</p>
          <h2 v-reveal class="s-h2 t-h2">{{ s.work.title }}</h2>
          <ul class="s-cards">
            <li v-for="(w, i) in work" :key="w.slug" class="s-card" :class="`n-${i}`">
              <NuxtLink :to="`/work/${w.slug}`" class="s-card-link" data-cursor="View">
                <MediaFrame :id="w.image" :alt="`${w.p.title} — ${w.p.category}`" :ratio="4 / 3" sizes="(max-width: 600px) 100vw, 42vw" :travel="6" :scale="[1.08, 1.08]" />
                <span class="s-card-meta">
                  <span class="s-card-title t-h3">{{ w.p.title }}</span>
                  <span class="caps dim">{{ w.p.category }}</span>
                </span>
                <span class="s-card-line t-small">{{ w.line }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </section>

      <!-- TOUCHPOINTS -->
      <figure class="s-touch theme-dark" data-theme="dark">
        <div class="container">
          <p v-reveal class="label s-label">{{ s.touchpoints.label }}</p>
          <h2 v-reveal class="s-h2 t-h2">{{ s.touchpoints.title }}</h2>
          <div v-for="(im, i) in s.touchpoints.images" :key="im.id" class="s-touch-item" :class="`n-${i}`">
            <MediaFrame :id="im.id" :alt="im.alt" sizes="(max-width: 600px) 100vw, 42vw" :travel="4" :scale="[1.045, 1.045]" />
          </div>
          <figcaption class="s-caption t-small">{{ s.touchpoints.caption }}</figcaption>
        </div>
      </figure>

      <!-- PORTFOLIO: work beyond the full case studies, grouped by kind of place -->
      <section v-if="s.portfolio" class="s-port theme-paper" data-theme="paper" :aria-label="s.portfolio.title">
        <div class="container">
          <p v-reveal class="label s-label">{{ s.portfolio.label }}</p>
          <h2 v-reveal class="s-h2 t-h2">{{ s.portfolio.title }}</h2>
          <p v-reveal class="s-port-intro t-p">{{ s.portfolio.intro }}</p>
        </div>
        <div v-for="g in s.portfolio.groups" :key="g.name" class="container s-group">
          <div class="s-group-head">
            <h3 v-reveal class="s-group-name t-h3">{{ g.name }}</h3>
            <p v-reveal class="s-group-desc t-small">{{ g.desc }}</p>
          </div>
          <!-- two free columns at different widths and speeds; on phones they fold back into reading order -->
          <div class="sc">
            <div v-for="(col, c) in scatter(g.rows)" :key="c" class="sc-col" :class="c ? 'sc-r' : 'sc-l'">
              <div v-for="it in col" :key="it.im.id" class="sc-item" :class="`w-${it.w}`" :style="{ order: it.order }">
                <MediaFrame :id="it.im.id" :alt="it.im.alt" :sizes="c ? '(max-width: 600px) 100vw, 34vw' : '(max-width: 600px) 100vw, 46vw'" :travel="c ? 14 : 6" :scale="[1.06, 1.06]" />
              </div>
            </div>
          </div>
          <p class="s-caption t-small">{{ g.caption }}</p>
        </div>
      </section>

      <!-- SECTORS -->
      <section class="s-list theme-paper" data-theme="paper" :aria-label="s.sectors.title">
        <div class="container">
          <p v-reveal class="label s-label">{{ s.sectors.label }}</p>
          <h2 v-reveal class="s-h2 t-h2">{{ s.sectors.title }}</h2>
          <ul class="s-items is-4">
            <li v-for="[n, d] in s.sectors.items" :key="n" class="s-item">
              <h3 class="s-name t-h3">{{ n }}</h3>
              <p class="s-desc t-small">{{ d }}</p>
            </li>
          </ul>
        </div>
      </section>

      <!-- PROCESS -->
      <section class="s-list theme-sand" data-theme="sand" :aria-label="s.process.title">
        <div class="container">
          <p v-reveal class="label s-label">{{ s.process.label }}</p>
          <h2 v-reveal class="s-h2 t-h2">{{ s.process.title }}</h2>
          <ol class="s-items is-4">
            <li v-for="([n, d], i) in s.process.items" :key="n" class="s-item">
              <span class="s-num caps">{{ pad(i) }}</span>
              <h3 class="s-name t-h3">{{ n }}</h3>
              <p class="s-desc t-small">{{ d }}</p>
            </li>
          </ol>
        </div>
      </section>

      <!-- WHY -->
      <section class="s-list theme-dark" data-theme="dark" :aria-label="s.why.title">
        <div class="container">
          <p v-reveal class="label s-label">{{ s.why.label }}</p>
          <h2 v-reveal class="s-h2 t-h2">{{ s.why.title }}</h2>
          <ul class="s-items is-3">
            <li v-for="[n, d] in s.why.items" :key="n" class="s-item">
              <h3 class="s-name t-h3">{{ n }}</h3>
              <p class="s-desc t-small">{{ d }}</p>
            </li>
          </ul>
        </div>
      </section>

      <!-- FAQ -->
      <section class="s-faq theme-paper" data-theme="paper" :aria-label="s.faq.title">
        <div class="container">
          <p v-reveal class="label s-label">{{ s.faq.label }}</p>
          <h2 v-reveal class="s-h2 t-h2">{{ s.faq.title }}</h2>
          <div class="s-qa">
            <details v-for="([q, a], i) in s.faq.items" :key="q" class="qa" :open="i === 0">
              <summary class="qa-q t-h4">{{ q }}</summary>
              <p class="qa-a t-p">{{ a }}</p>
            </details>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="s-cta theme-sand" data-theme="sand" aria-label="Start a project">
        <div class="container">
          <p v-reveal class="caps s-cta-kicker">{{ s.cta.kicker }}</p>
          <h2 v-reveal class="s-cta-title t-h1">{{ s.cta.title }}</h2>
          <p class="s-cta-actions">
            <a :href="mail" class="btn" data-cursor="Write">{{ site.email }}</a>
            <NuxtLink to="/#work" class="s-link caps">All work <span aria-hidden="true">→</span></NuxtLink>
          </p>
        </div>
      </section>
    </article>
  </PageShell>
</template>

<style scoped>
/* HERO */
.s-hero { position: relative; height: calc(var(--vh) * 100); min-height: 520px; overflow: hidden; }
.s-hero-media { position: absolute; inset: 0; }
.s-hero-media :deep(picture), .s-hero-media :deep(img) { width: 100%; height: 100%; object-fit: cover; }
.s-hero-media :deep(img) { filter: saturate(0.85) sepia(0.1) brightness(0.72); }
.s-hero-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(18, 16, 10, 0.55) 0%, rgba(18, 16, 10, 0.08) 32%, rgba(18, 16, 10, 0.86) 100%); }
.s-hero-inner { position: relative; height: 100%; grid-template-rows: auto 1fr auto auto auto; padding: 2vw 0 3.4vw; }
.crumbs { grid-column: 2 / -1; padding-top: 0.2vw; color: rgba(245, 242, 234, 0.72); font-size: var(--fs-sub); }
.crumbs ol { display: flex; flex-wrap: wrap; gap: 0.6em; }
.crumbs li + li::before { content: '/'; margin-right: 0.6em; opacity: 0.5; }
.s-kicker { grid-column: 2 / -1; grid-row: 3; color: var(--c-title); margin-bottom: 1.2vw; }
.s-title { grid-column: 2 / -1; grid-row: 4; }
.s-hero-cta { grid-column: 2 / -1; grid-row: 5; margin-top: 2.8vw; display: flex; align-items: center; flex-wrap: wrap; gap: 1.4vw 3.2vw; }

.s-hero-cta { opacity: 0; animation: s-cta-in 1s var(--ease-out) 1.1s forwards; }
@keyframes s-cta-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

/* primary action: a hairline frame in the house gold that fills on hover — quiet until it is wanted */
.btn {
  display: inline-flex; align-items: center; gap: 1.1em; padding: 1.15em 1.7em;
  border: 1px solid rgba(230, 223, 143, 0.55); color: var(--c-title); background: transparent;
  font-family: var(--f-title); text-transform: uppercase; letter-spacing: 0.14em; font-size: var(--fs-sub); line-height: 1;
  transition: background 0.6s var(--ease-out), color 0.6s var(--ease-out), border-color 0.6s var(--ease-out);
}
.btn::after { content: '→'; font-family: var(--f-sans); letter-spacing: 0; transition: transform 0.6s var(--ease-out); }
.s-link { display: inline-flex; gap: 0.7em; align-items: center; color: rgba(245, 242, 234, 0.78); font-size: var(--fs-sub); letter-spacing: 0.14em; transition: color 0.4s; }
.s-link span { font-family: var(--f-sans); letter-spacing: 0; transition: transform 0.6s var(--ease-out); }
@media (hover: hover) {
  .btn:hover { background: var(--c-title); border-color: var(--c-title); color: var(--c-ink); }
  .btn:hover::after { transform: translateX(0.35em); }
  .s-link:hover { color: var(--c-title); }
  .s-link:hover span { transform: translateY(0.2em); }
}
@media (prefers-reduced-motion: reduce) { .s-hero-cta { animation: none; opacity: 1; } }

/* INTRO */
.s-intro { padding: 10vw 0 11vw; }
.s-lede { grid-column: 2 / 10; color: var(--c-paper); font-family: var(--f-sans); font-weight: 300; font-size: max(2vw, 20px); line-height: 1.4; letter-spacing: -0.01em; }
.s-facts { grid-column: 2 / 12; margin-top: 7vw; padding-top: 2.4vw; border-top: 1px solid var(--rule); display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.5vw var(--gutter); }
.s-fact dt { color: var(--c-title); font-size: var(--fs-sub); }
.s-fact dd { margin: 0.6vw 0 0; color: var(--fg-2); }

/* SHARED HEADINGS */
.s-label { grid-column: 2 / 5; align-self: start; margin-top: 0.8vw; }
.s-h2 { grid-column: 5 / 12; }

/* TEXT */
.s-text { padding: 11vw 0; }
.s-body { grid-column: 5 / 10; margin-top: 2.6vw; display: grid; gap: 1.2em; color: var(--fg-2); }
.s-body p:first-child { color: rgba(245, 242, 234, 0.86); font-size: max(1.35vw, 16px); line-height: 1.55; }

/* LISTS */
.s-list { padding: 11vw 0; }
.s-items { grid-column: 2 / 12; margin-top: 5vw; display: grid; gap: 0 var(--gutter); }
.s-items.is-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.s-items.is-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.s-item { padding: 2vw 0 2.8vw; border-top: 1px solid var(--rule); display: flex; flex-direction: column; gap: 0.8vw; }
.s-num { color: var(--c-title); font-size: var(--fs-sub); }
.s-name { color: var(--c-paper); overflow-wrap: break-word; }
.s-desc { color: var(--fg-2); max-width: 26em; }

/* WORK */
.s-work { padding: 11vw 0 6vw; }
.s-cards { grid-column: 2 / 12; margin-top: 5vw; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5vw var(--gutter); }
.s-card:nth-child(even) { margin-top: 8vw; }
.s-card-link { display: grid; gap: 1.2vw; }
.s-card-meta { display: grid; gap: 0.5vw; margin-top: 0.6vw; }
.s-card-title { color: var(--c-title); transition: transform 0.8s var(--ease-out); }
.s-card-line { color: var(--fg-2); max-width: 34em; }
.dim { color: var(--fg-2); }
@media (hover: hover) {
  .s-card-link:hover .s-card-title { transform: translateX(1vw); }
}

/* TOUCHPOINTS */
.s-touch { margin: 0; padding: 6vw 0 11vw; }
.s-touch-item { margin-top: 5vw; }
.s-touch-item.n-0 { grid-column: 2 / 7; margin-top: 13vw; }
.s-touch-item.n-1 { grid-column: 7 / 12; }
.s-caption { grid-column: 2 / 9; margin-top: 1.2vw; color: var(--fg-2); padding-left: 1.2em; position: relative; }
.s-caption::before { content: ''; position: absolute; left: 0; top: 0.75em; width: 0.6em; height: 1px; background: var(--c-title); }

/* PORTFOLIO */
.s-port { padding: 11vw 0 6vw; }
.s-port-intro { grid-column: 5 / 10; margin-top: 2.6vw; color: var(--fg-2); }
.s-group { margin-top: 8vw; }
.s-group-head { grid-column: 2 / 12; display: flex; align-items: baseline; justify-content: space-between; gap: 2vw; padding-top: 1.6vw; border-top: 1px solid var(--rule); margin-bottom: 2.4vw; }
.s-group-name { color: var(--c-title); }
.s-group-desc { color: var(--fg-2); max-width: 30em; text-align: right; }
.sc { grid-column: 1 / -1; display: grid; grid-template-columns: subgrid; align-items: start; }
.sc-l { grid-column: 2 / 8; }
.sc-r { grid-column: 8 / 12; padding-top: 16vw; }
.sc-l { padding-right: 1vw; }
.theme-paper .sc-item :deep(.media) { box-shadow: 0 0 0 1px rgba(18, 16, 10, 0.08); }
.sc-item { margin-bottom: 7vw; }
.sc-item.w-inset { width: 76%; }
.sc-l .sc-item.w-inset { margin-left: auto; }

/* white sections: ink type, deep-gold accents */
.theme-paper .s-lede, .theme-paper .s-name, .theme-paper .qa-q, .theme-paper .s-group-name { color: var(--c-ink); }
.theme-paper .s-label, .theme-paper .s-fact dt, .theme-paper .s-num { color: var(--accent); }
.theme-paper .s-body p:first-child { color: rgba(18, 16, 10, 0.86); }
.theme-paper .s-caption::before { background: var(--accent); }
.theme-paper .qa-q::after { color: var(--accent); }

/* FAQ */
.s-faq { padding: 11vw 0; }
.s-qa { grid-column: 5 / 12; margin-top: 4vw; border-bottom: 1px solid var(--rule); }
.qa { border-top: 1px solid var(--rule); }
.qa-q { list-style: none; cursor: pointer; padding: 1.6vw 3em 1.6vw 0; position: relative; color: var(--c-paper); }
.qa-q::-webkit-details-marker { display: none; }
.qa-q::after { content: '+'; position: absolute; right: 0; top: 50%; transform: translateY(-50%); color: var(--c-title); font-family: var(--f-title); font-size: 1.4em; transition: transform 0.5s var(--ease-out); }
.qa[open] .qa-q::after { transform: translateY(-50%) rotate(45deg); }
.qa-a { color: var(--fg-2); padding: 0 0 2vw; max-width: 44em; }

/* CTA */
.s-cta { padding: 12vw 0 13vw; text-align: center; }
.s-cta .container > * { grid-column: 2 / 12; }
.s-cta-kicker { color: var(--c-title); }
.s-cta-title { margin: 2vw auto 0; max-width: 14ch; }
.s-cta-actions { margin-top: 4vw; display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 2vw 3vw; }

@media (min-width: 601px) and (max-width: 1024px) {
  .s-lede { grid-column: 2 / 11; }
  .s-facts { grid-template-columns: repeat(2, 1fr); }
  .s-label { grid-column: 2 / -1; margin-bottom: 2.4vw; }
  .s-h2, .s-qa { grid-column: 2 / 12; }
  .s-port-intro { grid-column: 2 / 11; }
  .s-body { grid-column: 2 / 11; }
  .s-items.is-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 600px) {
  .crumbs, .s-kicker, .s-title, .s-hero-cta { grid-column: 1 / -1; }
  .s-hero-inner { padding: 22vw 0 8vw; }
  .s-kicker { margin-bottom: 3vw; }
  .s-hero-cta { margin-top: 7vw; gap: 6vw; }
  .btn { padding: 1.2em 1.5em; }
  .s-intro { padding: 18vw 0 20vw; }
  .s-lede { grid-column: 1 / -1; }
  .s-facts { grid-column: 1 / -1; grid-template-columns: 1fr 1fr; gap: 7vw 4vw; margin-top: 14vw; }
  .s-fact dd { margin-top: 1.6vw; }
  .s-label, .s-h2, .s-body, .s-items, .s-cards, .s-qa, .s-caption, .s-port-intro, .s-group-head { grid-column: 1 / -1; }
  .s-port { padding: 22vw 0 10vw; }
  .s-port-intro { margin-top: 6vw; }
  .s-group { margin-top: 16vw; }
  .s-group-head { flex-direction: column; gap: 2vw; padding-top: 4vw; margin-bottom: 5vw; }
  .s-group-desc { text-align: left; }
  .sc { display: flex; flex-direction: column; }
  .sc-col { display: contents; }
  .sc-item { margin-bottom: 6vw; }
  .sc-item.w-inset { width: 78%; align-self: flex-end; }
  .s-h2 { margin-top: 4vw; }
  .s-text, .s-list, .s-faq { padding: 22vw 0; }
  .s-body { margin-top: 6vw; }
  .s-items.is-4, .s-items.is-3 { grid-template-columns: 1fr; margin-top: 10vw; }
  .s-item { padding: 5vw 0 7vw; gap: 2vw; }
  .s-work { padding: 22vw 0 10vw; }
  .s-cards { grid-template-columns: 1fr; gap: 12vw; margin-top: 10vw; }
  .s-card:nth-child(even) { margin-top: 0; }
  .s-card-link { gap: 3vw; }
  .s-card-meta { gap: 1.6vw; }
  .s-touch { padding: 10vw 0 22vw; }
  .s-touch-item.n-0, .s-touch-item.n-1 { grid-column: 1 / -1; margin-top: 8vw; }
  .qa-q { padding: 5vw 3em 5vw 0; }
  .qa-a { padding-bottom: 6vw; }
  .s-cta { padding: 26vw 0; }
  .s-cta .container > * { grid-column: 1 / -1; }
  .s-cta-title { margin-top: 5vw; }
  .s-cta-actions { margin-top: 10vw; gap: 6vw; flex-direction: column; }
}
</style>
