import { linearProgressClasses } from '@mui/material/LinearProgress'
import type { Theme } from '@mui/material/styles'

import type { BreakdownCellsSize } from '@/types'
import { GradientColorsLightDark } from '@/types'
import { ColorMode } from '@/types-enums'

const SIZES = {
  md: { fontSize: 13, barHeight: 6 },
  sm: { fontSize: 12, barHeight: 4 },
} as const

export const ui = (theme: Theme, size: BreakdownCellsSize) => {
  const { fontSize, barHeight } = SIZES[size]
  const isSmall = size === 'sm'

  return {
    container: isSmall ? { mt: 0.5 } : {},

    label: isSmall ? { ml: 2 } : {},

    text: (disabled: boolean) => ({
      mb: 0,
      fontSize,
      opacity: disabled ? 1 : 0.5,
    }),

    progress: (disabled: boolean, color: GradientColorsLightDark) => ({
      opacity: disabled ? 1 : 0.3,
      height: barHeight,
      borderRadius: 100,
      [`&.${linearProgressClasses.colorPrimary}`]: {
        background: theme.vars.palette.grey[200],
        [theme.getColorSchemeSelector(ColorMode.DARK)]: {
          background: theme.vars.palette.background.default,
        },
      },
      [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 100,
        background: `linear-gradient(90deg, ${color.light.start} 0%, ${color.light.end} 100%)`,
        [theme.getColorSchemeSelector(ColorMode.DARK)]: {
          background: `linear-gradient(90deg, ${color.dark.start} 0%, ${color.dark.end} 100%)`,
        },
      },
    }),
  }
}
