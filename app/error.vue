<script setup lang="ts">
import type { NuxtError } from '#app'

/** Not-found / error page in the site's own voice, instead of the framework default. */
const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)
useHead({ title: notFound.value ? 'Page not found — Lōn Visuals' : 'Something went wrong — Lōn Visuals', meta: [{ name: 'robots', content: 'noindex' }] })
const home = () => clearError({ redirect: '/' })
</script>

<template>
  <main class="error theme-dark">
    <p class="caps kicker">{{ error.statusCode }}</p>
    <h1 class="t-h1 title">
      <template v-if="notFound">This page <em>isn’t here</em></template>
      <template v-else>Something <em>went wrong</em></template>
    </h1>
    <p class="t-p sub">{{ notFound ? 'The page you’re looking for has moved or never existed.' : 'Please try again in a moment.' }}</p>
    <button type="button" class="caps back u-link" @click="home">Back to Lōn Visuals</button>
  </main>
</template>

<style scoped>
.error { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 10vw 8vw; gap: 2.2vw; }
.kicker { color: var(--fg-2); }
.title { color: var(--c-title); }
.sub { color: var(--fg-2); max-width: 30em; }
.back { color: var(--c-title); margin-top: 1.6vw; }
@media (max-width: 600px) { .error { gap: 6vw; } }
</style>
