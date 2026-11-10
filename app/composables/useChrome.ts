import { chrome, langOf } from '~/utils/i18n'

/** the interface words (chrome) in the current page's language */
export const useChrome = () => {
  const route = useRoute()
  return chrome[langOf(route.path)]
}
