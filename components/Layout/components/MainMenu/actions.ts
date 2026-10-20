import { ROUTES } from '@/common'
import { i18n } from '@/lib/i18n'

export const getActiveRouteLabel = (pathname: string) => {
  let activeLabel = ''

  switch (pathname) {
    case ROUTES.HOME:
      activeLabel = i18n.t('NAVIGATION.HOME')
      break
    case ROUTES.STATS:
      activeLabel = i18n.t('NAVIGATION.STATS')
      break
    case ROUTES.RULESETS:
      activeLabel = i18n.t('NAVIGATION.RULESETS')
      break
    case ROUTES.SETTINGS:
      activeLabel = i18n.t('NAVIGATION.SETTINGS')
      break
    case ROUTES.ABOUT:
      activeLabel = i18n.t('NAVIGATION.ABOUT')
      break
    default:
      console.warn(`Route label not defined! ${pathname}`)
  }

  return activeLabel
}
