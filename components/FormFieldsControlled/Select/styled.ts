import type { Theme } from '@mui/material/styles'

import { sxMenuPaper } from '@/styles/styled'

export const ui = (theme: Theme, isMobile: boolean) => {
  return {
    menuPaper: {
      ...sxMenuPaper(theme, isMobile),
      maxWidth: 350, // Setting maxwidth to 0 here will force it to never expand past the selectbox width
    },

    value: (hasClear: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      pr: 0.25,
      mr: hasClear ? 2.5 : 0,
    }),

    valueLabel: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    error: {
      mx: 1,
      pt: 0.75,
      fontSize: 12,
    },
  } as const
}
