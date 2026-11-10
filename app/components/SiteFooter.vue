<script setup lang="ts">
import { site, whatsapp } from '~/utils/site'
import { chrome, langOf, switchPath } from '~/utils/i18n'
import { toggleMode } from '~/utils/mode'
import { appState } from '~/utils/state'

/** Contact + footer — Exo Ape's closing "Our Story" block, carrying Lōn's contact section. */
const year = 2026
const route = useRoute()
const c = computed(() => chrome[langOf(route.path)])
</script>

<template>
  <footer id="contact" class="site-footer theme-dark" data-theme="dark">
    <div class="container">
      <p v-reveal class="caps kicker">{{ c.footer.kicker }}</p>
      <h2 v-reveal class="title t-h1">
        <span class="line-mask"><span data-line><Calli :text="c.footer.title[0]" /></span></span>
        <span class="line-mask"><span data-line><em><Calli :text="c.footer.title[1]" /></em></span></span>
      </h2>
      <p v-reveal class="sub t-h4">{{ c.footer.sub }}</p>
      <a :href="`mailto:${site.email}`" class="email u-link" data-cursor="Write">{{ site.email }}</a>
      <a :href="whatsapp(c.whatsappHello)" target="_blank" rel="noopener" class="wa" data-cta="footer" data-cursor="Chat">
        <WaIcon /><span>{{ c.whatsapp }}</span><span class="wa-num" dir="ltr">{{ site.phoneDisplay }}</span>
      </a>

      <div class="rule" />

      <address class="col col-1">
        <p class="t-small dim">{{ c.footer.studio }}</p>
        <p class="t-small">{{ langOf(route.path) === 'ar' ? 'لُون' : site.name }}</p>
        <p class="t-small">{{ langOf(route.path) === 'ar' ? 'استوديو الاستراتيجية البصرية' : site.tagline }}</p>
        <p class="t-small">{{ c.footer.place }}</p>
        <a class="t-small u-link u-link--rev" :href="`mailto:${site.email}`">{{ site.email }}</a>
        <a class="t-small u-link u-link--rev" :href="whatsapp(c.whatsappHello)" target="_blank" rel="noopener">{{ c.whatsapp }} <span dir="ltr">{{ site.phoneDisplay }}</span></a>
      </address>
      <nav class="col col-2" aria-label="Footer">
        <p class="t-small dim">{{ c.footer.navigate }}</p>
        <ul>
          <li v-for="n in c.nav" :key="n.to"><NuxtLink :to="n.to" class="t-small u-link u-link--rev">{{ n.label }}</NuxtLink></li>
          <li><NuxtLink :to="switchPath(route.path)" :lang="c.switchLang" class="t-small u-link u-link--rev">{{ c.switchLabel }}</NuxtLink></li>
          <li><button type="button" class="t-small u-link u-link--rev" :aria-label="appState.mode === 'light' ? c.toDarkLabel : c.toLightLabel" @click="toggleMode">{{ appState.mode === 'light' ? c.toDark : c.toLight }}</button></li>
        </ul>
      </nav>
      <div class="col col-3">
        <p class="t-small dim">{{ c.follow }}</p>
        <ul>
          <li v-for="s in site.socials" :key="s.name"><a :href="s.href" target="_blank" rel="noopener" class="t-small u-link u-link--rev">{{ s.name }}</a></li>
        </ul>
      </div>
      <p class="copy t-small dim">© {{ year }} {{ c.footer.rights }}</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer { padding: 16vw 0 4.5vw; min-height: calc(var(--vh) * 100); display: flex; flex-direction: column; justify-content: flex-end; }
.kicker { grid-column: 1 / -1; justify-self: center; color: var(--fg-2); }
.title { grid-column: 1 / -1; margin-top: 2.6vw; color: var(--c-title); display: flex; flex-direction: column; align-items: center; text-align: center; }
.title em { color: var(--c-title); }
.sub { grid-column: 4 / 10; margin-top: 2.8vw; color: var(--fg-2); text-align: center; }
.email { grid-column: 1 / -1; justify-self: center; margin-top: 4vw; font-family: var(--f-title); font-size: 2.6vw; line-height: 1.3; color: var(--c-paper); }
.wa {
  grid-column: 1 / -1; justify-self: center; margin-top: 1.8vw; display: inline-flex; align-items: center; gap: 0.7em;
  padding: 0.85em 1.5em; border: 1px solid color-mix(in srgb, var(--c-title) 45%, transparent); border-radius: 99px;
  font-family: var(--f-title); text-transform: uppercase; letter-spacing: 0.12em; font-size: var(--fs-label); color: var(--c-title);
  transition: background 0.6s var(--ease-out), color 0.6s var(--ease-out);
}
.wa-num { letter-spacing: 0.06em; color: var(--c-paper); }
@media (hover: hover) {
  .wa:hover, .wa:hover .wa-num { background: var(--c-title); color: var(--c-ink); }
}
.rule { grid-column: 2 / 12; height: 1px; background: var(--rule); margin: 6vw 0 2.8vw; }
.col { grid-column: span 2; font-style: normal; display: flex; flex-direction: column; gap: 0.35vw; }
.col-1 { grid-column: 2 / 5; }
.col-2 { grid-column: 5 / 7; }
.col-3 { grid-column: 7 / 9; }
.col ul { display: flex; flex-direction: column; gap: 0.35vw; }
.col a { align-self: flex-start; }
.dim { color: var(--c-title); opacity: 0.8; margin-bottom: 0.6vw; font-family: var(--f-title); text-transform: uppercase; letter-spacing: 0.09em; font-size: var(--fs-sub); }
.copy { grid-column: 9 / 12; align-self: end; justify-self: end; margin: 0; }

@media (min-width: 601px) and (max-width: 1024px) {
  .sub { grid-column: 2 / 12; }
  .email { font-size: 3.4vw; }
  .col-1 { grid-column: 2 / 6; }
  .col-2 { grid-column: 6 / 9; }
  .col-3 { grid-column: 9 / 12; }
  .copy { grid-column: 2 / 12; justify-self: start; margin-top: 5vw; }
}

@media (max-width: 600px) {
  .site-footer { padding: 32vw 0 10vw; }
  .kicker, .title, .sub, .email, .rule { grid-column: 1 / -1; }
  .title { font-size: 12vw; }
  .title { margin-top: 5vw; }
  .sub { margin-top: 6vw; }
  .email { margin-top: 8vw; font-size: 6.2vw; line-height: 1.2; }
  .wa { margin-top: 5vw; }
  .rule { margin: 14vw 0 8vw; }
  .col-1 { grid-column: 1 / -1; margin-bottom: 8vw; }
  .col-2 { grid-column: 1 / 6; }
  .col-3 { grid-column: 6 / 11; }
  .col, .col ul { gap: 1.6vw; }
  .dim { margin-bottom: 2vw; }
  .copy { grid-column: 1 / -1; justify-self: start; margin-top: 12vw; }
}
</style>
