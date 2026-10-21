import type { Theme } from '@mui/material/styles'

import type { GradientColorsLightDark } from '@/types'
import { sxCategoryGradient } from '@/styles/styled'

export const ui = (theme: Theme) => {
  return {
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2.5,
    },
    name: {
      mt: 1,
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 0.75,
    },
    label: {
      fontSize: 13,
      color: 'text.secondary',
    },
    dot: (color: GradientColorsLightDark) => ({
      flexShrink: 0,
      width: 10,
      height: 10,
      borderRadius: '50%',
      ...sxCategoryGradient(theme, color),
    }),
    hint: {
      fontSize: 13,
      color: 'text.secondary',
    },
    error: {
      fontSize: 12,
      color: 'error.main',
    },
  }
}
