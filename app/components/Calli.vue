<script setup lang="ts">
import display from '../../content/ar/display.json'

/**
 * A display title set with Thmanyah's calligraphic forms, where content/ar/display.json gives one:
 * a kashida (ـ) that draws a letter out, or a whole word in [[ ]] set with the font's wide finals (ss01).
 * The styled line is for the eye only (aria-hidden); readers, search engines and copy get the plain text.
 * Any title without an entry renders as it is.
 */
const props = defineProps<{ text?: string }>()
const styled = props.text ? (display as Record<string, string>)[props.text] : undefined
const parts = styled?.split(/(\[\[[^\]]+\]\])/).filter(Boolean).map(s => (s.startsWith('[[') ? { t: s.slice(2, -2), sw: true } : { t: s, sw: false }))
</script>

<template>
  <template v-if="parts"><span aria-hidden="true"><span v-for="(p, i) in parts" :key="i" :class="{ sw: p.sw }">{{ p.t }}</span></span><span class="sr-only">{{ text }}</span></template>
  <template v-else>{{ text }}</template>
</template>

<style scoped>
/* the font's wide final forms: the swept kaf, the long ta, the open noon */
.sw { font-feature-settings: 'ss01' 1; }
</style>
