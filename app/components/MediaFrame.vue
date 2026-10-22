<script setup lang="ts">
import { media } from '~/utils/site'

/**
 * Masked image frame with Exo Ape-style scroll motion: the picture drifts and settles
 * inside a fixed frame as the frame crosses the viewport.
 * `ratio` locks the frame's aspect (w/h); omit it to use the image's own proportions.
 */
const props = withDefaults(defineProps<{
  id: string
  alt: string
  ratio?: number
  sizes?: string
  eager?: boolean
  travel?: number
  scale?: [number, number]
}>(), { travel: 12, scale: () => [1.15, 1.15] as [number, number] })

const info = computed(() => media[props.id])
const aspect = computed(() => props.ratio ?? (info.value ? info.value.w / info.value.h : 4 / 5))
</script>

<template>
  <div
    v-parallax="{ y: travel, scale }"
    class="media"
    :style="{ aspectRatio: String(aspect), '--ph': info?.color }"
  >
    <div class="media-inner">
      <MediaImage :id="id" :alt="alt" :sizes="sizes" :eager="eager" />
    </div>
  </div>
</template>
