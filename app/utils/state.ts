import { reactive } from 'vue'

/** Small client-side app state shared by the chrome (header, menu, cursor) and pages. */
export const appState = reactive({
  /** True until the first page has finished its intro (Exo Ape's `$root.preloader`). */
  firstLoad: true,
  loading: true,
  menuOpen: false,
  menuAnimating: false,
  transitioning: false,
  /** Exo Ape's $root.transition: 'default' wipe, or 'loadProject' (next-project hand-off). */
  transition: 'default' as 'default' | 'loadProject',
  headerTheme: 'dark' as 'dark' | 'light' | 'sand' | 'paper' | 'black' | 'surface',
  scrolled: false,
})

/** Delay before a page's intro text plays: Exo Ape uses 2.5s after the preloader, 0.5s after a page transition. */
export function introDelay() {
  return appState.firstLoad ? 2.5 : 0.5
}
