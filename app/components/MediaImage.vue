<script setup lang="ts">
import { media } from '~/utils/site'

/** Responsive AVIF/WebP picture for an image extracted from the legacy pages. */
const props = withDefaults(defineProps<{
  id: string
  alt: string
  sizes?: string
  eager?: boolean
  /** object-position, e.g. '62% 50%' — keeps the mark in frame when the frame crops */
  position?: string
  /** a different image for phones (art direction), e.g. a portrait crop for a landscape hero */
  mobileId?: string
}>(), { sizes: '(max-width: 600px) 100vw, 70vw', eager: false })

const info = computed(() => media[props.id])
const srcsetOf = (id: string, ext: string) => media[id]?.widths.map(w => `/media/${id}-${w}.${ext} ${w}w`).join(', ')
const srcset = (ext: string) => srcsetOf(props.id, ext)
const fallback = computed(() => `/media/${props.id}-${info.value?.widths[0]}.webp`)
</script>

<template>
  <picture v-if="info">
    <template v-if="mobileId && media[mobileId]">
      <source media="(max-width: 600px)" type="image/avif" :srcset="srcsetOf(mobileId, 'avif')" sizes="100vw">
      <source media="(max-width: 600px)" type="image/webp" :srcset="srcsetOf(mobileId, 'webp')" sizes="100vw">
    </template>
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
      :style="position ? { objectPosition: position } : undefined"
    >
  </picture>
</template>
