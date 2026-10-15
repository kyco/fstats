'use client'

import { IconButton, Tooltip } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { useState } from 'react'

import type { SwitcherOption } from '@/types'
import { useIsMobile } from '@/hooks'

import SwipeableDrawer from '../SwipeableDrawer'
import { OptionList } from './components'

export type OptionSwitcherTriggerProps = {
  icon: ReactNode
  label: ReactNode
  onOpen: () => void
}

type OptionSwitcherProps<T extends string> = {
  title: string
  icon: ReactNode
  label: ReactNode
  fixedHeader?: boolean
  listSx?: SxProps<Theme>
  /**
   * Replaces the default button that opens the options.
   */
  renderTrigger?: (props: OptionSwitcherTriggerProps) => ReactNode
  options: SwitcherOption<T>[]
  onSelect: (value: T) => void
}

const Component = <T extends string>({
  title,
  icon,
  label,
  fixedHeader = false,
  listSx,
  renderTrigger,
  options,
  onSelect,
}: OptionSwitcherProps<T>) => {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  const onOpen = () => {
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
  }

  const onOptionSelected = (value: T) => {
    onSelect(value)
    onClose()
  }

  return (
    <>
      {renderTrigger ? (
        renderTrigger({ icon, label, onOpen })
      ) : (
        <Tooltip title={title}>
          <IconButton size={isMobile ? 'large' : 'medium'} color="secondary" onClick={onOpen}>
            {icon}
          </IconButton>
        </Tooltip>
      )}

      <SwipeableDrawer
        title={title}
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={onOpen}
        fixedHeader={fixedHeader}
      >
        <OptionList options={options} onSelect={onOptionSelected} sx={listSx} />
      </SwipeableDrawer>
    </>
  )
}

export default Component
