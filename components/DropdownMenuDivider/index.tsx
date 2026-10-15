'use client'

import { Divider } from '@mui/material'

import { ui } from './styled'

const Component = () => {
  const sx = ui()
  return <Divider sx={sx.divider} />
}

export default Component
