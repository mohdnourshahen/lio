import type { RouterConfig } from '@nuxt/schema'

// Scroll position is owned by utils/scroll.ts and the page transition, not the router.
export default {
  scrollBehavior: () => false,
} satisfies RouterConfig
