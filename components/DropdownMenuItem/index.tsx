'use client'

import type { MenuItemProps } from '@mui/material'
import { Box, MenuItem } from '@mui/material'
import type { ReactNode } from 'react'

import { ui } from './styled'

type DropdownMenuItemProps = Omit<MenuItemProps, 'children'> & {
  /**
   * Before the label, e.g. a switch.
   */
  start?: ReactNode
  label: ReactNode
  /**
   * Shown on the right, e.g. the number of files.
   */
  count?: number
}

const Component = ({ start, label, count, sx: itemSx, ...props }: DropdownMenuItemProps) => {
  const sx = ui()

  return (
    <MenuItem {...props} sx={{ ...sx.item, ...itemSx }}>
      {start}
      <Box component="span" sx={sx.label}>
        {label}
      </Box>
      {count !== undefined ? (
        <Box component="span" sx={sx.count}>
          {count}
        </Box>
      ) : null}
    </MenuItem>
  )
}

export default Component
