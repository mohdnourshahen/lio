/**
 * Google Analytics 4 in a single-page site. Page views between pages are already recorded by GA's
 * enhanced measurement (browser-history changes, with the new page's title), so they are not sent
 * here again — that would double-count. What GA does not see on its own is a click on the studio's
 * email address.
 *
 * - A contact button marked `data-cta` (e.g. "Discuss your hotel branding project") sends
 *   `contact_cta_click`, with where it sits (`cta_location`), its label and the page language.
 * - Any other email link sends `generate_lead`, as before.
 *
 * Both are clicks that open the visitor's mail app: neither proves an enquiry was sent. A completed
 * enquiry can only be counted where it lands (the inbox or a CRM), or through a form on the site.
 */
declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

export default defineNuxtPlugin(() => {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href^="mailto:"]')
    if (!a || !window.gtag) return
    const cta = a.getAttribute('data-cta')
    if (cta) {
      window.gtag('event', 'contact_cta_click', {
        cta_location: cta,
        cta_text: a.textContent?.trim(),
        page_path: location.pathname,
        page_language: document.documentElement.lang,
      })
      return
    }
    const where = a.closest('footer') ? 'footer' : a.closest('nav, [role="dialog"], .site-menu') ? 'menu' : 'page'
    window.gtag('event', 'generate_lead', { method: 'email', link_location: where, page_path: location.pathname })
  }, { capture: true })
})
