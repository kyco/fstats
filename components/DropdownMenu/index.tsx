'use client'

import type { MenuProps } from '@mui/material'
import { Menu } from '@mui/material'

import { ui } from './styled'

/**
 * Compact menu of a toolbar button, the same for all menus of the app (form selects have their own).
 */
const Component = ({ sx: menuSx, ...props }: MenuProps) => {
  const sx = ui()
  return <Menu {...props} sx={{ ...sx.menu, ...menuSx }} />
}

export default Component
