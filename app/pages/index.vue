<script setup lang="ts">
import { EASE, clamp, gsap, isMobileWidth, prefersReducedMotion } from '~/utils/motion'
import { assetUrl } from '~/utils/assets'
import { onFrame } from '~/utils/scroll'
import { HERO_SLIDES, clients, marquee, projects, selectedWork, services, site, stats } from '~/utils/site'

const workCount = String(selectedWork.length).padStart(2, '0')
import { appState, introDelay } from '~/utils/state'

const NuxtLink = resolveComponent('NuxtLink')
const base = useSiteUrl()
useSeo({
  title: 'Lōn Visuals — Branding & Visual Identity Studio in Amman, Jordan',
  description: 'Branding and visual identity studio in Amman, Jordan: brand strategy, identity systems, guidelines and brand experience for leading organizations across MENA.',
  path: '/',
  ogImage: 'home.jpg',
  ogImageAlt: 'Lōn Visuals — We translate brands into visual language',
  jsonLd: [
    organizationLd(base),
    founderLd(base),
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
  // the image settles from 1.2 as the title rises — the capabilities-deck reveal
  gsap.fromTo(heroMedia.value!.querySelector('.hero-slides'), { scale: 1.2 }, { scale: 1, duration: 2.8, ease: EASE.out, delay: Math.max(0, introDelay() - 0.9) })

  stopHero = onFrame((s) => {
    const r = hero.value!.getBoundingClientRect()
    if (r.bottom < 0) return
    heroTl.progress(clamp(-r.top / r.height, 0, 1))
    if (appState.loading || appState.firstLoad) return
    // lines tip away once the hero is a fifth scrolled, and return when it's back
    const away = -r.top > s.vh * 0.2
    if (away && heroScrolled) {
      heroScrolled = false
      gsap.killTweensOf(lines)
      gsap.to(lines, { autoAlpha: 0, rotation: -7, yPercent: -100, stagger: 0.1, duration: 1, ease: EASE.out })
    }
    else if (!away && !heroScrolled) {
      heroScrolled = true
      gsap.killTweensOf(lines)
      gsap.to(lines, { autoAlpha: 1, rotation: 0, yPercent: 0, stagger: -0.1, duration: 1, ease: EASE.out })
    }
  })

  stopReel = onFrame((s) => {
    const r = reel.value!.getBoundingClientRect()
    if (r.bottom < 0 || r.top > s.vh) return
    const p = clamp((s.vh - r.top) / (s.vh + r.height * 0.35), 0, 1)
    const spread = (1 - p) * (mobile ? 14 : 20)
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
    <!-- HERO — centred, ceremonial: the capabilities-deck cover -->
    <section ref="hero" class="hero theme-dark" data-theme="dark" aria-labelledby="hero-title" data-cursor="Scroll">
      <div ref="heroMedia" class="hero-media atmos grain">
        <HeroSlides :images="HERO_SLIDES" />
      </div>
      <div class="hero-vignette" aria-hidden="true" />
      <div class="hero-inner">
        <p v-reveal="{ intro: true, delay: -0.2 }" class="hero-kicker caps">Visual Strategy Studio · Amman</p>
        <h1 id="hero-title" ref="heroTitle" v-reveal="{ intro: true }" class="hero-title t-h1">
          <span class="line-mask"><span data-line>We translate</span></span>
          <span class="line-mask"><span data-line>brands into</span></span>
          <span class="line-mask"><span data-line><em>visual language</em></span></span>
        </h1>
        <p v-reveal="{ intro: true, delay: 0.4 }" class="hero-caps caps">Strategic brand &amp; visual communication studio</p>
      </div>
      <div class="hero-foot container">
        <p v-reveal="{ intro: true, delay: 0.6 }" class="hero-est caps">Est. Amman 2015</p>
        <p class="hero-scroll caps" aria-hidden="true"><i />Scroll</p>
        <p v-reveal="{ intro: true, delay: 0.7 }" class="hero-loc caps">2025 — Amman, JO</p>
      </div>
    </section>

    <!-- STATEMENT — the studio's one-line positioning, given its own moment after the cover -->
    <section class="statement theme-light" data-theme="light" aria-label="About Lōn Visuals">
      <div class="container">
        <p v-reveal class="st-line">
          At Lōn Visuals, creativity meets strategy to shape how organizations communicate, evolve, and grow through design.
        </p>
      </div>
    </section>

    <!-- STATS -->
    <section class="stats theme-light" data-theme="light" aria-label="Studio in numbers">
      <ul class="container">
        <li v-for="(s, i) in stats" :key="s.value" class="stat">
          <span class="stat-idx caps">{{ String(i + 1).padStart(2, '0') }}</span>
          <p v-reveal="{ delay: i * 0.08 }" class="stat-num t-h1">{{ s.value }}<span>{{ s.unit }}</span></p>
          <p v-reveal="{ delay: i * 0.08 + 0.1 }" class="stat-desc t-small">{{ s.desc[0] }} {{ s.desc[1] }}</p>
        </li>
      </ul>
    </section>

    <!-- MARQUEE -->
    <section class="marquee theme-light" data-theme="light" aria-label="Disciplines">
      <ul class="sr-only">
        <li v-for="m in marquee" :key="m">{{ m }}</li>
      </ul>
      <div class="marquee-rail" aria-hidden="true">
        <div ref="track" class="marquee-track">
        <!-- four copies: each half of the track must be wider than the viewport for a seamless -50% loop -->
        <template v-for="n in 4" :key="n">
          <span v-for="m in marquee" :key="`${n}-${m}`" class="marquee-item">{{ m }}<i class="dot" /></span>
        </template>
        </div>
      </div>
    </section>

    <!-- WORK -->
    <section id="work" class="work theme-dark" data-theme="dark" aria-labelledby="work-title">
      <div class="container work-head">
        <p v-reveal class="label work-label">Selected Projects</p>
        <h2 id="work-title" v-reveal class="work-title t-h0">
          <span class="line-mask"><span data-line>Our <em>Work</em><sup class="work-count">({{ workCount }})</sup></span></span>
        </h2>
      </div>
      <ol class="container work-grid">
        <li v-for="(w, i) in selectedWork" :key="w.title" class="work-item" :class="i % 2 ? 'is-right' : 'is-left'">
          <component
            :is="w.slug ? NuxtLink : 'div'"
            :to="w.slug ? `/work/${w.slug}` : undefined"
            class="work-link"
            :data-cursor="w.slug ? 'View' : undefined"
            :data-cover-host="w.slug ? '' : undefined"
          >
            <WorkCover
              :images="[w.image, ...(w.more ?? [])]"
              :alt="w.title"
              :ratio="w.ratio === 'image' ? undefined : (i % 2 ? 3 / 4 : 4 / 5)"
              :focus="w.focus"
              :travel="w.ratio === 'image' ? 4 : 12"
              :scale="w.ratio === 'image' ? [1.05, 1.05] : [1.15, 1.15]"
              :sizes="i % 2 ? '(max-width: 600px) 84vw, 32vw' : '(max-width: 600px) 84vw, 42vw'"
            />
            <div class="work-caption">
              <span class="work-num caps">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="work-name">{{ w.title }}</span>
              <span class="work-cat t-small">{{ w.category }}</span>
            </div>
          </component>
        </li>
      </ol>
    </section>

    <!-- EQUATION — Exo Ape's "Play Reel": words travel in from the edges and meet -->
    <section ref="reel" class="reel theme-sand" data-theme="sand" aria-label="Creativity plus strategy equals Lōn">
      <p class="reel-label caps">The Lōn equation</p>
      <p class="reel-words t-h1" aria-hidden="true">
        <span ref="reelLeft" class="w">Creativity</span>
        <span class="op">+</span>
        <span ref="reelRight" class="w">Strategy</span>
      </p>
      <p class="reel-result" aria-hidden="true"><span class="o">Ō<span class="eq">=</span></span></p>
    </section>

    <!-- SERVICES -->
    <section id="services" class="services theme-dark" data-theme="dark" aria-labelledby="services-title">
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
            <span class="s-num caps">{{ s.num }}</span>
            <h3 class="s-name t-h2">{{ s.name }}</h3>
            <p class="s-desc t-small">{{ s.desc }}</p>
            <span class="s-arrow" aria-hidden="true">↗</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- CLIENTS -->
    <section id="clients" class="clients theme-light" data-theme="light" aria-labelledby="clients-title">
      <div class="container">
        <p v-reveal class="label c-label">Clients</p>
        <h2 id="clients-title" v-reveal class="c-title t-h2">Trusted by leading organizations</h2>
        <ul class="c-grid">
          <li v-for="c in clients" :key="c.src" class="c-cell">
            <img :src="assetUrl(c.src)" :alt="c.name" loading="lazy" decoding="async" width="200" height="60">
          </li>
        </ul>
      </div>
    </section>

    <!-- STUDIO — a craft collage from the work itself -->
    <section id="studio" class="studio theme-dark" data-theme="dark" aria-labelledby="studio-title">
      <div class="container">
        <div class="st-collage" aria-hidden="true">
          <!-- Zeryab Estates, Masar Resort, Sky Falcons — shown at their own proportions -->
          <MediaFrame id="d3f1b2428a" alt="" class="st-a" sizes="(max-width: 600px) 48vw, 20vw" :travel="8" :scale="[1.08, 1.08]" />
          <MediaFrame id="bf6d84ba73" alt="" class="st-b" sizes="(max-width: 600px) 32vw, 16vw" :travel="12" :scale="[1.1, 1.1]" />
          <MediaFrame id="4160c1b692" alt="" class="st-c" sizes="(max-width: 600px) 32vw, 16vw" :travel="16" :scale="[1.12, 1.12]" />
        </div>
        <div class="st-content">
          <p v-reveal class="label">Studio · Est. Amman 2015</p>
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
.dim { color: var(--fg-2); }

/* HERO */
.hero { height: calc(var(--vh) * 100); min-height: 600px; overflow: hidden; display: flex; flex-direction: column; }
.hero-media { position: absolute; inset: 0; will-change: transform, opacity; overflow: hidden; }
.hero-media :deep(picture), .hero-media :deep(img) { width: 100%; height: 100%; object-fit: cover; object-position: center 30%; }
.hero-media :deep(picture) { display: block; }
.hero-media :deep(.hero-slides) { transform-origin: 50% 40%; }
.hero-vignette {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 75% 65% at 50% 50%, rgba(18, 16, 10, 0.05) 0%, rgba(18, 16, 10, 0.4) 72%, rgba(18, 16, 10, 0.78) 100%),
    linear-gradient(180deg, rgba(18, 16, 10, 0.35) 0%, rgba(18, 16, 10, 0) 28%, rgba(18, 16, 10, 0.7) 100%);
}
.hero-inner { position: relative; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding-top: 6vw; }
.hero-kicker { color: rgba(245, 242, 234, 0.72); margin-bottom: 3vw; }
.hero-title { display: flex; flex-direction: column; align-items: center; font-size: 8.4vw; line-height: 1.02; color: var(--c-title); }
.hero-title em { font-size: 1.12em; }
.hero-caps { margin-top: 3.2vw; color: var(--c-title); opacity: 0.92; }
.hero-foot { position: relative; align-items: end; padding-bottom: 3vw; }
.hero-est { grid-column: 2 / 6; color: rgba(245, 242, 234, 0.72); }

/* STATEMENT */
.statement { padding: 13vw 0 4vw; text-align: center; }
.st-line {
  grid-column: 3 / 11; font-family: var(--f-sans); font-weight: 300;
  font-size: max(2.9vw, 22px); line-height: 1.32; letter-spacing: -0.02em; color: var(--c-paper);
}
.hero-scroll { grid-column: 6 / 8; justify-self: center; display: flex; flex-direction: column; align-items: center; gap: 0.9vw; color: rgba(245, 242, 234, 0.6); }
.hero-scroll i { display: block; width: 1px; height: 3.4vw; background: linear-gradient(var(--c-title), transparent); animation: drip 2.4s var(--ease-in-out) infinite; transform-origin: top; }
@keyframes drip { 0% { transform: scaleY(0); } 50% { transform: scaleY(1); } 100% { transform: scaleY(1); opacity: 0; } }
.hero-loc { grid-column: 9 / 12; justify-self: end; color: rgba(245, 242, 234, 0.72); }

/* STATS — four equal columns on hairlines */
.stats { padding: 6vw 0 9vw; }
.stats ul { grid-template-columns: repeat(4, minmax(0, 1fr)); padding: 0 calc(var(--col) + var(--gutter)); }
.stat { display: flex; flex-direction: column; border-top: 1px solid var(--rule); padding-top: 1.6vw; }
.stat + .stat { border-left: 1px solid var(--rule); padding-left: 2vw; }
.stat-idx { color: var(--fg-2); font-size: var(--fs-sub); }
.stat-num { margin-top: 2.6vw; white-space: nowrap; font-size: 5.4vw; line-height: 1; color: var(--c-title); }
.stat-num span { font-family: var(--f-display); font-style: italic; font-size: 0.8em; margin-left: 0.04em; }
.stat-desc { margin-top: 1.6vw; color: var(--fg-2); max-width: 15em; }

/* MARQUEE */
.marquee { padding: 2.4vw 0 9vw; overflow: hidden; }
.marquee-rail { padding: 2.6vw 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.marquee-track { display: flex; width: max-content; }
.marquee-item { display: inline-flex; align-items: center; white-space: nowrap; font-family: var(--f-title); font-size: 2.9vw; line-height: 1.1; color: var(--c-title); padding-right: 3vw; }
.marquee-item:nth-child(even) { font-family: var(--f-display); font-style: italic; font-weight: 300; font-size: 3.2vw; }
.dot { display: inline-block; width: 0.32vw; height: 0.32vw; min-width: 4px; min-height: 4px; margin-left: 3vw; border-radius: 50%; background: var(--c-title); opacity: 0.6; }

/* WORK */
.work { padding: 12vw 0 14vw; }
.work-head { align-items: end; }
.work-label { grid-column: 2 / -1; }
.work-title { grid-column: 2 / -1; margin-top: 2.4vw; }
.work-count { font-family: var(--f-title); font-size: 0.16em; letter-spacing: 0.06em; vertical-align: top; position: relative; top: 0.9em; margin-left: 0.5em; color: var(--fg-2); }
.work-grid { margin-top: 7vw; align-items: start; row-gap: 10vw; padding-bottom: 22vw; }
/* Exo Ape's staggered rhythm: large left, smaller right dropped by a third — DOM order stays 01→09 */
.is-left { grid-column: 2 / 7; }
.is-right { grid-column: 8 / 12; transform: translateY(22vw); }
.work-link { display: block; }
/* hover (see WorkCover): the picture eases in and cycles; the caption lifts 10px and comes to full strength */
@media (hover: hover) and (pointer: fine) {
  .work-caption { opacity: 0.82; transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 1s cubic-bezier(0.16, 1, 0.3, 1); }
  .work-link.is-hovered .work-caption { opacity: 1; transform: translateY(-10px); }
}
html.has-cursor .work-link[href] { cursor: none; }
.work-caption { display: grid; grid-template-columns: auto 1fr; column-gap: 1.2vw; row-gap: 0.3vw; align-items: baseline; margin-top: 1.4vw; }
.work-num { grid-row: span 2; color: var(--c-title); font-size: var(--fs-sub); }
.work-name { font-family: var(--f-title); font-size: max(1.5vw, 17px); line-height: 1.25; color: var(--c-paper); transition: color 0.6s; }
.work-cat { color: var(--fg-2); }
@media (hover: hover) {
  .work-link[href]:hover .work-name { color: var(--c-title); }
}

/* EQUATION */
.reel { min-height: calc(var(--vh) * 100); display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; padding: 10vw 0; text-align: center; }
.reel-label { position: absolute; top: 6vw; left: 50%; transform: translateX(-50%); color: var(--fg-2); }
.reel-words { display: flex; align-items: center; justify-content: center; gap: 2.6vw; white-space: nowrap; font-size: 7vw; color: var(--c-title); }
.reel-words .w { display: inline-block; will-change: transform; }
.reel-words .w:last-child { font-family: var(--f-display); font-style: italic; font-weight: 300; font-size: 1.12em; }
.op { font-family: var(--f-display); font-weight: 300; font-size: 0.8em; color: var(--fg-2); }
.reel-result { margin-top: 1vw; color: var(--c-title); }
.reel-result .eq { position: absolute; right: 100%; top: 50%; transform: translate(-0.4em, -42%); font-family: var(--f-display); font-weight: 300; font-size: 0.34em; color: var(--fg-2); }
.reel-result .o { position: relative; display: inline-block; font-family: var(--f-title); font-size: 15vw; line-height: 1; }

/* SERVICES */
.services { padding: 14vw 0 12vw; }
.s-label { grid-column: 2 / 6; }
.s-title { grid-column: 2 / 12; margin-top: 2.4vw; }
.s-intro { grid-column: 7 / 12; margin-top: 4vw; display: grid; gap: 1.6vw; }
.s-intro strong { font-weight: 450; color: var(--c-paper); }
.s-intro .t-h4 { color: rgba(245, 242, 234, 0.82); }
.s-list { grid-column: 2 / 12; margin-top: 8vw; border-top: 1px solid var(--rule); }
.s-item {
  position: relative; display: grid; grid-template-columns: 1fr 4fr 4fr 1fr; align-items: baseline;
  column-gap: var(--gutter); padding: 2.8vw 0 3vw; border-bottom: 1px solid var(--rule);
}
.s-item::before { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px; background: var(--c-title); transform: scaleX(0); transform-origin: right; transition: transform 0.9s var(--ease-in-out); }
.s-num { color: var(--fg-2); font-size: var(--fs-sub); }
.s-name { transition: transform 0.9s var(--ease-out); }
.s-desc { color: var(--fg-2); max-width: 30em; }
.s-arrow { justify-self: end; font-size: var(--fs-h4); color: var(--c-title); transition: transform 0.9s var(--ease-out); }
@media (hover: hover) {
  .s-item:hover::before { transform: scaleX(1); transform-origin: left; }
  .s-item:hover .s-name { transform: translateX(1.4vw); }
  .s-item:hover .s-arrow { transform: rotate(45deg); }
}

/* CLIENTS — borderless field of marks, no empty cells */
.clients { padding: 12vw 0; }
.c-label { grid-column: 2 / 6; }
.c-title { grid-column: 2 / 9; margin-top: 2.4vw; }
.c-grid { grid-column: 2 / 12; margin-top: 6vw; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); border-top: 1px solid var(--rule); }
.c-cell { height: 9vw; min-height: 84px; display: flex; align-items: center; justify-content: center; padding: 1.4vw; border-bottom: 1px solid var(--rule); }
.c-cell img { max-width: 76%; max-height: 50%; width: auto; height: auto; opacity: 0.62; transition: opacity 0.6s var(--ease-out); }
@media (hover: hover) { .c-cell:hover img { opacity: 1; } }

/* STUDIO */
.studio { padding: 14vw 0; }
.st-collage { grid-column: 2 / 7; position: relative; height: 33vw; }
.st-collage :deep(.media) { position: absolute; }
.st-a { left: 0; top: 0; width: 20vw; }
.st-b { left: 22vw; top: 4vw; width: 16vw; }
.st-c { left: 22vw; top: 18.6vw; width: 16vw; }
.st-content { grid-column: 8 / 12; align-self: center; }
.st-title { margin-top: 2.4vw; display: flex; flex-direction: column; }
.st-body { margin-top: 3vw; color: var(--fg-2); }

/* tablet portrait & small laptops */
@media (min-width: 601px) and (max-width: 1024px) {
  .hero-title { font-size: 9.4vw; }
  .hero-est { grid-column: 1 / 6; }
  .st-line { grid-column: 2 / 12; }
  .hero-loc { grid-column: 9 / 13; }
  .stats ul { padding: 0; }
  .is-left { grid-column: 1 / 7; }
  .is-right { grid-column: 7 / 13; }
  .s-intro { grid-column: 5 / 13; }
  .s-list { grid-column: 1 / 13; }
  .s-item { grid-template-columns: 1fr 3fr 5fr 1fr; padding: 3.6vw 0; }
  .c-grid { grid-column: 1 / 13; grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .st-collage { grid-column: 1 / 7; }
  .st-content { grid-column: 7 / 13; }
}

@media (max-width: 600px) {
  .hero { min-height: 0; }
  .hero-inner { padding: 22vw 0 0; }
  .hero-kicker { margin-bottom: 8vw; }
  .hero-title { font-size: 11.6vw; }
  .hero-caps { margin-top: 8vw; max-width: 70vw; }
  .hero-foot { padding-bottom: 8vw; row-gap: 6vw; }
  .hero-est { grid-column: 1 / -1; justify-self: center; }
  .statement { padding: 24vw 0 6vw; }
  .st-line { grid-column: 1 / -1; font-size: 6.4vw; }
  .hero-scroll { display: none; }
  .hero-loc { grid-column: 1 / -1; justify-self: center; }

  .stats { padding: 10vw 0 12vw; }
  .stats ul { grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 0; row-gap: 10vw; }
  .stat { padding-top: 4vw; }
  .stat + .stat { border-left: 0; padding-left: 0; }
  .stat:nth-child(even) { border-left: 1px solid var(--rule); padding-left: 5vw; }
  .stat-num { font-size: 13vw; margin-top: 5vw; }
  .stat-desc { margin-top: 3vw; }

  .marquee { padding: 4vw 0 16vw; }
  .marquee-rail { padding: 6vw 0; }
  .marquee-item { font-size: 8vw; padding-right: 7vw; }
  .marquee-item:nth-child(even) { font-size: 8.8vw; }
  .dot { margin-left: 7vw; }

  .work { padding: 22vw 0 24vw; }
  .work-label, .work-title { grid-column: 1 / -1; }
  .work-title { margin-top: 5vw; }
  .work-grid { margin-top: 12vw; row-gap: 14vw; padding-bottom: 0; }
  .is-left { grid-column: 1 / 10; }
  .is-right { grid-column: 3 / -1; transform: none; }
  .work-caption { margin-top: 3.4vw; column-gap: 3vw; row-gap: 1vw; }
  .work-link[href] .work-caption { padding-right: 16vw; } /* room for the image counter */
  .work-name { font-size: 4.8vw; }

  .reel { min-height: calc(var(--vh) * 85); }
  .reel-label { top: 16vw; }
  .reel-words { flex-direction: column; gap: 1vw; font-size: 12vw; }
  .reel-result .o { font-size: 34vw; }

  .services { padding: 24vw 0; }
  .s-label, .s-title, .s-intro, .s-list { grid-column: 1 / -1; }
  .s-title { margin-top: 5vw; }
  .s-intro { margin-top: 8vw; gap: 4vw; }
  .s-list { margin-top: 14vw; }
  .s-item { grid-template-columns: 2fr 8fr; row-gap: 2vw; padding: 6vw 0; }
  .s-desc { grid-column: 2 / -1; }
  .s-arrow { position: absolute; right: 0; top: 6vw; }

  .clients { padding: 24vw 0; }
  .c-label, .c-title, .c-grid { grid-column: 1 / -1; }
  .c-title { margin-top: 5vw; }
  .c-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 10vw; }
  .c-cell { height: 22vw; padding: 4vw; }

  .studio { padding: 24vw 0; }
  .st-collage { grid-column: 1 / -1; height: 61vw; }
  .st-a { left: 0; width: 48vw; }
  .st-b { left: 52vw; top: 4vw; width: 32vw; }
  .st-c { left: 52vw; top: 32vw; width: 32vw; }
  .st-content { grid-column: 1 / -1; margin-top: 12vw; }
  .st-title { margin-top: 5vw; }
  .st-body { margin-top: 6vw; }
}
</style>
