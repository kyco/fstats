'use client'

import { ArrowDropDown, CreateNewFolderOutlined, DeleteOutlined, NoteAddOutlined } from '@mui/icons-material'
import { Box, Checkbox, Divider, IconButton, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'

import { MISC } from '@/common'
import { DropdownMenu, DropdownMenuDivider, DropdownMenuItem, DropdownMenuSubheader } from '@/components'
import { isConvertible, isError, isParsed, isUnknown, useMutateRemoveFiles } from '@/m-stats-file/service'
import { getCheckState } from '@/utils/Set'
import { useTranslation } from '@/lib/i18n'

import { useWorkspace, useWorkspaceFiles } from '../../context'
import { getBankAccountOptions, isSameSelection, toggleFileIds } from './actions'
import { ui } from './styled'

const Component = () => {
  const sx = ui()
  const { t } = useTranslation()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  // The demo file can't be unchecked or removed
  const { isDemoMode, onAddFiles, onAddFolder } = useWorkspace()
  const { files, checkedIds, isAllChecked, toggleAll, setSelectedFileIds } = useWorkspaceFiles()
  const { mutate: removeFiles, isPending: isRemoving } = useMutateRemoveFiles()

  const toIds = (list: typeof files) => list.map((file) => file.id)

  const selectOptions = [
    { id: 'all', label: t('STATS_PAGE.FILE_TOOLBAR.SELECT_ALL'), fileIds: toIds(files) },
    { id: 'none', label: t('STATS_PAGE.FILE_TOOLBAR.SELECT_NONE'), fileIds: [] },
    { id: 'supported', label: t('STATS_PAGE.FILE_TOOLBAR.SELECT_SUPPORTED'), fileIds: toIds(files.filter(isParsed)) },
    // Same colors as the file names in the list
    {
      id: 'convertible',
      label: t('STATS_PAGE.FILE_TOOLBAR.SELECT_CONVERTIBLE'),
      fileIds: toIds(files.filter(isConvertible)),
      color: 'info.main',
    },
    {
      id: 'unsupported',
      label: t('STATS_PAGE.FILE_TOOLBAR.SELECT_UNSUPPORTED'),
      fileIds: toIds(files.filter(isUnknown)),
      color: 'warning.main',
    },
    {
      id: 'invalid',
      label: t('STATS_PAGE.FILE_TOOLBAR.SELECT_INVALID'),
      fileIds: toIds(files.filter(isError)),
      color: 'error.main',
    },
  ]

  const bankOptions = getBankAccountOptions(files)

  // Derived from the selection, so it stays correct when files are (un)checked by hand
  const isActive = (fileIds: string[]) => isSameSelection(fileIds, checkedIds)
  const activeLabel = checkedIds.length
    ? [...bankOptions, ...selectOptions.filter((option) => !['all', 'none'].includes(option.id))].find((option) =>
        isActive(option.fileIds),
      )?.label
    : undefined

  const selectFiles = (fileIds: string[]) => {
    setSelectedFileIds(fileIds)
    setMenuAnchor(null)
  }

  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.select}>
        <Checkbox
          size="small"
          checked={isAllChecked}
          disabled={!files.length || isDemoMode}
          indeterminate={checkedIds.length > 0 && !isAllChecked}
          onChange={toggleAll}
          sx={sx.checkbox}
        />
        <IconButton
          size="small"
          disabled={!files.length || isDemoMode}
          onClick={(event) => setMenuAnchor(event.currentTarget)}
          sx={sx.selectMenuButton}
        >
          <ArrowDropDown />
        </IconButton>
      </Box>

      <DropdownMenu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        {selectOptions.map((option) => {
          const isDisabled = option.id !== 'none' && !option.fileIds.length

          return (
            <DropdownMenuItem
              key={option.id}
              disabled={isDisabled}
              onClick={() => selectFiles(option.fileIds)}
              // Without files, an option would match an empty selection
              selected={!isDisabled && isActive(option.fileIds)}
              label={option.label}
              count={option.id === 'none' ? undefined : option.fileIds.length}
              sx={'color' in option ? { color: option.color } : undefined}
            />
          )
        })}
        {bankOptions.length ? <DropdownMenuDivider /> : null}
        {bankOptions.length ? (
          <DropdownMenuSubheader>{t('STATS_PAGE.FILE_TOOLBAR.BANK_ACCOUNTS')}</DropdownMenuSubheader>
        ) : null}
        {/* Checkboxes, so accounts can be combined, e.g. all of one bank. The menu stays open */}
        {bankOptions.map((option) => {
          const checkedCount = option.fileIds.filter((id) => checkedIds.includes(id)).length

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setSelectedFileIds(toggleFileIds(option.fileIds, checkedIds))}
              role="menuitemcheckbox"
              aria-checked={checkedCount === option.fileIds.length}
              start={
                <Checkbox
                  size="small"
                  {...getCheckState(option.fileIds.length - checkedCount, option.fileIds.length)}
                  tabIndex={-1}
                  sx={sx.menuCheckbox}
                />
              }
              label={option.label}
              count={option.fileIds.length}
            />
          )
        })}
      </DropdownMenu>

      {checkedIds.length && !isDemoMode ? (
        <>
          <Tooltip title={t('STATS_PAGE.FILE_TOOLBAR.REMOVE_SELECTED')}>
            <IconButton size="small" disabled={isRemoving} onClick={() => removeFiles(checkedIds)} sx={sx.actionButton}>
              <DeleteOutlined />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={sx.divider} />
        </>
      ) : null}

      <Typography variant="caption" sx={sx.count} title={activeLabel}>
        {checkedIds.length
          ? t('STATS_PAGE.FILE_TOOLBAR.SELECTED_COUNT', { selected: checkedIds.length, total: files.length })
          : t('STATS_PAGE.FILE_TOOLBAR.FILE_COUNT', { count: files.length })}
        {activeLabel ? ` ${MISC.CENTER_DOT} ${activeLabel}` : null}
      </Typography>

      <Tooltip title={t('STATS_PAGE.FILE_TOOLBAR.ADD_FILES')}>
        <IconButton size="small" onClick={onAddFiles} sx={sx.actionButton}>
          <NoteAddOutlined />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('STATS_PAGE.FILE_TOOLBAR.ADD_FOLDER')}>
        <IconButton size="small" onClick={onAddFolder} sx={sx.actionButton}>
          <CreateNewFolderOutlined />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export default Component
