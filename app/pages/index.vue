<script setup lang="ts">
import { EASE, clamp, gsap, isMobileWidth, prefersReducedMotion } from '~/utils/motion'
import { onFrame } from '~/utils/scroll'
import { HERO_IMAGE, clients, marquee, projects, selectedWork, services, site, stats } from '~/utils/site'
import { appState } from '~/utils/state'

const NuxtLink = resolveComponent('NuxtLink')
const base = useSiteUrl()
useSeo({
  title: 'Lōn Visuals — Visual Strategy Studio in Amman, Jordan',
  description: 'Lōn Visuals is a visual strategy studio in Amman, Jordan. We translate brands into visual language — brand strategy, visual identity, communication design and brand experience for organizations across the region.',
  path: '/',
  ogImage: 'home.jpg',
  ogImageAlt: 'Lōn Visuals — We translate brands into visual language',
  jsonLd: [
    organizationLd(base),
    {
      '@type': 'WebSite',
      '@id': `${base}/#website`,
      'url': `${base}/`,
      'name': site.name,
      'description': site.description,
      'inLanguage': 'en',
      'publisher': { '@id': `${base}/#organization` },
    },
    {
      '@type': 'WebPage',
      '@id': `${base}/#webpage`,
      'url': `${base}/`,
      'name': 'Lōn Visuals — Visual Strategy Studio',
      'isPartOf': { '@id': `${base}/#website` },
      'about': { '@id': `${base}/#organization` },
      'primaryImageOfPage': `${base}/og/home.jpg`,
      'inLanguage': 'en',
    },
    {
      '@type': 'ItemList',
      'name': 'Selected projects',
      'itemListElement': projects.map((p, i) => ({ '@type': 'ListItem', 'position': i + 1, 'url': `${base}/work/${p.slug}`, 'name': p.title })),
    },
    {
      '@type': 'OfferCatalog',
      'name': 'Services',
      'provider': { '@id': `${base}/#organization` },
      'itemListElement': services.map(s => ({ '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': s.name, 'description': s.desc } })),
    },
  ],
})

/* ---------- hero: image drifts down and dims, title lines tip away once you scroll past ---------- */
const hero = ref<HTMLElement>()
const heroMedia = ref<HTMLElement>()
const heroTitle = ref<HTMLElement>()
let heroScrolled = true
let stopHero: (() => void) | undefined

/* ---------- philosophy: words travel in from the edges and meet (Exo Ape's "Play Reel") ---------- */
const reel = ref<HTMLElement>()
const reelLeft = ref<HTMLElement>()
const reelRight = ref<HTMLElement>()
let stopReel: (() => void) | undefined

/* ---------- services marquee: xPercent -50, 40s linear loop — Exo Ape's marquee values ---------- */
const track = ref<HTMLElement>()
let marqueeTween: gsap.core.Tween | undefined

onMounted(() => {
  if (prefersReducedMotion()) return
  const mobile = isMobileWidth()
  const heroTl = gsap.timeline({ paused: true })
  if (mobile) heroTl.fromTo(heroMedia.value!, { scale: 1, opacity: 1 }, { scale: 1.4, opacity: 0.3, ease: 'none' })
  else heroTl.fromTo(heroMedia.value!, { y: 0, opacity: 1 }, { y: () => hero.value!.offsetHeight / 2, opacity: 0.5, ease: 'none' })
  const lines = heroTitle.value!.querySelectorAll('[data-line]')

  stopHero = onFrame((s) => {
    const r = hero.value!.getBoundingClientRect()
    if (r.bottom < 0) return
    heroTl.progress(clamp(-r.top / r.height, 0, 1))
    if (appState.loading || appState.firstLoad) return
    const titleTop = heroTitle.value!.getBoundingClientRect().top
    if (titleTop < s.vh * 0.35 && heroScrolled) {
      heroScrolled = false
      gsap.killTweensOf(lines)
      gsap.to(lines, { autoAlpha: 0, rotation: -7, yPercent: -100, stagger: 0.1, duration: 1, ease: EASE.out })
    }
    else if (titleTop >= s.vh * 0.35 && !heroScrolled) {
      heroScrolled = true
      gsap.killTweensOf(lines)
      gsap.to(lines, { autoAlpha: 1, rotation: 0, yPercent: 0, stagger: -0.1, duration: 1, ease: EASE.out })
    }
  })

  stopReel = onFrame((s) => {
    const r = reel.value!.getBoundingClientRect()
    if (r.bottom < 0 || r.top > s.vh) return
    const p = clamp((s.vh - r.top) / (s.vh + r.height * 0.35), 0, 1)
    const spread = (1 - p) * (mobile ? 18 : 22)
    reelLeft.value!.style.transform = `translate3d(${-spread}vw, 0, 0)`
    reelRight.value!.style.transform = `translate3d(${spread}vw, 0, 0)`
  })

  marqueeTween = gsap.fromTo(track.value!, { xPercent: 0 }, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 })
})
onBeforeUnmount(() => {
  stopHero?.()
  stopReel?.()
  marqueeTween?.kill()
})
</script>

<template>
  <PageShell>
    <!-- HERO -->
    <section ref="hero" class="hero theme-dark" data-theme="dark" aria-labelledby="hero-title" data-cursor="Scroll">
      <div ref="heroMedia" class="hero-media">
        <MediaImage :id="HERO_IMAGE" alt="" sizes="100vw" eager />
      </div>
      <div class="hero-vignette" aria-hidden="true" />
      <div class="hero-inner container">
        <p v-reveal="{ intro: true, delay: 0.3 }" class="hero-sub t-h4">
          At Lōn Visuals, creativity meets strategy to shape how organizations communicate, evolve, and grow through design.
        </p>
        <h1 id="hero-title" ref="heroTitle" v-reveal="{ intro: true }" class="hero-title">
          <span class="line-mask"><span data-line>We translate</span></span>
          <span class="line-mask"><span data-line>brands into</span></span>
          <span class="line-mask"><span data-line><em>visual language</em></span></span>
        </h1>
        <div class="hero-foot t-small">
          <p v-reveal="{ intro: true, delay: 0.5 }">— Visual Strategy Studio, Amman</p>
          <p v-reveal="{ intro: true, delay: 0.6 }" class="hero-loc">2025 — Amman, JO</p>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="stats theme-light" data-theme="light" aria-label="Studio in numbers">
      <ul class="container">
        <li v-for="(s, i) in stats" :key="s.value" class="stat">
          <p v-reveal="{ delay: i * 0.08 }" class="stat-num t-h1">{{ s.value }}<span>{{ s.unit }}</span></p>
          <p v-reveal="{ delay: i * 0.08 + 0.1 }" class="stat-desc t-small">{{ s.desc[0] }}<br>{{ s.desc[1] }}</p>
        </li>
      </ul>
    </section>

    <!-- MARQUEE -->
    <section class="marquee theme-light" data-theme="light" aria-label="Disciplines">
      <ul class="sr-only">
        <li v-for="m in marquee" :key="m">{{ m }}</li>
      </ul>
      <div ref="track" class="marquee-track" aria-hidden="true">
        <template v-for="n in 2" :key="n">
          <span v-for="m in marquee" :key="`${n}-${m}`" class="marquee-item t-h2">{{ m }}<i class="star" /></span>
        </template>
      </div>
    </section>

    <!-- WORK -->
    <section id="work" class="work theme-light" data-theme="light" aria-labelledby="work-title">
      <div class="container work-head">
        <h2 id="work-title" v-reveal class="work-title t-h0">
          <span class="line-mask"><span data-line>Our <em>Work</em></span></span>
        </h2>
        <p v-reveal class="label work-label">Selected Projects</p>
      </div>
      <ol class="container work-grid">
        <li v-for="(w, i) in selectedWork" :key="w.title" class="work-item" :class="i % 2 ? 'is-right' : 'is-left'">
          <component
            :is="w.slug ? NuxtLink : 'div'"
            :to="w.slug ? `/work/${w.slug}` : undefined"
            class="work-link"
            :data-cursor="w.slug ? 'View' : undefined"
          >
            <MediaFrame
              :id="w.image"
              :alt="w.title"
              :ratio="i % 2 ? 3 / 4 : 4 / 5"
              :sizes="i % 2 ? '(max-width: 600px) 84vw, 32vw' : '(max-width: 600px) 84vw, 42vw'"
            />
            <p class="work-caption t-small">
              <span class="work-name">{{ w.title }}</span>
              <span class="work-cat">{{ w.category }}</span>
              <span class="work-num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            </p>
          </component>
        </li>
      </ol>
    </section>

    <!-- PHILOSOPHY -->
    <section ref="reel" class="reel theme-dark" data-theme="dark" aria-label="Creativity plus strategy">
      <p class="reel-label label">The Lōn equation</p>
      <p class="reel-words t-h1">
        <span ref="reelLeft" class="w"><em>Creativity</em></span>
        <span class="op">+</span>
        <span ref="reelRight" class="w"><em>Strategy</em></span>
      </p>
      <p class="reel-result t-h1"><span class="op">=</span> <span class="o">Ō</span></p>
    </section>

    <!-- SERVICES -->
    <section id="services" class="services theme-light" data-theme="light" aria-labelledby="services-title">
      <div class="container">
        <p v-reveal class="label s-label">Services</p>
        <h2 id="services-title" v-reveal class="s-title t-h1">
          <span class="line-mask"><span data-line>What We <em>Do</em></span></span>
        </h2>
        <div class="s-intro">
          <p v-reveal class="t-h4">Lōn Visuals provides <strong>strategic design and visual communication services</strong> that help organizations maintain clarity, consistency, and strong brand presence across all visual touchpoints.</p>
          <p v-reveal class="t-p dim">We act as a reliable visual partner — translating ideas into clear, consistent, and meaningful design.</p>
        </div>
        <ul class="s-list">
          <li v-for="s in services" :key="s.num" class="s-item">
            <span class="s-num t-small">{{ s.num }}</span>
            <h3 class="s-name t-h2">{{ s.name }}</h3>
            <p class="s-desc t-small">{{ s.desc }}</p>
            <span class="s-arrow" aria-hidden="true">↗</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- CLIENTS -->
    <section id="clients" class="clients theme-sand" data-theme="sand" aria-labelledby="clients-title">
      <div class="container">
        <p class="label c-label">Clients</p>
        <h2 id="clients-title" v-reveal class="c-title t-h2">Trusted by leading organizations</h2>
        <ul class="c-grid">
          <li v-for="c in clients" :key="c.src" class="c-cell">
            <img :src="c.src" :alt="c.name" loading="lazy" decoding="async" width="200" height="60">
          </li>
        </ul>
      </div>
    </section>

    <!-- STUDIO -->
    <section id="studio" class="studio theme-dark" data-theme="dark" aria-labelledby="studio-title">
      <div class="container">
        <div class="st-visual">
          <MediaFrame :id="HERO_IMAGE" alt="Creation is the craft of turning vision into reality" :ratio="4 / 5" sizes="(max-width: 600px) 84vw, 40vw" :travel="16" :scale="[1.25, 1.1]" />
          <p class="st-tag t-sub">Est. Amman · 2015</p>
        </div>
        <div class="st-content">
          <p v-reveal class="label">Studio</p>
          <h2 id="studio-title" v-reveal class="st-title t-h1">
            <span class="line-mask"><span data-line>Creativity.</span></span>
            <span class="line-mask"><span data-line><em>Direction.</em></span></span>
            <span class="line-mask"><span data-line>Design.</span></span>
          </h2>
          <p v-reveal class="st-body t-h4">Lōn Visuals is a strategic brand and visual communication studio dedicated to helping organizations communicate with clarity and impact. We combine creativity with structured thinking to build visual systems that support brands across their daily communication, corporate presence, and long-term evolution.</p>
        </div>
      </div>
    </section>
  </PageShell>
</template>

<style scoped>
/* HERO */
.hero { height: calc(var(--vh) * 100); min-height: 560px; overflow: hidden; }
.hero-media { position: absolute; inset: 0; will-change: transform, opacity; }
.hero-media :deep(picture), .hero-media :deep(img) { width: 100%; height: 100%; object-fit: cover; object-position: center 25%; }
.hero-vignette { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(24, 22, 14, 0.35) 0%, rgba(24, 22, 14, 0.05) 35%, rgba(24, 22, 14, 0.55) 100%); }
.hero-inner { position: relative; height: 100%; align-content: end; padding-bottom: 3.4vw; }
.hero-sub { grid-column: 2 / 7; max-width: 32em; margin-bottom: 4.4vw; color: var(--c-paper); }
.hero-title {
  grid-column: 2 / -1; display: flex; flex-direction: column;
  font-family: var(--f-display); font-weight: 300;
  font-size: 11.8vw; line-height: 0.9; letter-spacing: -0.035em;
  color: var(--c-paper);
}
.hero-title em { color: var(--c-gold-2); }
.hero-foot { grid-column: 2 / -1; display: flex; justify-content: space-between; margin-top: 2.6vw; color: rgba(245, 242, 234, 0.7); }

/* STATS */
.stats { padding: 11vw 0 6vw; }
.stats ul { row-gap: 8vw; }
.stat { grid-column: span 2; }
.stat:first-child { grid-column: 2 / span 2; }
.stat:nth-child(2) { grid-column: 5 / span 2; }
.stat:nth-child(3) { grid-column: 7 / span 2; }
.stat:nth-child(4) { grid-column: 9 / span 3; }
.stat-num { font-weight: 300; white-space: nowrap; font-size: 7.6vw; line-height: 1; letter-spacing: -0.02em; }
.stat-num span { color: var(--accent); font-style: italic; }
.stat-desc { margin-top: 1.2vw; color: var(--fg-2); }

/* MARQUEE */
.marquee { padding: 3vw 0 7vw; overflow: hidden; border-top: 1px solid var(--rule); }
.marquee-track { display: flex; width: max-content; padding-top: 3vw; }
.marquee-item { display: inline-flex; align-items: center; white-space: nowrap; font-family: var(--f-display); font-weight: 300; font-style: italic; padding-right: 2.8vw; }
.star { display: inline-block; width: 0.4em; height: 0.4em; margin-left: 2.8vw; background: var(--accent); clip-path: polygon(50% 0, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0 50%, 39% 39%); }

/* WORK */
.work { padding: 8vw 0 14vw; }
.work-head { align-items: end; }
.work-title { grid-column: 1 / 10; font-weight: 300; margin-left: -0.5vw; }
.work-label { grid-column: 10 / 12; justify-self: start; margin-bottom: 3.2vw; }
.work-grid { margin-top: 6vw; align-items: start; }
/* Exo Ape's staggered rhythm: large left, smaller right dropped by a third — DOM order stays 01→09 */
.work-grid { row-gap: 10vw; padding-bottom: 22vw; }
.is-left { grid-column: 2 / 7; }
.is-right { grid-column: 8 / 12; transform: translateY(22vw); }
.work-link { display: block; }
.work-link :deep(.media img) { transition: transform 1.2s var(--ease-out); }
.work-caption { display: flex; gap: 0.4em; align-items: baseline; margin-top: 1.4vw; }
.work-cat::before { content: '— '; }
.work-name { color: var(--fg); font-weight: 500; }
.work-cat { color: var(--fg-2); }
.work-num { margin-left: auto; color: var(--fg-2); font-variant-numeric: tabular-nums; }
@media (hover: hover) {
  .work-link[href]:hover :deep(.media img) { transform: scale(1.04); }
  .work-link[href]:hover .work-name { font-style: italic; }
}

/* PHILOSOPHY — "Play Reel" */
.reel { min-height: calc(var(--vh) * 100); display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; padding: 10vw 0; text-align: center; }
.reel-label { position: absolute; top: 5vw; left: 50%; transform: translateX(-50%); color: var(--fg-2); }
.reel-words { display: flex; align-items: baseline; justify-content: center; gap: 3vw; white-space: nowrap; font-weight: 300; }
.reel-words .w { display: inline-block; will-change: transform; }
.reel-words em, .reel-result .o { color: var(--c-paper); }
.op { color: var(--accent); font-style: italic; }
.reel-result { margin-top: 2vw; font-weight: 300; }
.reel-result .o { font-style: italic; color: var(--c-gold-2); }

/* SERVICES */
.services { padding: 14vw 0 12vw; }
.s-label { grid-column: 2 / 6; }
.s-title { grid-column: 2 / 12; margin-top: 2vw; }
.s-intro { grid-column: 7 / 12; margin-top: 4vw; display: grid; gap: 1.6vw; }
.s-intro strong { font-weight: 450; }
.dim { color: var(--fg-2); }
.s-list { grid-column: 2 / 12; margin-top: 8vw; border-top: 1px solid var(--rule); }
.s-item {
  position: relative; display: grid; grid-template-columns: 1fr 4fr 4fr 1fr; align-items: baseline;
  column-gap: var(--gutter); padding: 2.6vw 0 2.8vw; border-bottom: 1px solid var(--rule);
}
.s-item::before { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px; background: var(--fg); transform: scaleX(0); transform-origin: right; transition: transform 0.9s var(--ease-in-out); }
.s-num { color: var(--fg-2); }
.s-name { font-family: var(--f-display); font-weight: 300; transition: transform 0.9s var(--ease-out); }
.s-desc { color: var(--fg-2); max-width: 30em; }
.s-arrow { justify-self: end; font-size: var(--fs-h4); transition: transform 0.9s var(--ease-out); }
@media (hover: hover) {
  .s-item:hover::before { transform: scaleX(1); transform-origin: left; }
  .s-item:hover .s-name { transform: translateX(1.4vw); font-style: italic; }
  .s-item:hover .s-arrow { transform: rotate(45deg); }
}

/* CLIENTS */
.clients { padding: 12vw 0; }
.c-label { grid-column: 2 / 5; }
.c-title { grid-column: 5 / 11; font-family: var(--f-display); font-weight: 300; }
.c-grid { grid-column: 2 / 12; margin-top: 7vw; display: grid; grid-template-columns: repeat(5, 1fr); border-top: 1px solid var(--rule); border-left: 1px solid var(--rule); }
.c-cell { aspect-ratio: 16 / 9; display: flex; align-items: center; justify-content: center; border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 1.6vw; }
.c-cell img { max-width: 78%; max-height: 52%; width: auto; height: auto; filter: brightness(0); opacity: 0.72; transition: opacity 0.5s var(--ease-out); }
@media (hover: hover) { .c-cell:hover img { opacity: 1; } }

/* STUDIO */
.studio { padding: 14vw 0; }
.st-visual { grid-column: 2 / 6; position: relative; }
.st-tag { margin-top: 1.2vw; color: var(--fg-2); }
.st-content { grid-column: 7 / 12; align-self: center; }
.st-title { margin-top: 2vw; display: flex; flex-direction: column; }
.st-body { margin-top: 3vw; color: var(--fg-2); }

/* tablet portrait & small laptops */
@media (min-width: 601px) and (max-width: 1024px) {
  .hero-sub { grid-column: 2 / 9; }
  .hero-title { font-size: 12.5vw; }
  .work-label { grid-column: 9 / 13; }
  .is-left { grid-column: 1 / 7; }
  .is-right { grid-column: 7 / 13; }
  .work-caption { flex-wrap: wrap; }
  .work-cat { order: 3; flex-basis: 100%; }
  .work-cat::before { content: none; }
  .s-intro { grid-column: 5 / 13; }
  .s-list { grid-column: 1 / 13; }
  .s-item { grid-template-columns: 1fr 3fr 5fr 1fr; padding: 3.6vw 0; }
  .c-grid { grid-column: 1 / 13; grid-template-columns: repeat(4, 1fr); }
  .c-title { grid-column: 4 / 13; }
  .st-visual { grid-column: 1 / 6; }
  .st-content { grid-column: 7 / 13; }
  .stat-desc { margin-top: 2vw; }
}

@media (max-width: 600px) {
  .hero { min-height: 0; }
  .hero-inner { padding-bottom: 8vw; }
  .hero-sub { grid-column: 1 / 10; margin-bottom: 10vw; }
  .hero-title { grid-column: 1 / -1; font-size: 13.4vw; margin-left: -0.5vw; }
  .hero-foot { grid-column: 1 / -1; margin-top: 6vw; }

  .stats { padding: 20vw 0 12vw; }
  .stat, .stat:nth-child(n) { grid-column: span 5; }
  .stat-num { font-size: 16vw; }
  .stat-desc { margin-top: 2vw; }

  .marquee { padding: 6vw 0 14vw; }
  .marquee-item { font-size: 10vw; line-height: 1.2; padding-right: 6vw; }
  .star { margin-left: 6vw; }

  .work { padding: 16vw 0 24vw; }
  .work-title { grid-column: 1 / -1; }
  .work-label { grid-column: 1 / -1; margin: 4vw 0 0; }
  .work-grid { margin-top: 12vw; }
  .work-grid { row-gap: 14vw; padding-bottom: 0; }
  .is-left { grid-column: 1 / 10; }
  .is-right { grid-column: 3 / -1; transform: none; }
  .work-caption { margin-top: 3vw; flex-wrap: wrap; }
  .work-cat { flex-basis: 100%; order: 3; }
  .work-cat::before { content: none; }

  .reel { min-height: calc(var(--vh) * 80); }
  .reel-label { top: 14vw; }
  .reel-words { flex-direction: column; align-items: center; gap: 0; font-size: 18vw; line-height: 1.05; }

  .services { padding: 24vw 0; }
  .s-label, .s-title, .s-intro, .s-list { grid-column: 1 / -1; }
  .s-title { margin-top: 4vw; }
  .s-intro { margin-top: 8vw; gap: 4vw; }
  .s-list { margin-top: 14vw; }
  .s-item { grid-template-columns: 2fr 8fr; row-gap: 2vw; padding: 6vw 0; }
  .s-desc { grid-column: 2 / -1; }
  .s-arrow { position: absolute; right: 0; top: 6vw; }

  .clients { padding: 24vw 0; }
  .c-label, .c-title, .c-grid { grid-column: 1 / -1; }
  .c-title { margin-top: 4vw; }
  .c-grid { grid-template-columns: repeat(2, 1fr); margin-top: 10vw; }
  .c-cell { padding: 4vw; }

  .studio { padding: 24vw 0; }
  .st-visual { grid-column: 1 / 9; }
  .st-tag { margin-top: 3vw; }
  .st-content { grid-column: 1 / -1; margin-top: 14vw; }
  .st-title { margin-top: 4vw; }
  .st-body { margin-top: 6vw; }
}
</style>
