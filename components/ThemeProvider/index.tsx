'use client'

import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'

import { MISC } from '@/common'
import { theme } from '@/styles/theme'

import { InnerWrapper } from './components'

type ThemeProviderProps = {
  children: ReactNode
}

const Component = ({ children }: ThemeProviderProps) => {
  return (
    <ThemeProvider theme={theme} defaultMode={MISC.DEFAULT_COLOR_MODE} modeStorageKey={MISC.LS_MUI_COLOR_MODE_KEY}>
      <CssBaseline />
      <InnerWrapper>{children}</InnerWrapper>
    </ThemeProvider>
  )
}

export default Component
