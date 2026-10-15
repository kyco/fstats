'use client'

import { RadioButtonChecked, RadioButtonUnchecked } from '@mui/icons-material'
import type { LinkProps } from '@mui/material'
import { Box, Link } from '@mui/material'
import type { ElementType } from 'react'

import { ui } from './styled'

type RadioItemProps<C extends ElementType> = Omit<LinkProps<C, { component?: C }>, 'children'> & {
  label: string
  isActive: boolean
}

/**
 * Radio-style option of a toolbar, e.g. the views: a link (`component={NextLink}`) or a button (`component="button"`).
 */
const Component = <C extends ElementType = 'a'>({ label, isActive, sx: itemSx, ...props }: RadioItemProps<C>) => {
  const sx = ui()

  return (
    <Link underline="none" {...props} sx={{ ...sx.item(isActive), ...itemSx }}>
      {isActive ? <RadioButtonChecked sx={sx.radio} /> : <RadioButtonUnchecked sx={sx.radio} />}
      <Box component="span" data-label={label} sx={sx.label}>
        <span>{label}</span>
      </Box>
    </Link>
  )
}

export default Component
