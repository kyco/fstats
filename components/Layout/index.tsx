'use client'

import { Box, Container } from '@mui/material'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

import { LAYOUT, MISC } from '@/common'
import { useIsMobile } from '@/hooks'
import { useTranslation } from '@/lib/i18n'

import SwipeableDrawer from '../SwipeableDrawer'
import { FULL_WIDTH_ROUTES } from './actions'
import { MainMenu, MenuDrawer, Sidebar } from './components'
import { ui } from './styled'

type LayoutProps = {
  children: ReactNode
}

const Component = ({ children }: LayoutProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const isFullWidth = FULL_WIDTH_ROUTES.includes(pathname)
  const [expanded, setExpanded] = useLocalStorage(MISC.LS_SIDEBAR_EXPANDED_KEY, false, { initializeWithValue: false })

  const onOpen = () => {
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
  }

  if (!isMobile) {
    return (
      <>
        <Sidebar expanded={expanded} onToggle={() => setExpanded(!expanded)} />

        <Box sx={sx.content(expanded)}>
          <Container maxWidth={isFullWidth ? false : LAYOUT.CONTAINER_MAX_WIDTH} disableGutters={isFullWidth}>
            {children}
          </Container>
        </Box>
      </>
    )
  }

  return (
    <>
      <MainMenu onMenuClick={() => setOpen(!open)} />

      <Container maxWidth={isFullWidth ? false : LAYOUT.CONTAINER_MAX_WIDTH} disableGutters={isFullWidth}>
        {children}
      </Container>

      <SwipeableDrawer
        title={t('NAVIGATION.MENU')}
        anchor="left"
        open={open}
        onClose={onClose}
        onOpen={onOpen}
        mainMenu
        headerSx={sx.drawerHeader}
      >
        <MenuDrawer onClose={onClose} />
      </SwipeableDrawer>
    </>
  )
}

export default Component
