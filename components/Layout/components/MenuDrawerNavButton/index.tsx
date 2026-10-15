'use client'

import { ListItem, ListItemButton, ListItemText } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { ui } from './styled'

type MenuDrawerNavButtonProps = {
  route: string
  onClose: VoidFunction
  children: ReactNode
  isActive?: boolean
  isExternal?: boolean
}

const Component = ({ route, onClose, children, isActive = false, isExternal = false }: MenuDrawerNavButtonProps) => {
  const theme = useTheme()
  const sx = ui(theme, isActive)
  const linkProps = isExternal
    ? { component: 'a', href: route, target: '_blank', rel: 'noopener noreferrer' }
    : { component: Link, href: route }

  return (
    <ListItem disablePadding>
      <ListItemButton {...linkProps} onClick={onClose} sx={sx.button}>
        <ListItemText primary={children} sx={sx.text} slotProps={{ primary: { sx: sx.primary } }} />
      </ListItemButton>
    </ListItem>
  )
}

export default Component
