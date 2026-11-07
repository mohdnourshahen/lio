import { appState } from '~/utils/state'

/**
 * Dark (the house edition) or light (the white edition). The choice lives on <html data-mode>,
 * set before first paint by the head script in nuxt.config.ts, and is remembered per visitor.
 * In light mode every dark section ground turns to paper (main.css); image heroes and
 * brand-coloured sections keep their own colour.
 */
const KEY = 'lon-mode'

export function readMode() {
  appState.mode = document.documentElement.dataset.mode === 'light' ? 'light' : 'dark'
}

export function setMode(mode: 'dark' | 'light') {
  appState.mode = mode
  if (mode === 'light') document.documentElement.dataset.mode = 'light'
  else delete document.documentElement.dataset.mode
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'light' ? '#f7f4ed' : '#12100a')
  try { localStorage.setItem(KEY, mode) } catch {}
}

export const toggleMode = () => setMode(appState.mode === 'light' ? 'dark' : 'light')

/** what the header sees under it: a section's own theme, read through the current edition */
export function groundOf(sec: HTMLElement): typeof appState.headerTheme {
  const t = sec.dataset.theme as typeof appState.headerTheme
  if (appState.mode === 'dark' || sec.classList.contains('keep-dark')) return t
  return t === 'dark' || t === 'light' || t === 'sand' ? 'paper' : t
}
