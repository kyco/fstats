'use client'

import { ListSubheader } from '@mui/material'
import type { ReactNode } from 'react'

import { ui } from './styled'

type DropdownMenuSubheaderProps = {
  children: ReactNode
}

const Component = ({ children }: DropdownMenuSubheaderProps) => {
  const sx = ui()
  return <ListSubheader sx={sx.subheader}>{children}</ListSubheader>
}

export default Component
