import type { Theme } from '@mui/material/styles'

import type { GradientColorsLightDark } from '@/types'
import { sxCategoryGradient } from '@/styles/styled'

export const ui = (theme: Theme) => {
  return {
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    },
    name: {
      mt: 1,
    },
    label: {
      mb: 1,
      fontSize: 13,
      color: 'text.secondary',
    },
    colors: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 1,
    },
    // The selected one with a ring
    swatch: (color: GradientColorsLightDark, isSelected: boolean) => ({
      width: 28,
      height: 28,
      p: 0,
      border: 0,
      borderRadius: '50%',
      cursor: 'pointer',
      outline: isSelected ? 2 : 0,
      outlineColor: 'text.primary',
      outlineOffset: 2,
      ...sxCategoryGradient(theme, color),
    }),
    switch: {
      mx: 0,
      gap: 1,
      '& .MuiFormControlLabel-label': { fontSize: 14 },
    },
    hint: {
      mt: 0.5,
      fontSize: 12,
      lineHeight: 1.5,
      color: 'text.secondary',
    },
  }
}
