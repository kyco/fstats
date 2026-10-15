'use client'

import { Box } from '@mui/material'
import type { ReactNode } from 'react'

import { useIsMobile } from '@/hooks'

import { ui } from './styled'

type PageWrapperProps = {
  children?: ReactNode
}

const Component = ({ children }: PageWrapperProps) => {
  const isMobile = useIsMobile()
  const sx = ui(isMobile)

  return <Box sx={sx.wrapper}>{children}</Box>
}

export default Component
