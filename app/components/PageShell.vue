<script setup lang="ts">
import { scrollToElement, setScrollContent } from '~/utils/scroll'
import { appState } from '~/utils/state'

/**
 * Every route renders inside this shell. Structure matches what Exo Ape's page transition
 * animates: the root (`.page`), its first child (a darkening overlay) and its last child
 * (the scrolling content). Each child of <main> is a separately transformed scroll section.
 */
const content = ref<HTMLElement>()
const route = useRoute()

onMounted(() => {
  setScrollContent(content.value!)
  if (route.hash) {
    nextTick(() => scrollToElement(document.getElementById(route.hash.slice(1)), true))
  }
  if (!appState.firstLoad) {
    // route change: move focus to the new page for keyboard and screen-reader users
    nextTick(() => content.value?.querySelector<HTMLElement>('main')?.focus({ preventScroll: true }))
  }
})
</script>

<template>
  <div class="page">
    <div class="page-overlay" />
    <div ref="content" class="page-content">
      <main id="main" tabindex="-1">
        <slot />
      </main>
      <SiteFooter />
    </div>
  </div>
</template>
