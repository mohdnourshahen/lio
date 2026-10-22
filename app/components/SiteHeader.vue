<script setup lang="ts">
import { nav } from '~/utils/site'
import { appState } from '~/utils/state'

/**
 * Exo Ape chrome: logo top-left, inline nav top-right while at the top of the page,
 * swapped for a "Menu" button once the visitor scrolls. Colour follows the section underneath.
 */
const emit = defineEmits<{ toggle: [] }>()
const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>

<template>
  <header
    class="site-header"
    :class="[ { 'is-scrolled': appState.scrolled || !isHome, 'menu-open': appState.menuOpen }]"
  >
    <NuxtLink to="/" class="logo" aria-label="Lōn Visuals — home" data-cursor-none>
      <LonLogo aria-hidden="true" />
    </NuxtLink>

    <nav class="inline-nav" aria-label="Primary">
      <ul>
        <li v-for="item in nav" :key="item.to">
          <NuxtLink :to="item.to" class="u-link u-link--rev" :tabindex="appState.scrolled || !isHome ? -1 : 0">{{ item.label }}</NuxtLink>
        </li>
      </ul>
    </nav>

    <button
      class="menu-button"
      type="button"
      :aria-expanded="appState.menuOpen"
      aria-controls="site-menu"
      @click="emit('toggle')"
    >
      <span class="menu-label">{{ appState.menuOpen ? 'Close' : 'Menu' }}</span>
      <span class="menu-icon" aria-hidden="true"><i /><i /><i /></span>
    </button>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 40;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 3.4722vw; height: 10.4167vw;
  pointer-events: none;
  color: var(--c-paper);
  transition: color 0.5s var(--ease-in-out);
}
.site-header > * { pointer-events: auto; }
.logo { display: block; width: 13.5vw; color: var(--c-title); }
.logo :deep(svg) { width: 100%; height: auto; }

.inline-nav ul { display: flex; gap: 2.9167vw; }
.inline-nav { font-family: var(--f-title); text-transform: uppercase; letter-spacing: 0.09em; font-size: var(--fs-label); transition: opacity 0.6s var(--ease-in-out), transform 0.6s var(--ease-in-out); }
.menu-button {
  position: absolute; right: 3.4722vw;
  display: flex; align-items: center; gap: 0.8333vw;
  font-family: var(--f-title); text-transform: uppercase; letter-spacing: 0.09em; font-size: var(--fs-label); line-height: 1; padding: 1vw 0;
  opacity: 0; visibility: hidden; transform: translateY(-30%);
  transition: opacity 0.6s var(--ease-in-out), transform 0.6s var(--ease-in-out), visibility 0.6s;
}
.is-scrolled .inline-nav, .menu-open .inline-nav { opacity: 0; transform: translateY(-30%); pointer-events: none; }
.is-scrolled .menu-button, .menu-open .menu-button { opacity: 1; visibility: visible; transform: none; }

.menu-icon { position: relative; width: 1.25vw; height: 0.9vw; display: block; }
.menu-icon i { position: absolute; left: 0; right: 0; height: 1px; background: currentColor; transition: transform 0.6s var(--ease-in-out), opacity 0.4s; }
.menu-icon i:nth-child(1) { top: 0; }
.menu-icon i:nth-child(2) { top: 50%; }
.menu-icon i:nth-child(3) { top: 100%; }
.menu-open .menu-icon i:nth-child(1) { transform: translateY(0.45vw) rotate(45deg); }
.menu-open .menu-icon i:nth-child(2) { opacity: 0; }
.menu-open .menu-icon i:nth-child(3) { transform: translateY(-0.45vw) rotate(-45deg); }

@media (min-width: 601px) and (max-width: 1024px) {
  .menu-icon { width: 18px; height: 12px; }
  .menu-open .menu-icon i:nth-child(1) { transform: translateY(6px) rotate(45deg); }
  .menu-open .menu-icon i:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
  .menu-button { gap: 10px; }
}

@media (max-width: 600px) {
  .site-header { height: 21.3333vw; padding: 0 6.4vw; }
  .logo { width: 36vw; }
  .inline-nav { display: none; }
  .menu-button { right: 6.4vw; gap: 2.6667vw; opacity: 1; visibility: visible; transform: none; padding: 3vw 0; }
  .menu-icon { width: 5.3333vw; height: 3.4667vw; }
  .menu-open .menu-icon i:nth-child(1) { transform: translateY(1.7333vw) rotate(45deg); }
  .menu-open .menu-icon i:nth-child(3) { transform: translateY(-1.7333vw) rotate(-45deg); }
}
</style>
