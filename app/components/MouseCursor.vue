<script setup lang="ts">
import { EASE, gsap, isTouchDevice, lerp, prefersReducedMotion } from '~/utils/motion'

/**
 * Exo Ape's cursor bubble: follows the pointer with a 0.1 lerp, and grows from scale 0.1
 * to 1 (0.4s, ease-in-out) with a label when hovering anything marked [data-cursor="Label"].
 * The native pointer stays visible; this is an affordance, not a replacement.
 */
const el = ref<HTMLElement>()
const inner = ref<HTMLElement>()
const label = ref('')
const enabled = ref(false)
let target = [0, 0]
let current = [0, 0]
let active: Element | null = null

let moved = false
let frame = 0
function onMove(e: PointerEvent) {
  target = [e.clientX, e.clientY]
  moved = true
  hitTest(e.target as Element | null)
}
/** Content scrolls under a still pointer, so re-check what's beneath it, not only on pointermove. */
function hitTest(under: Element | null) {
  const hit = under?.closest?.('[data-cursor]') ?? null
  if (hit !== active) {
    active = hit
    if (hit) enter(hit.getAttribute('data-cursor') || '')
    else leave()
  }
}
function enter(text: string) {
  label.value = text
  gsap.to(inner.value!, { autoAlpha: 1, scale: 1, duration: 0.4, ease: EASE.inOut })
}
function leave() {
  gsap.to(inner.value!, { autoAlpha: 0, scale: 0.1, duration: 0.4, ease: EASE.inOut, onComplete: () => { if (!active) label.value = '' } })
}
function tick() {
  if (moved && ++frame % 6 === 0) hitTest(document.elementFromPoint(target[0]!, target[1]!))
  current = [lerp(current[0]!, target[0]!, 0.1), lerp(current[1]!, target[1]!, 0.1)]
  el.value!.style.transform = `translate3d(${current[0]}px, ${current[1]}px, 0)`
}
/** Elements can vanish under a still pointer (page transitions); drop the bubble then. */
function reset() { active = null; leave() }

onMounted(() => {
  enabled.value = !isTouchDevice() && !prefersReducedMotion()
  if (!enabled.value) return
  nextTick(() => {
    gsap.set(inner.value!, { autoAlpha: 0, scale: 0.1 })
    window.addEventListener('pointermove', onMove, { passive: true })
    gsap.ticker.add(tick)
  })
})
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMove)
  gsap.ticker.remove(tick)
})
defineExpose({ reset })
</script>

<template>
  <div v-if="enabled" ref="el" class="cursor" aria-hidden="true">
    <div ref="inner" class="inner">
      <span class="text">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.cursor { position: fixed; top: 0; left: 0; z-index: 50; pointer-events: none; width: 0; height: 0; }
.inner {
  position: absolute; left: -2.986vw; top: -2.986vw;
  width: 5.9722vw; height: 5.9722vw; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(230, 223, 143, 0.9);
  color: var(--c-ink);
  font-family: var(--f-title); text-transform: uppercase; letter-spacing: 0.09em; font-size: var(--fs-sub);
}
</style>
