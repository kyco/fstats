'use client'

import { Add, ArrowDropDown, Search } from '@mui/icons-material'
import { Box, Button, InputBase } from '@mui/material'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { Fragment, useRef, useState } from 'react'

import type { MenuSelectOption } from '@/types'
import { highlightMatches } from '@/utils/Search'

import DropdownMenu from '../DropdownMenu'
import DropdownMenuItem from '../DropdownMenuItem'
import DropdownMenuSubheader from '../DropdownMenuSubheader'
import { filterOptions, getNewOptionName } from './actions'
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
  /**
   * With a search: offers to create an option named like the query when none has that name (like creating a branch
   * on GitHub), e.g. "Create category “Coffee”".
   */
  create?: {
    getLabel: (name: string) => string
    onCreate: (name: string) => void
  }
  /**
   * Opens the menu from another button, e.g. "Add from library", instead of the select.
   */
  renderButton?: (props: { onClick: (event: MouseEvent<HTMLElement>) => void; isOpen: boolean }) => ReactNode
  /**
   * Of the menu, as wide as the select by default.
   */
  menuWidth?: number
  /**
   * Opens the menu at this element without a button, e.g. from an item of another menu. `onClose` then closes it.
   */
  anchorEl?: HTMLElement | null
  onClose?: () => void
}

/**
 * Compact full width select with the menu of the toolbar selects, e.g. the format selects of the parser setup.
 */
const Component = ({
  title,
  value,
  placeholder,
  options,
  onChange,
  search,
  create,
  renderButton,
  menuWidth,
  anchorEl,
  onClose,
}: MenuSelectProps) => {
  const sx = ui()
  const [ownAnchor, setAnchor] = useState<HTMLElement | null>(null)
  const isControlled = anchorEl !== undefined
  const anchor = isControlled ? anchorEl : ownAnchor
  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLUListElement>(null)
  const selected = options.find((option) => option.value === value)
  const shownOptions = search ? filterOptions(options, query) : options
  const newName = create && search ? getNewOptionName(options, query) : null

  const close = () => {
    setAnchor(null)
    setQuery('')
    onClose?.()
  }

  const select = (option: string) => {
    onChange(option)
    close()
  }

  const createOption = (name: string) => {
    create?.onCreate(name)
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
      } else if (newName) {
        createOption(newName)
      }
    } else if (event.key !== 'Escape' && event.key !== 'Tab') {
      event.stopPropagation()
    }
  }

  return (
    <>
      {isControlled ? null : renderButton ? (
        renderButton({ onClick: (event) => setAnchor(event.currentTarget), isOpen: !!anchor })
      ) : (
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
      )}
      <DropdownMenu
        anchorEl={anchor}
        open={!!anchor}
        onClose={close}
        // The search field is focused instead
        autoFocus={!search}
        disableAutoFocus={!!search}
        slotProps={{ list: { ref: listRef } }}
        sx={sx.menu(menuWidth ?? anchor?.clientWidth)}
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
        {search && !shownOptions.length && !newName ? <Box sx={sx.noMatches}>{search.noMatches}</Box> : null}
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
        {newName && create ? (
          <DropdownMenuItem
            onClick={() => createOption(newName)}
            start={<Add sx={sx.createIcon} />}
            label={create.getLabel(newName)}
            sx={sx.create(!!shownOptions.length)}
          />
        ) : null}
      </DropdownMenu>
    </>
  )
}

export default Component
