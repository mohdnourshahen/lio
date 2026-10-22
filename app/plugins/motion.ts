import type { Directive } from 'vue'
import { EASE, clamp, gsap, prefersReducedMotion, setupGsap, SplitText } from '~/utils/motion'
import { onFrame } from '~/utils/scroll'
import { introDelay } from '~/utils/state'

/**
 * v-reveal — Exo Ape's line reveal: lines rise from yPercent 100 with a 7° rotation,
 * fading in, 0.1s stagger, 1s on the custom ease-out.
 *   v-reveal                → plays when the element scrolls into view
 *   v-reveal="{ intro: true }" → plays on page entry (after the preloader / transition)
 * Elements whose children carry [data-line] are treated as pre-split display titles.
 */
interface RevealOpts { intro?: boolean, delay?: number, stagger?: number }
type RevealEl = HTMLElement & { _reveal?: { split?: SplitText, io?: IntersectionObserver, tween?: gsap.core.Tween, timer?: gsap.core.Tween } }

const FROM = { autoAlpha: 0, rotation: 7, yPercent: 100 }

function revealMounted(el: RevealEl, binding: { value?: RevealOpts }) {
  const opts = binding.value || {}
  el.dataset.reveal = ''
  if (prefersReducedMotion()) {
    el.classList.add('is-split')
    return
  }
  setupGsap()
  const state: NonNullable<RevealEl['_reveal']> = {}
  el._reveal = state
  let played = false

  const preSplit = Array.from(el.querySelectorAll<HTMLElement>('[data-line]'))
  const build = (lines: Element[]) => {
    el.classList.add('is-split')
    state.tween?.kill()
    state.tween = gsap.fromTo(lines, FROM, {
      autoAlpha: 1, rotation: 0, yPercent: 0,
      stagger: opts.stagger ?? 0.1, duration: 1, ease: EASE.out,
      paused: true,
    })
    if (played) state.tween.progress(1)
    return state.tween
  }

  if (preSplit.length) build(preSplit)
  else {
    state.split = SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'line',
      autoSplit: true,
      onSplit: self => build(self.lines),
    })
  }

  const play = (delay = 0) => {
    played = true
    state.tween?.delay(delay).play()
  }

  if (opts.intro) {
    const d = introDelay() + (opts.delay || 0)
    state.timer = gsap.delayedCall(0, () => play(d))
  }
  else {
    state.io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        play(opts.delay || 0)
        state.io?.disconnect()
      }
    }, { rootMargin: '0px 0px -8% 0px' })
    state.io.observe(el)
  }
}

function revealUnmounted(el: RevealEl) {
  const s = el._reveal
  if (!s) return
  s.io?.disconnect()
  s.timer?.kill()
  s.tween?.kill()
  s.split?.revert()
}

/**
 * v-parallax — image motion inside a masked frame, driven by the element's progress
 * through the viewport each frame (Exo Ape computes the same progress from
 * getBoundingClientRect in its rAF loop and scrubs a linear timeline).
 *   value: { y: travel in % of frame height (default 12), scale: [from, to] }
 */
interface ParallaxOpts { y?: number, scale?: [number, number] }
type ParallaxEl = HTMLElement & { _parallax?: () => void }

function parallaxMounted(el: ParallaxEl, binding: { value?: ParallaxOpts }) {
  if (prefersReducedMotion()) return
  const inner = el.firstElementChild as HTMLElement | null
  if (!inner) return
  const { y = 12, scale = [1.15, 1.15] } = binding.value || {}
  let last = -1
  el._parallax = onFrame((s) => {
    const r = el.getBoundingClientRect()
    if (r.bottom < -50 || r.top > s.vh + 50) return
    const p = clamp((s.vh - r.top) / (s.vh + r.height), 0, 1)
    if (Math.abs(p - last) < 0.0005) return
    last = p
    const ty = (0.5 - p) * y
    const sc = scale[0] + (scale[1] - scale[0]) * p
    inner.style.transform = `translate3d(0, ${ty}%, 0) scale(${sc})`
  })
}

export default defineNuxtPlugin((nuxtApp) => {
  const ssr = { getSSRProps: () => ({}) }
  const reveal: Directive = import.meta.client ? { mounted: revealMounted, beforeUnmount: revealUnmounted } : ssr
  const parallax: Directive = import.meta.client
    ? { mounted: parallaxMounted, beforeUnmount: (el: ParallaxEl) => el._parallax?.() }
    : ssr
  nuxtApp.vueApp.directive('reveal', reveal)
  nuxtApp.vueApp.directive('parallax', parallax)
  if (import.meta.client) setupGsap()
})
