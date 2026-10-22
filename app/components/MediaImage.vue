<script setup lang="ts">
import { media } from '~/utils/site'

/** Responsive AVIF/WebP picture for an image extracted from the legacy pages. */
const props = withDefaults(defineProps<{
  id: string
  alt: string
  sizes?: string
  eager?: boolean
}>(), { sizes: '(max-width: 600px) 100vw, 70vw', eager: false })

const info = computed(() => media[props.id])
const srcset = (ext: string) => info.value?.widths.map(w => `/media/${props.id}-${w}.${ext} ${w}w`).join(', ')
const fallback = computed(() => `/media/${props.id}-${info.value?.widths[0]}.webp`)
</script>

<template>
  <picture v-if="info">
    <source type="image/avif" :srcset="srcset('avif')" :sizes="sizes">
    <source type="image/webp" :srcset="srcset('webp')" :sizes="sizes">
    <img
      :src="fallback"
      :alt="alt"
      :width="info.w"
      :height="info.h"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      decoding="async"
    >
  </picture>
</template>
