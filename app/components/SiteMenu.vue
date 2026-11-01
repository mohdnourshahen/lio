<script setup lang="ts">
import { EASE, gsap, isTouchDevice, prefersReducedMotion } from '~/utils/motion'
import { HERO_IMAGE, nav, site } from '~/utils/site'
import { appState } from '~/utils/state'

/**
 * Full-screen menu, transcribed from Exo Ape's Menu component:
 * - panel wipes down with a skewed clip-path polygon (1.1 × viewport height on the right edge)
 * - inner wrapper settles from scale 1.3 / rotate -7° / -½ viewport
 * - links rise line by line (0.5s delay, 0.1s stagger), socials follow at 1s
 * - hovering a link cross-fades its image in from scale 1.3 / rotate 7°
 */
const emit = defineEmits<{ close: [] }>()
const route = useRoute()

const links = [
  { label: 'Home', to: '/', image: HERO_IMAGE, alt: 'Lōn Visuals studio visual' },
  ...nav.map((n, i) => ({ ...n, image: ['ab4f72775a', 'f04c0008a2', '76a786afab', '7e084baf44', '5749a13a08'][i]!, alt: '' })),
]

const root = ref<HTMLElement>()
const wrapper = ref<HTMLElement>()
const images = ref<HTMLElement[]>([])
const visible = ref(false)
const current = ref(0)
let lastFocus: HTMLElement | null = null

function showImage(i: number, animate = true) {
  if (i === current.value && animate) return
  current.value = i
  const items = images.value
  if (!animate || prefersReducedMotion()) {
    gsap.set(items, { autoAlpha: 0, zIndex: 1 })
    gsap.set(items[i]!, { autoAlpha: 1, zIndex: 3 })
    return
  }
  gsap.killTweensOf(items)
  gsap.timeline({ defaults: { ease: EASE.out, duration: 1 } })
    .set(items, { zIndex: 1 }, 0)
    .to(items, { autoAlpha: 0 }, 0)
    .set(items[i]!, { zIndex: 3 }, 0)
    .fromTo(items[i]!, { autoAlpha: 0, scale: 1.3, rotate: 7 }, { autoAlpha: 1, scale: 1, rotate: 0, clearProps: 'transform' }, 0)
}

async function open() {
  if (appState.menuAnimating) return
  lastFocus = document.activeElement as HTMLElement
  visible.value = true
  appState.menuOpen = true
  await nextTick()
  const el = root.value!
  const vh = window.innerHeight
  showImage(Math.max(0, links.findIndex(l => l.to === route.path)), false)
  el.querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
  if (prefersReducedMotion()) return
  appState.menuAnimating = true
  gsap.fromTo(el, { clipPath: 'polygon(0 0, 100% 0, 100% 0px, 0 0px)' }, {
    clipPath: `polygon(0 0, 100% 0, 100% ${vh * 1.1}px, 0 ${vh}px)`, duration: 1, ease: EASE.inOut, clearProps: 'clipPath',
  })
  gsap.fromTo(wrapper.value!, { scale: 1.3, rotate: -7, y: -vh / 2, opacity: 0.3 }, {
    scale: 1, rotate: 0, y: 0, opacity: 1, duration: 1, ease: EASE.inOut, clearProps: 'all',
  })
  gsap.fromTo(el.querySelectorAll('.main-line'), { rotate: 7, yPercent: 100, opacity: 0 }, {
    rotate: 0, yPercent: 0, opacity: 1, stagger: 0.1, ease: EASE.out, delay: 0.5, duration: 1, clearProps: 'all',
  })
  gsap.fromTo(el.querySelectorAll('.social-line'), { rotate: 7, yPercent: 100, opacity: 0 }, {
    rotate: 0, yPercent: 0, opacity: 1, stagger: 0.1, ease: EASE.out, delay: 1, duration: 1, clearProps: 'all',
  })
  gsap.delayedCall(1, () => { appState.menuAnimating = false })
}

function close({ restoreFocus = true } = {}) {
  if (!visible.value || appState.menuAnimating) return
  appState.menuOpen = false
  const done = () => {
    visible.value = false
    appState.menuAnimating = false
    if (restoreFocus) lastFocus?.focus({ preventScroll: true })
  }
  if (prefersReducedMotion()) return done()
  appState.menuAnimating = true
  const vh = window.innerHeight
  gsap.fromTo(root.value!, { clipPath: `polygon(0 0px, 100% 0px, 100% ${vh * 1.1}px, 0 ${vh}px)` }, {
    clipPath: 'polygon(0 0px, 100% 0px, 100% 0px, 0 0px)', duration: 1, ease: EASE.inOut, onComplete: done,
  })
  gsap.to(wrapper.value!, { scale: 1.3, rotate: -7, y: -vh / 2, opacity: 0.3, duration: 1, ease: EASE.inOut })
}

function onKeydown(e: KeyboardEvent) {
  if (!visible.value) return
  if (e.key === 'Escape') { e.preventDefault(); emit('close') }
  if (e.key === 'Tab') {
    // keep focus inside the dialog, including the header's close button
    const focusables = [document.querySelector<HTMLElement>('.menu-button'), ...root.value!.querySelectorAll<HTMLElement>('a')].filter(Boolean) as HTMLElement[]
    const first = focusables[0]!, last = focusables[focusables.length - 1]!
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

const touch = ref(false)
onMounted(() => { touch.value = isTouchDevice() })

defineExpose({ open, close, visible })
</script>

<template>
  <div
    v-show="visible"
    id="site-menu"
    ref="root"
    class="site-menu theme-light"
    role="dialog"
    aria-modal="true"
    aria-label="Site menu"
  >
    <div ref="wrapper" class="wrapper">
      <div class="container">
        <nav class="main" aria-label="Menu">
          <ul>
            <li v-for="(l, i) in links" :key="l.to" class="main-item">
              <NuxtLink
                :to="l.to"
                class="main-link t-h1"
                @mouseenter="!touch && showImage(i)"
                @focus="showImage(i)"
                @click="emit('close')"
              >
                <span class="main-line">{{ l.label }}</span>
              </NuxtLink>
              <!-- sectors under Solutions: small links beside the big word -->
              <ul v-if="'children' in l && l.children" class="sub" aria-label="Solutions by sector">
                <li v-for="c in l.children" :key="c.label" class="mask">
                  <NuxtLink :to="c.to" class="sub-link caps u-link u-link--rev" @click="emit('close')">{{ c.label }}</NuxtLink>
                </li>
              </ul>
            </li>
          </ul>
        </nav>

        <div class="side">
          <div class="images" aria-hidden="true">
            <div v-for="l in links" :key="l.to" ref="images" class="image media">
              <MediaImage :id="l.image" alt="" sizes="(max-width: 600px) 1px, 30vw" />
            </div>
          </div>
          <div class="social">
            <p class="caps muted">Follow</p>
            <ul>
              <li v-for="s in site.socials" :key="s.name" class="mask">
                <a :href="s.href" target="_blank" rel="noopener" class="social-line u-link u-link--rev">{{ s.name }}</a>
              </li>
              <li class="mask"><a :href="`mailto:${site.email}`" class="social-line u-link u-link--rev">{{ site.email }}</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.site-menu { position: fixed; inset: 0; z-index: 30; overflow: hidden; }
.wrapper { position: absolute; inset: 0; display: flex; align-items: center; transform-origin: center; }
.container { width: 100%; align-items: end; }
.main { grid-column: 2 / 9; }
.main-item { overflow: hidden; padding-bottom: 0.12em; margin-bottom: -0.12em; display: flex; align-items: baseline; gap: 2vw; }
.sub { flex: none; align-self: center; display: flex; flex-direction: column; gap: 0.5em; white-space: nowrap; }
.sub-link { color: var(--fg-2); font-size: var(--fs-label); }
.main-link { display: inline-block; color: var(--c-title); }
.main-line { display: inline-block; transition: transform 0.8s var(--ease-out), color 0.4s; }
@media (hover: hover) {
  .main-link:hover .main-line { transform: translateX(1.5vw); color: var(--c-paper); }
}
.main-link:focus-visible { outline: none; }
.main-link:focus-visible .main-line { color: var(--c-paper); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 0.12em; }

.side { grid-column: 9 / 12; display: flex; flex-direction: column; gap: 3vw; }
.images { position: relative; aspect-ratio: 4 / 5; overflow: hidden; }
.image { position: absolute; inset: 0; opacity: 0; visibility: hidden; }
.image :deep(img) { width: 100%; height: 100%; object-fit: cover; filter: saturate(0.8) sepia(0.15) brightness(0.8); }
.social ul { margin-top: 0.8vw; display: grid; gap: 0.4vw; }
.mask { overflow: hidden; }
.social-line { display: inline-block; font-size: var(--fs-cta); line-height: 1.5; }
.muted { color: var(--fg-2); }

/* landscape phones: fit six links in a short viewport */
@media (min-width: 601px) and (max-height: 560px) {
  .main-link { font-size: 12.5vh; line-height: 12.5vh; }
  .wrapper { align-items: flex-end; padding-bottom: 6vh; }
}

@media (max-width: 600px) {
  .wrapper { align-items: flex-start; padding-top: calc(var(--vh) * 18); }
  .main { grid-column: 1 / -1; }
  .side { grid-column: 1 / -1; margin-top: 12vw; }
  .images { display: none; }
  .social ul { gap: 2vw; margin-top: 3vw; }
}
</style>
