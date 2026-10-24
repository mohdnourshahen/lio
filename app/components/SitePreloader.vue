<script setup lang="ts">
import { EASE, gsap, prefersReducedMotion } from '~/utils/motion'

/**
 * First-load curtain. Times out at ~2s so the page's intro lines land on Exo Ape's
 * 2.5s post-preloader cue. The panel exits with the same skewed clip-path wipe the
 * menu and page transitions use.
 */
const root = ref<HTMLElement>()
const done = ref(false)
const emit = defineEmits<{ finished: [] }>()

onMounted(() => {
  const el = root.value!
  if (prefersReducedMotion()) {
    gsap.to(el, { autoAlpha: 0, duration: 0.3, delay: 0.2, onComplete: finish })
    return
  }
  const vh = window.innerHeight
  gsap.timeline({ onComplete: finish })
    .fromTo(el.querySelector('.mark'), { yPercent: 100, rotate: 7, autoAlpha: 0 }, { yPercent: 0, rotate: 0, autoAlpha: 1, duration: 1, ease: EASE.out }, 0.15)
    .fromTo(el.querySelector('.sub'), { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1, ease: EASE.out }, 0.35)
    .fromTo(el.querySelector('.bar i'), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: EASE.inOut }, 0.2)
    .to(el.querySelector('.inner'), { yPercent: -40, autoAlpha: 0, duration: 0.8, ease: EASE.in }, 1.2)
    .fromTo(el, { clipPath: `polygon(0 0, 100% 0, 100% ${vh * 1.1}px, 0 ${vh}px)` }, {
      clipPath: 'polygon(0 0, 100% 0, 100% 0px, 0 0px)', duration: 1, ease: EASE.inOut,
    }, 1.35)
})

function finish() {
  done.value = true
  emit('finished')
}
</script>

<template>
  <div v-if="!done" ref="root" class="preloader" aria-hidden="true">
    <div class="inner">
      <div class="mask"><LonLogo class="mark" /></div>
      <p class="mask caps-line"><span class="caps sub">Strategic brand &amp; visual communication studio</span></p>
      <div class="bar"><i /></div>
    </div>
  </div>
</template>

<style scoped>
.preloader {
  position: fixed; inset: 0; z-index: 60;
  background: var(--c-ink); color: var(--c-title);
  display: flex; align-items: center; justify-content: center;
}
.inner { display: flex; flex-direction: column; align-items: center; gap: 2.2vw; }
.mask { overflow: hidden; padding: 0.4vw 0; }
.mark { width: 22vw; height: auto; }
.sub { display: block; }
.caps-line { text-align: center; }
.bar { width: 22vw; height: 1px; background: rgba(230, 223, 143, 0.15); }
.bar i { display: block; height: 100%; background: var(--c-title); transform-origin: left; transform: scaleX(0); }
@media (max-width: 600px) {
  .mark, .bar { width: 62vw; }
  .sub { font-size: 2.6vw; }
  .inner { gap: 6vw; }
}
html:not(.js) .preloader { display: none; }
</style>
