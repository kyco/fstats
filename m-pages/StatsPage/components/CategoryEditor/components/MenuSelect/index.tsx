'use client'

import { ArrowDropDown, Search } from '@mui/icons-material'
import { Box, Button, InputBase } from '@mui/material'
import type { KeyboardEvent } from 'react'
import { Fragment, useRef, useState } from 'react'

import type { MenuSelectOption } from '@/types'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSubheader } from '@/components'

import { highlightMatches } from '../../../VirtualTable/actions'
import { filterOptions } from './actions'
import { ui } from './styled'

type MenuSelectProps = {
  /**
   * Of the button, for screen readers.
   */
  title: string
  value: string
  /**
   * Shown without a value.
   */
  placeholder?: string
  options: MenuSelectOption[]
  onChange: (value: string) => void
  /**
   * Shows a search field above the options, filtering them by label and group.
   */
  search?: {
    placeholder: string
    noMatches: string
  }
}

/**
 * Compact full width select with the menu of the toolbar selects, e.g. the format selects of the parser setup.
 */
const Component = ({ title, value, placeholder, options, onChange, search }: MenuSelectProps) => {
  const sx = ui()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLUListElement>(null)
  const selected = options.find((option) => option.value === value)
  const shownOptions = search ? filterOptions(options, query) : options

  const close = () => {
    setAnchor(null)
    setQuery('')
  }

  const select = (option: string) => {
    onChange(option)
    close()
  }

  // Typing stays in the field (the menu would jump to items by their first letter), arrows move to the options
  const onSearchKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      listRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (shownOptions.length) {
        select(shownOptions[0].value)
      }
    } else if (event.key !== 'Escape' && event.key !== 'Tab') {
      event.stopPropagation()
    }
  }

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        endIcon={<ArrowDropDown />}
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-label={title}
        aria-haspopup="menu"
        aria-expanded={anchor ? true : undefined}
        sx={sx.button}
      >
        <Box component="span" sx={sx.buttonLabel}>
          {selected?.start}
          <Box component="span" sx={selected ? sx.text : sx.placeholder}>
            {selected?.label ?? placeholder}
          </Box>
          {selected?.description ? (
            <Box component="span" sx={sx.description}>
              {selected.description}
            </Box>
          ) : null}
        </Box>
      </Button>
      <DropdownMenu
        anchorEl={anchor}
        open={!!anchor}
        onClose={close}
        // The search field is focused instead
        autoFocus={!search}
        disableAutoFocus={!!search}
        slotProps={{ list: { ref: listRef } }}
        sx={sx.menu(anchor?.clientWidth)}
      >
        {search ? (
          <Box sx={sx.search}>
            <InputBase
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder={search.placeholder}
              inputProps={{ 'aria-label': search.placeholder }}
              startAdornment={<Search sx={sx.searchIcon} />}
              sx={sx.searchField}
            />
          </Box>
        ) : null}
        {search && !shownOptions.length ? <Box sx={sx.noMatches}>{search.noMatches}</Box> : null}
        {shownOptions.map((option, index) => (
          <Fragment key={option.value}>
            {option.group && option.group !== shownOptions[index - 1]?.group ? (
              <DropdownMenuSubheader>{option.group}</DropdownMenuSubheader>
            ) : null}
            <DropdownMenuItem
              selected={option.value === value}
              onClick={() => select(option.value)}
              start={option.start}
              label={
                <>
                  {highlightMatches(option.label, query)}
                  {option.description ? (
                    <Box component="span" sx={sx.description}>
                      {option.description}
                    </Box>
                  ) : null}
                </>
              }
            />
          </Fragment>
        ))}
      </DropdownMenu>
    </>
  )
}

export default Component
