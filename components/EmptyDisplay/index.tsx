'use client'

import type { SvgIconComponent } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

import { ui } from './styled'

type EmptyDisplayProps = {
  icon: SvgIconComponent
  title: string
  subtitle: ReactNode
  caption?: string
  actions?: ReactNode
  onClick?: () => void
}

/**
 * Pictogram with a title, shown in place of the data.
 */
const Component = ({ icon: Icon, title, subtitle, caption, actions, onClick }: EmptyDisplayProps) => {
  const sx = ui()

  return (
    <Box sx={sx.wrapper}>
      <Box sx={sx.content(!!onClick)} onClick={onClick}>
        <Box className="empty-icon-circle" sx={sx.iconCircle}>
          <Icon className="empty-icon" sx={sx.icon} />
        </Box>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={sx.subtitle}>
          {subtitle}
        </Typography>
        {caption ? (
          <Typography variant="caption" color="text.secondary">
            {caption}
          </Typography>
        ) : null}
      </Box>
      {/* Outside the clickable content, so they don't trigger its click */}
      {actions ? <Box sx={sx.actions}>{actions}</Box> : null}
    </Box>
  )
}

export default Component
