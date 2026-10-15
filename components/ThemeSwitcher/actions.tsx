import { Brightness4Outlined, DarkModeOutlined, LightModeOutlined } from '@mui/icons-material'
import { useColorScheme } from '@mui/material/styles'

import { ColorMode } from '@/types-enums'
import { i18n } from '@/lib/i18n'

import { ui } from './styled'

export const MODES = [ColorMode.SYSTEM, ColorMode.LIGHT, ColorMode.DARK]

export const getActiveIcon = (mode: ReturnType<typeof useColorScheme>['mode'], color: 'primary' | 'secondary') => {
  const sx = ui()

  switch (mode) {
    case ColorMode.LIGHT:
      return <LightModeOutlined color={color} sx={sx.icon} />
    case ColorMode.DARK:
      return <DarkModeOutlined color={color} sx={sx.icon} />
    case ColorMode.SYSTEM:
    default:
      return <Brightness4Outlined color={color} sx={sx.icon} />
  }
}

export const getActiveLabel = (imode: ReturnType<typeof useColorScheme>['mode']) => {
  switch (imode) {
    case ColorMode.LIGHT:
      return i18n.t('COMPONENTS.THEME_SWITCHER.THEME_LIGHT')
    case ColorMode.DARK:
      return i18n.t('COMPONENTS.THEME_SWITCHER.THEME_DARK')
    case ColorMode.SYSTEM:
    default:
      return i18n.t('COMPONENTS.THEME_SWITCHER.THEME_SYSTEM')
  }
}
