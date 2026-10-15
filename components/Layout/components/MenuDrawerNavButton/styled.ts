import type { Theme } from '@mui/material/styles'

export const ui = (theme: Theme, isActive: boolean) => {
  return {
    button: {
      mx: 1.5,
      mb: 0.5,
      px: 0.5,
      py: 1.75,
      borderRadius: 3.5,
      backgroundColor: isActive ? theme.vars.palette.action.hover : 'transparent',
    },

    text: {
      pl: 2,
    },

    primary: {
      fontSize: 18,
      fontWeight: isActive ? 'bold' : 'normal',
    },
  }
}
