import type { Theme } from '@mui/material/styles'

import type { GradientColorsLightDark } from '@/types'
import { ColorMode } from '@/types-enums'

export const ui = (theme: Theme) => {
  return {
    // Like the bank chip of the file rows. Inline flex, so the strikethrough of excluded rows doesn't reach it.
    // Uncategorised ones are dashed, so they're changed first.
    chip: (isUncategorised: boolean) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      maxWidth: '100%',
      px: 0.75,
      border: 1,
      borderStyle: isUncategorised ? 'dashed' : 'solid',
      borderColor: 'divider',
      borderRadius: '10px',
      fontFamily: 'inherit',
      fontSize: 11,
      lineHeight: '18px',
      verticalAlign: 'middle',
      color: isUncategorised ? 'text.secondary' : 'text.primary',
    }),
    // The category the rule being created would give it, like the matched rows
    preview: {
      borderStyle: 'dashed',
      borderColor: theme.vars.palette.info.main,
      color: 'text.primary',
    },
    button: {
      '&:hover, &.Mui-focusVisible': {
        borderStyle: 'solid',
        backgroundColor: theme.vars.palette.action.hover,
      },
    },
    label: {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    dot: (color?: GradientColorsLightDark) => ({
      flexShrink: 0,
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: color ? color.light.start : theme.vars.palette.grey[400],
      [theme.getColorSchemeSelector(ColorMode.DARK)]: {
        backgroundColor: color ? color.dark.end : theme.vars.palette.grey[600],
      },
    }),
  }
}
