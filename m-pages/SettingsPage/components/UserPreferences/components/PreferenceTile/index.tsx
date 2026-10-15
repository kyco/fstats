'use client'

import { ChevronRight } from '@mui/icons-material'
import { Box, ButtonBase, Typography } from '@mui/material'

import type { OptionSwitcherTriggerProps } from '@/components'

import { ui } from './styled'

type PreferenceTileProps = OptionSwitcherTriggerProps & {
  title: string
}

const Component = ({ title, icon, label, onOpen }: PreferenceTileProps) => {
  const sx = ui()

  return (
    <ButtonBase onClick={onOpen} sx={sx.tile}>
      <Box sx={sx.iconCircle}>{icon}</Box>
      <Box sx={sx.text}>
        <Typography variant="caption" component="p" sx={sx.tileTitle}>
          {title}
        </Typography>
        <Typography sx={sx.value}>{label}</Typography>
      </Box>
      <ChevronRight sx={sx.chevron} />
    </ButtonBase>
  )
}

export default Component
