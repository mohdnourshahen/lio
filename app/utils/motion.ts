import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { SplitText } from 'gsap/SplitText'

let registered = false

/**
 * Exo Ape's three eases, recovered verbatim from its bundle (`$root.easeIn/Out/InOut`),
 * plus the page-transition duration it uses ($root.transitionDuration = 1.05).
 */
export const EASE = {
  in: 'lon.in',
  out: 'lon.out',
  inOut: 'lon.inOut',
}
export const TRANSITION_DURATION = 1.05

export function setupGsap() {
  if (registered || typeof window === 'undefined') return gsap
  gsap.registerPlugin(CustomEase, SplitText)
  CustomEase.create(EASE.in, 'M0,0 C0.198,0 1,0.1 1,1')
  CustomEase.create(EASE.out, 'M0,0 C0,0.202 0.204,1 1,1')
  CustomEase.create(EASE.inOut, 'M0,0 C0.496,0.004 0,1 1,1')
  registered = true
  return gsap
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isTouchDevice() {
  return typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches
}

export function isMobileWidth() {
  return typeof window !== 'undefined' && window.innerWidth <= 600
}

export { gsap, SplitText }
