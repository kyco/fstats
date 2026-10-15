import { grey } from '@mui/material/colors'
import { styled } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

import { ColorMode } from '@/types-enums'
import { sxGlass } from '@/styles/styled'

const PULLER_OFFSET_TOP = 8
const PULLER_HEIGHT = 4
const PULLER_WIDTH = 30
const PULLER_WRAPPER_HEIGHT = PULLER_OFFSET_TOP + PULLER_HEIGHT

export const PullerWrapper = styled('div')({
  height: PULLER_WRAPPER_HEIGHT,
})

export const Puller = styled('div')(({ theme }) => ({
  width: PULLER_WIDTH,
  height: PULLER_HEIGHT,
  backgroundColor: grey[400],
  borderRadius: 2,
  position: 'relative',
  top: PULLER_OFFSET_TOP,
  left: `calc(50% - ${PULLER_WIDTH / 2}px)`,
  [theme.getColorSchemeSelector(ColorMode.DARK)]: {
    backgroundColor: theme.vars.palette.secondary.dark,
  },
}))

export const ui = (anchor: 'left' | 'bottom', theme: Theme, isMobile = false) => {
  const hideScrollbar = {
    overflow: 'auto',
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE 10+
    '&::-webkit-scrollbar': {
      display: 'none', // WebKit (Chrome, Safari, Edge)
    },
  } as const

  const isBottomDrawer = anchor === 'bottom'

  return {
    backdrop: {
      backgroundColor: 'hsl(0deg 0% 0% / 0.1) !important',
      [theme.getColorSchemeSelector(ColorMode.DARK)]: {
        backgroundColor: 'hsl(0deg 0% 0% / 0.6) !important',
      },
    },

    drawer: (mainMenu = false) => {
      const paddingX = isMobile ? theme.spacing(1.5) : theme.spacing(2)
      const paddingY = isMobile ? theme.spacing(1.5) : theme.spacing(2)
      const padding = `${paddingY} ${paddingX}`
      const maxHeight = isMobile ? '370px' : '60%'

      return {
        ...hideScrollbar,
        ...sxGlass(theme),
        m: padding,
        width: mainMenu ? 300 : `calc(100% - (2 * ${paddingX}))`,
        maxWidth: mainMenu ? '70%' : '100%',
        maxHeight: isBottomDrawer ? maxHeight : `calc(100% - (2 * ${paddingY}))`,
        borderRadius: theme.spacing(mainMenu ? 4 : 2),
        zIndex: theme.zIndex.drawer + 1,
      }
    },

    subheaderWrapper: (fixedHeader: boolean) => ({
      position: 'sticky',
      top: 0,
      zIndex: 1,
      ...(fixedHeader && {
        ...sxGlass(theme, 0.9),
        borderBottom: `1px solid ${theme.vars.palette.divider}`,
      }),
    }),
  }
}
