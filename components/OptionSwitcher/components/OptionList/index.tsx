'use client'

import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'

import type { SwitcherOption } from '@/types'

import RadioButton from '../../../RadioButton'

type OptionListProps<T extends string> = {
  options: SwitcherOption<T>[]
  onSelect: (value: T) => void
  sx?: SxProps<Theme>
}

const Component = <T extends string>({ options, onSelect, sx }: OptionListProps<T>) => {
  return (
    <List sx={sx}>
      {options.map((option) => (
        <ListItem key={option.value} disablePadding>
          <ListItemButton onClick={() => onSelect(option.value)}>
            <ListItemIcon>
              <RadioButton checked={option.checked} />
            </ListItemIcon>
            <ListItemText
              primary={option.primary}
              secondary={option.secondary}
              slotProps={{ secondary: { variant: 'body1' } }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}

export default Component
