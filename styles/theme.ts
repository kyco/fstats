'use client'

import type { Theme } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'

import { Color } from '@/styles/colors'

import { roboto } from './fonts'

const defaultTheme = {
  typography: {
    fontFamily: roboto.style.fontFamily,
    fontWeight: 400,
    fontSize: 15,
    h1: {
      fontSize: 46,
      fontWeight: 'bold',
      lineHeight: '1.4',
    },
    h2: {
      fontSize: 38,
      fontWeight: 'bold',
      lineHeight: '1.4',
    },
    h3: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: '1.3',
    },
    h4: {
      fontSize: 28,
      fontWeight: 'bold',
      lineHeight: '1.3',
    },
    h5: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: '1.3',
    },
    h6: {
      fontSize: 20,
      fontWeight: 'bold',
      lineHeight: '1.3',
    },
    body1: {
      fontSize: 16,
      lineHeight: 1.625,
    },
    body2: {
      fontSize: 16,
      lineHeight: 1.625,
      marginBottom: 16,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 'normal',
        } as const,
      },
    },

    MuiTypography: {
      defaultProps: {
        variantMapping: {
          body1: 'span',
          body2: 'p',
        },
      },
    },

    MuiInputBase: {
      styleOverrides: {
        root: {
          height: 48,
        },
      },
    },

    // Small labels are placed for 40px high inputs, centred in the 48px ones until they move up
    MuiInputLabel: {
      styleOverrides: {
        sizeSmall: {
          '&:not(.MuiInputLabel-shrink)': {
            transform: 'translate(14px, 13px) scale(1)',
          },
        },
      },
    },

    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) =>
          theme.unstable_sx({
            p: 3,
            border: `1px solid ${theme.vars.palette.divider}`,
            borderRadius: 2,
          }),
      },
    },

    // Half as strong as the MUI default (0.11 light, 0.13 dark)
    MuiSkeleton: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          backgroundColor: `rgba(${theme.vars.palette.text.primaryChannel} / 0.055)`,
          ...theme.applyStyles('dark', {
            backgroundColor: `rgba(${theme.vars.palette.text.primaryChannel} / 0.065)`,
          }),
        }),
      },
    },
  },
}

export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  ...defaultTheme,
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: Color.kycoGrey,
        },
        secondary: {
          main: Color.cyanDark,
        },
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: Color.cyan,
        },
        secondary: {
          main: Color.cyanLight,
        },
        text: {
          primary: Color.cyanUltraLight,
        },
        background: {
          default: Color.kycoGrey,
          paper: Color.kycoGreyDark,
        },
      },
    },
  },
})
