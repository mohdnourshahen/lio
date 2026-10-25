<script setup lang="ts">
import { gsap, isTouchDevice, prefersReducedMotion } from '~/utils/motion'
import { media } from '~/utils/site'

/**
 * Homepage project cover: a fixed frame holding several images of the same project.
 * Hovering the card (the nearest [data-cover-host]) eases the picture in and cycles the
 * images, each revealed by a bottom-to-top clip-path wipe while the outgoing one drifts up.
 * Touch: swipe sideways to change image. Reduced motion: a plain crossfade.
 */
const props = withDefaults(defineProps<{
  images: string[]
  alt: string
  ratio?: number
  focus?: string
  sizes?: string
  travel?: number
  scale?: [number, number]
}>(), { travel: 12, scale: () => [1.15, 1.15] as [number, number] })

const EASE = 'expo.out' // ≈ cubic-bezier(0.16, 1, 0.3, 1)
const HOLD = 0.7 // seconds an image rests between wipes while hovered
const FIRST = 0.45 // first change comes quickly, so the hover reads as intentional

const root = ref<HTMLElement>()
const zoom = ref<HTMLElement>()
const slides = ref<HTMLElement[]>([])
const digit = ref<HTMLElement>()
const index = ref(0)
const shown = ref(1)

const many = computed(() => props.images.length > 1)
const aspect = computed(() => props.ratio ?? (media[props.images[0]!] ? media[props.images[0]!]!.w / media[props.images[0]!]!.h : 4 / 5))
const pad = (n: number) => String(n).padStart(2, '0')

let host: HTMLElement | null = null
let hovered = false
let animating = false
let timer: gsap.core.Tween | undefined
let reduced = false

function go(next: number) {
  if (animating || !many.value) return
  next = (next + props.images.length) % props.images.length
  if (next === index.value) return
  animating = true
  const out = slides.value[index.value]!
  const inc = slides.value[next]!
  slides.value.forEach(s => gsap.set(s, { zIndex: s === inc ? 2 : s === out ? 1 : 0 }))
  countTo(next + 1)
  const done = () => {
    gsap.set(out, { zIndex: 0, clipPath: 'inset(100% 0% 0% 0%)' })
    gsap.set(out.firstElementChild, { yPercent: 0, scale: 1 })
    index.value = next
    animating = false
  }
  if (reduced) {
    gsap.fromTo(inc, { autoAlpha: 0, clipPath: 'inset(0% 0% 0% 0%)' }, { autoAlpha: 1, duration: 0.6, ease: 'none', onComplete: done })
    return
  }
  gsap.set(inc, { autoAlpha: 1 })
  gsap.fromTo(inc, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: EASE })
  gsap.fromTo(inc.firstElementChild, { yPercent: 15, scale: 1.15 }, { yPercent: 0, scale: 1, duration: 1, ease: EASE })
  gsap.to(out.firstElementChild, { yPercent: -10, duration: 1, ease: EASE, onComplete: done })
}

/** "01 / 04": the current number slides up out of its mask and the next rises in. */
function countTo(n: number) {
  if (!digit.value || reduced) { shown.value = n; return }
  gsap.killTweensOf(digit.value)
  gsap.to(digit.value, {
    yPercent: -100, duration: 0.3, ease: 'power2.in',
    onComplete: () => {
      shown.value = n
      gsap.fromTo(digit.value!, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: EASE })
    },
  })
}

function loop(delay: number) {
  timer?.kill()
  timer = gsap.delayedCall(delay, () => {
    if (!hovered) return
    go(index.value + 1)
    loop(1 + HOLD)
  })
}

function onEnter() {
  hovered = true
  host?.classList.add('is-hovered')
  if (!reduced) gsap.to(zoom.value!, { scale: 1.06, duration: 1.2, ease: EASE, overwrite: true })
  if (many.value) loop(FIRST)
}
function onLeave() {
  hovered = false
  host?.classList.remove('is-hovered')
  timer?.kill()
  if (!reduced) gsap.to(zoom.value!, { scale: 1, duration: 1, ease: EASE, overwrite: true })
}

/* touch: a sideways swipe changes image; the tap that follows a swipe must not open the project */
let start: [number, number] | null = null
let swiped = false
function onTouchStart(e: TouchEvent) {
  const t = e.touches[0]!
  start = [t.clientX, t.clientY]
  swiped = false
}
function onTouchEnd(e: TouchEvent) {
  if (!start) return
  const t = e.changedTouches[0]!
  const dx = t.clientX - start[0]
  const dy = t.clientY - start[1]
  start = null
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
    swiped = true
    go(index.value + (dx < 0 ? 1 : -1))
  }
}
function onClick(e: MouseEvent) {
  if (swiped) {
    e.preventDefault()
    e.stopPropagation()
    swiped = false
  }
}

onMounted(() => {
  reduced = prefersReducedMotion()
  host = root.value!.closest<HTMLElement>('[data-cover-host]') ?? root.value!
  if (isTouchDevice()) {
    if (!many.value) return
    host.addEventListener('touchstart', onTouchStart, { passive: true })
    host.addEventListener('touchend', onTouchEnd, { passive: true })
    host.addEventListener('click', onClick, true)
    return
  }
  host.addEventListener('pointerenter', onEnter)
  host.addEventListener('pointerleave', onLeave)
})
onBeforeUnmount(() => {
  timer?.kill()
  gsap.killTweensOf([zoom.value, digit.value, ...slides.value, ...slides.value.map(s => s.firstElementChild)])
  if (!host) return
  host.removeEventListener('pointerenter', onEnter)
  host.removeEventListener('pointerleave', onLeave)
  host.removeEventListener('touchstart', onTouchStart)
  host.removeEventListener('touchend', onTouchEnd)
  host.removeEventListener('click', onClick, true)
})
</script>

<template>
  <div ref="root" class="cover">
    <div v-parallax="{ y: travel, scale }" class="media" :style="{ aspectRatio: String(aspect), '--ph': media[images[0]!]?.color }">
      <div class="media-inner">
        <div ref="zoom" class="zoom">
          <div v-for="(id, i) in images" :key="id" ref="slides" class="slide" :class="{ 'is-first': i === 0 }">
            <div class="slide-img">
              <MediaImage :id="id" :alt="i === 0 ? alt : ''" :sizes="sizes" :position="i === 0 ? focus : undefined" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <p v-if="many" class="count caps" aria-hidden="true">
      <span class="count-mask"><span ref="digit" class="count-digit">{{ pad(shown) }}</span></span>
      <span class="count-sep">/</span>
      <span>{{ pad(images.length) }}</span>
    </p>
  </div>
</template>

<style scoped>
.cover { position: relative; }
.zoom { position: relative; width: 100%; height: 100%; will-change: transform; }
.slide { position: absolute; inset: 0; overflow: hidden; clip-path: inset(100% 0% 0% 0%); will-change: clip-path; }
.slide.is-first { clip-path: inset(0% 0% 0% 0%); z-index: 1; }
.slide-img { width: 100%; height: 100%; will-change: transform; }
.slide :deep(picture), .slide :deep(img) { display: block; width: 100%; height: 100%; object-fit: cover; }

.count {
  position: absolute; top: 100%; right: 0; margin-top: 1.4vw;
  display: flex; gap: 0.4em; align-items: baseline;
  font-size: var(--fs-sub); color: var(--fg-2); font-variant-numeric: tabular-nums;
  opacity: 0; transform: translateY(6px);
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
}
.count-mask { display: inline-block; overflow: hidden; vertical-align: bottom; line-height: 1.2; }
.count-digit { display: inline-block; color: var(--c-title); }
.is-hovered .count { opacity: 1; transform: none; }
@media (hover: none), (pointer: coarse) {
  .count { opacity: 1; transform: none; margin-top: 3.4vw; }
}
</style>
