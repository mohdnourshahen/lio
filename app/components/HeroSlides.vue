<script setup lang="ts">
import { gsap, prefersReducedMotion } from '~/utils/motion'

/**
 * Homepage hero backdrop: a slow sequence of images. Each one crossfades in over the last
 * and drifts from a slight zoom back to rest while it holds, so the cover always feels alive
 * without pulling the eye from the title. Reduced motion: the first image, still.
 */
const props = withDefaults(defineProps<{ images: string[], hold?: number, fade?: number }>(), { hold: 6, fade: 1.8 })

const slides = ref<HTMLElement[]>([])
let index = 0
let timer: gsap.core.Tween | undefined

function show(i: number, first = false) {
  const el = slides.value[i]!
  const img = el.firstElementChild
  gsap.set(slides.value, { zIndex: 0 })
  gsap.set(el, { zIndex: 1 })
  gsap.fromTo(img, { scale: 1.08 }, { scale: 1, duration: props.hold + props.fade, ease: 'none', overwrite: true })
  if (first) gsap.set(el, { autoAlpha: 1 })
  else {
    const prev = slides.value[(i - 1 + slides.value.length) % slides.value.length]!
    gsap.fromTo(el, { autoAlpha: 0 }, {
      autoAlpha: 1, duration: props.fade, ease: 'sine.inOut',
      onComplete: () => { if (prev !== el) gsap.set(prev, { autoAlpha: 0 }) },
    })
  }
}

function next() {
  index = (index + 1) % props.images.length
  show(index)
  timer = gsap.delayedCall(props.hold, next)
}

/* a hidden tab should not race through the sequence on return */
function onVisibility() {
  if (document.hidden) timer?.pause()
  else timer?.resume()
}

onMounted(() => {
  gsap.set(slides.value, { autoAlpha: 0 })
  show(0, true)
  if (prefersReducedMotion() || props.images.length < 2) {
    gsap.killTweensOf(slides.value[0]!.firstElementChild)
    gsap.set(slides.value[0]!.firstElementChild, { scale: 1 })
    return
  }
  timer = gsap.delayedCall(props.hold, next)
  document.addEventListener('visibilitychange', onVisibility)
})
onBeforeUnmount(() => {
  timer?.kill()
  document.removeEventListener('visibilitychange', onVisibility)
  gsap.killTweensOf([...slides.value, ...slides.value.map(s => s.firstElementChild)])
})
</script>

<template>
  <div class="hero-slides" aria-hidden="true">
    <div v-for="(id, i) in images" :key="id" ref="slides" class="hero-slide" :class="{ 'is-first': i === 0 }">
      <div class="hero-slide-img">
        <MediaImage :id="id" alt="" sizes="100vw" :eager="i === 0" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-slides { position: absolute; inset: 0; }
.hero-slide { position: absolute; inset: 0; overflow: hidden; visibility: hidden; opacity: 0; }
.hero-slide.is-first { visibility: visible; opacity: 1; }
.hero-slide-img { width: 100%; height: 100%; will-change: transform; transform-origin: 50% 45%; }
</style>
