/**
 * Google Analytics 4 in a single-page site. Page views between pages are already recorded by GA's
 * enhanced measurement (browser-history changes, with the new page's title), so they are not sent
 * here again — that would double-count. What GA does not see on its own is a click on the studio's
 * email address: that is sent as `generate_lead`, GA's recommended event for an enquiry, which can be
 * marked as a key event in GA → Admin → Events.
 */
declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

export default defineNuxtPlugin(() => {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href^="mailto:"]')
    if (!a || !window.gtag) return
    const where = a.closest('footer') ? 'footer' : a.closest('nav, [role="dialog"], .site-menu') ? 'menu' : 'page'
    window.gtag('event', 'generate_lead', { method: 'email', link_location: where, page_path: location.pathname })
  }, { capture: true })
})
