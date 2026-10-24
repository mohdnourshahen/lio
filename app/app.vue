<script setup lang="ts">
import type { TransitionProps } from 'vue'
import { EASE, gsap, prefersReducedMotion } from '~/utils/motion'
import { onFrame, pauseScroll, scroll, scrollToElement, startScroll } from '~/utils/scroll'
import { appState } from '~/utils/state'

const spacer = ref<HTMLElement>()
const menu = ref<{ open: () => void, close: (o?: { restoreFocus?: boolean }) => void, visible: boolean }>()
const cursor = ref<{ reset: () => void }>()
const router = useRouter()

const activePage = () => {
  const pages = document.querySelectorAll<HTMLElement>('.page')
  return pages[pages.length - 1] ?? null
}

/* ---------- page transition — Exo Ape's "default" transition, verbatim values ---------- */
let frozenY = 0
router.beforeEach((to, from) => {
  if (import.meta.server || to.path === from.path) return
  frozenY = scroll.current
  if (!scroll.smooth) {
    // native scroll: pin the outgoing page where it is so the incoming one can start at the top
    const page = activePage()
    if (page) Object.assign(page.style, { position: 'fixed', top: `${-frozenY}px`, left: '0', width: '100%' })
  }
})
router.afterEach((to, from) => {
  if (to.path === from.path && to.hash) scrollToElement(document.getElementById(to.hash.slice(1)))
  if (menu.value?.visible) menu.value.close({ restoreFocus: false })
})

const pageTransition: TransitionProps = {
  css: false,
  mode: undefined,
  onLeave(el, done) {
    const page = el as HTMLElement
    document.body.classList.add('is-loading')
    appState.transitioning = true
    cursor.value?.reset()
    if (prefersReducedMotion()) return done()
    if (appState.transition === 'loadProject') {
      // the outgoing page stays on top while its next-project block wipes away (see work/[slug].vue)
      page.style.zIndex = '2'
      page.style.background = 'transparent'
      gsap.delayedCall(1, () => {
        done()
        appState.transition = 'default'
      })
      return
    }
    const vh = window.innerHeight
    if (!scroll.smooth) page.style.transformOrigin = `50% ${frozenY + vh / 2}px`
    gsap.fromTo(page, { scale: 1, rotate: 0, y: 0 }, { scale: 1.3, rotate: -7, y: -vh / 2, duration: 1, ease: EASE.inOut, onComplete: done })
    gsap.fromTo(page.firstElementChild, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: EASE.inOut })
  },
  onEnter(el, done) {
    const page = el as HTMLElement
    const finish = () => {
      appState.transitioning = false
      document.body.classList.remove('is-loading')
      done()
      // arriving on a section link (e.g. /#services from a case study): land on it once the page
      // has settled — positions taken mid-transition are skewed by the enter animation
      const hash = router.currentRoute.value.hash
      if (hash) {
        if (!appState.menuOpen) pauseScroll(false)
        scrollToElement(document.getElementById(hash.slice(1)), true)
      }
    }
    if (prefersReducedMotion()) return finish()
    if (appState.transition === 'loadProject') {
      gsap.delayedCall(1, finish)
      return
    }
    gsap.fromTo(page, { clipPath: 'polygon(0% 100%, 100% 110%, 100% 100%, 0% 100%)', zIndex: 2 }, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 1, ease: EASE.inOut, clearProps: 'all',
    })
    gsap.fromTo(page.lastElementChild, { scale: 1.3, rotate: 7, y: window.innerHeight / 2 }, {
      scale: 1, rotate: 0, y: 0, duration: 1, ease: EASE.inOut, clearProps: 'transform', onComplete: finish,
    })
  },
}

/* ---------- menu — the page tilts away underneath it (Exo Ape's scroll:leave / scroll:enter) ---------- */
function toggleMenu() {
  if (appState.menuAnimating) return
  const page = activePage()
  const vh = window.innerHeight
  const reduced = prefersReducedMotion()
  if (!menu.value?.visible) {
    menu.value?.open()
    pauseScroll(true)
    if (page && !reduced) {
      page.style.transformOrigin = scroll.smooth ? '' : `50% ${scroll.current + vh / 2}px`
      gsap.fromTo(page.querySelector('.page-content'), { scale: 1, rotate: 0, y: 0 }, { scale: 1.3, rotate: 7, y: vh / 2, duration: 1, ease: EASE.inOut })
    }
  }
  else {
    menu.value?.close()
    pauseScroll(false)
    if (page && !reduced) {
      gsap.fromTo(page.querySelector('.page-content'), { scale: 1.3, rotate: 7, y: vh / 2 }, { scale: 1, rotate: 0, y: 0, duration: 1, ease: EASE.inOut, clearProps: 'transform' })
    }
  }
}
watch(() => appState.menuOpen, (open) => {
  // closed by navigation or Escape rather than the button: restore page + scroll
  if (!open && document.documentElement.style.overflow === 'hidden') {
    pauseScroll(false)
    const content = activePage()?.querySelector('.page-content')
    if (content) gsap.to(content, { scale: 1, rotate: 0, y: 0, duration: 1, ease: EASE.inOut, clearProps: 'transform' })
  }
})
function onMenuClose() {
  if (menu.value?.visible) toggleMenu()
}

function onPreloaderDone() {
  appState.loading = false
  // let the first page's intro (scheduled at 2.5s) finish before switching to the transition timing
  gsap.delayedCall(1.5, () => { appState.firstLoad = false })
}

onMounted(() => {
  startScroll(spacer.value!)
  /* header colour follows whichever [data-theme] section sits under it */
  onFrame((s) => {
    appState.scrolled = s.current > 60
    if (appState.menuOpen) return
    const probe = 40
    const page = activePage()
    if (!page) return
    for (const sec of page.querySelectorAll<HTMLElement>('[data-theme]')) {
      const r = sec.getBoundingClientRect()
      if (r.top <= probe && r.bottom > probe) {
        appState.headerTheme = sec.dataset.theme as typeof appState.headerTheme
        break
      }
    }
  })
})
</script>

<template>
  <div class="app">
    <a href="#main" class="skip-link">Skip to content</a>
    <SitePreloader @finished="onPreloaderDone" />
    <SiteHeader @toggle="toggleMenu" />
    <SiteMenu ref="menu" @close="onMenuClose" />
    <MouseCursor ref="cursor" />
    <NuxtPage :transition="pageTransition" />
    <div ref="spacer" class="scroll-spacer" aria-hidden="true" />
  </div>
</template>

<style>
body.is-loading { pointer-events: none; }
</style>
