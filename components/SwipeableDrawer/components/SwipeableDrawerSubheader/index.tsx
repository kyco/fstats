import { Clear } from '@mui/icons-material'
import { Box, IconButton, ListSubheader } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'

import { ui } from './styled'

type SwipeableDrawerSubheaderProps = {
  title?: ReactNode
  onClose: VoidFunction
  sx?: SxProps<Theme>
}

const Component = ({ title, onClose, sx: subheaderSx = {} }: SwipeableDrawerSubheaderProps) => {
  const sx = ui()

  return (
    <ListSubheader sx={{ background: 'transparent', ...subheaderSx }}>
      <Box sx={sx.header}>
        <Box sx={{ flexGrow: 1, lineHeight: 1.5 }}>{title}</Box>
        <Box>
          <IconButton edge="end" color="primary" onClick={onClose} sx={{ color: 'inherit' }}>
            <Clear fontSize="medium" />
          </IconButton>
        </Box>
      </Box>
    </ListSubheader>
  )
}
export default Component
