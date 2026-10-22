import { clamp, gsap, isTouchDevice, lerp, prefersReducedMotion } from './motion'

/**
 * Smooth scroll, after Exo Ape's Scroll component: each top-level section of the page is
 * translated by a value that eases toward the scroll target at a 0.1 lerp per frame, and
 * sections outside the viewport (±100px threshold) stop being written to.
 *
 * One deliberate difference: Exo Ape feeds the target from raw wheel deltas and hides the
 * native scrollbar. Here the target is the document's real scroll position (a spacer
 * element gives the document its height), so keyboard scrolling, the scrollbar,
 * find-in-page and focus all keep working. Touch devices and reduced-motion users get
 * plain native scroll, as on Exo Ape for touch.
 */

type Section = { el: HTMLElement, top: number, bottom: number, out: boolean }
type Frame = (s: ScrollState) => void

export interface ScrollState {
  current: number
  target: number
  limit: number
  smooth: boolean
  paused: boolean
  vh: number
}

const THRESHOLD = 100

export const scroll: ScrollState = { current: 0, target: 0, limit: 0, smooth: false, paused: false, vh: 0 }

let content: HTMLElement | null = null
let spacer: HTMLElement | null = null
let sections: Section[] = []
let started = false
let resizeObserver: ResizeObserver | null = null
let measureQueued = false
const frames = new Set<Frame>()

export function onFrame(fn: Frame) {
  frames.add(fn)
  return () => frames.delete(fn)
}

function transform(force = false) {
  const y = -scroll.current
  const t = `translate3d(0, ${y}px, 0)`
  for (const s of sections) {
    const top = s.top - scroll.current
    const bottom = s.bottom - scroll.current
    const visible = top < scroll.vh + THRESHOLD && bottom > -THRESHOLD
    if (visible || force) {
      s.out = false
      s.el.style.transform = t
    }
    else if (!s.out) {
      s.out = true
      s.el.style.transform = t
    }
  }
}

export function measure() {
  measureQueued = false
  scroll.vh = window.innerHeight
  document.documentElement.style.setProperty('--vh', `${scroll.vh * 0.01}px`)
  if (!content) return
  if (!scroll.smooth) {
    scroll.limit = Math.max(0, document.documentElement.scrollHeight - scroll.vh)
    return
  }
  // each child of <main> plus the footer moves on its own layer, like Exo Ape's scroll sections
  const children = Array.from(content.querySelectorAll<HTMLElement>(':scope > main > :not(article), :scope > main > article > *, :scope > :not(main)'))
  for (const el of children) el.style.transform = 'translate3d(0, 0, 0)'
  sections = children.map((el) => {
    const r = el.getBoundingClientRect()
    return { el, top: r.top, bottom: r.bottom, out: true }
  })
  const height = sections.length ? sections[sections.length - 1]!.bottom : scroll.vh
  if (spacer) spacer.style.height = `${Math.ceil(height)}px`
  scroll.limit = Math.max(0, height - scroll.vh)
  transform(true)
}

function queueMeasure() {
  if (measureQueued) return
  measureQueued = true
  requestAnimationFrame(measure)
}

function tick() {
  if (!content) return
  scroll.target = clamp(window.scrollY, 0, scroll.limit || window.scrollY)
  if (scroll.smooth) {
    if (!scroll.paused) {
      scroll.current = lerp(scroll.current, scroll.target, 0.1)
      if (Math.abs(scroll.current - scroll.target) < 0.1) scroll.current = scroll.target
      if (scroll.current < 0.1) scroll.current = 0
      transform()
    }
  }
  else {
    scroll.current = scroll.target
  }
  for (const fn of frames) fn(scroll)
}

/** Keep keyboard focus visible: the page is fixed, so the browser can't scroll it into view for us. */
function onFocusIn(e: FocusEvent) {
  if (!scroll.smooth || !content) return
  const el = e.target as HTMLElement
  if (!content.contains(el)) return
  const r = el.getBoundingClientRect()
  if (r.top < 80 || r.bottom > scroll.vh - 40) {
    const y = clamp(r.top + scroll.current - scroll.vh * 0.35, 0, scroll.limit)
    window.scrollTo(0, y)
  }
}

export function startScroll(spacerEl: HTMLElement) {
  if (started) return
  started = true
  spacer = spacerEl
  scroll.smooth = !isTouchDevice() && !prefersReducedMotion()
  document.documentElement.classList.toggle('has-smooth', scroll.smooth)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  scroll.vh = window.innerHeight
  resizeObserver = new ResizeObserver(queueMeasure)
  window.addEventListener('resize', queueMeasure)
  document.addEventListener('focusin', onFocusIn)
  document.fonts?.ready.then(queueMeasure)
  gsap.ticker.add(tick)
}

/** Point the scroller at a page's content element (called when a page enters). */
export function setScrollContent(el: HTMLElement | null, { reset = true } = {}) {
  if (content && resizeObserver) resizeObserver.unobserve(content)
  content = el
  sections = []
  if (reset) {
    window.scrollTo(0, 0)
    scroll.current = scroll.target = 0
  }
  if (el) {
    resizeObserver?.observe(el)
    measure()
  }
}

export function scrollToY(y: number, immediate = false) {
  const top = clamp(y, 0, scroll.limit || y)
  window.scrollTo({ top, behavior: !scroll.smooth && !immediate && !prefersReducedMotion() ? 'smooth' : 'auto' })
  if (immediate) scroll.current = top
}

/** Document offset of an element inside the current page, independent of the active transform. */
export function offsetOf(el: HTMLElement) {
  return el.getBoundingClientRect().top + scroll.current
}

export function scrollToElement(el: HTMLElement | null, immediate = false) {
  if (!el) return
  scrollToY(offsetOf(el), immediate)
}

export function pauseScroll(paused: boolean) {
  scroll.paused = paused
  document.documentElement.style.overflow = paused ? 'hidden' : ''
}
