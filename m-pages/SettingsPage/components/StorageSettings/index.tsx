'use client'

import {
  DeleteOutlined,
  ExpandMoreRounded,
  FolderOutlined,
  StorageRounded,
  TableChartOutlined,
} from '@mui/icons-material'
import { Box, Button, ButtonBase, Typography } from '@mui/material'
import { useState } from 'react'

import type { StorageDeleteAction, StorageListTab } from '@/types'
import { useCustomParsers, useCustomParsersSize, useMutateRemoveAllCustomParsers } from '@/m-custom-parser/service'
import { useFiles, useMutateRemoveAllFiles, useStorageSize } from '@/m-stats-file/service'
import { formatFileSize } from '@/utils/File'
import { useTranslation } from '@/lib/i18n'

import SettingsCard from '../SettingsCard'
import { ui } from './styled'

type RunDeleteProps = {
  action: StorageDeleteAction
  confirmKey: string
  remove: () => Promise<void>
}

const Component = () => {
  const sx = ui()
  const { t } = useTranslation()
  const { data: files = [], isLoading: isLoadingFiles } = useFiles()
  const { data: parsers = [], isLoading: isLoadingParsers } = useCustomParsers()
  const { mutateAsync: removeAllFiles } = useMutateRemoveAllFiles()
  const { mutateAsync: removeAllCustomParsers } = useMutateRemoveAllCustomParsers()
  // One at a time, the others are disabled meanwhile
  const [running, setRunning] = useState<StorageDeleteAction | null>(null)
  // The list shown below the stats, a second click hides it
  const [tab, setTab] = useState<StorageListTab | null>(null)
  const { data: filesSize = 0, isLoading: isCalculatingFiles, isError: isFilesError } = useStorageSize()
  const { data: parsersSize = 0, isLoading: isCalculatingParsers, isError: isParsersError } = useCustomParsersSize()
  const isCalculating = isCalculatingFiles || isCalculatingParsers
  const storageSize =
    isFilesError || isParsersError
      ? t('SETTINGS_PAGE.STORAGE.FAILED_TO_CALCULATE')
      : formatFileSize(filesSize + parsersSize)

  const fileCount = files.length
  const hasFiles = fileCount > 0
  const hasParsers = parsers.length > 0

  const runDelete = async ({ action, confirmKey, remove }: RunDeleteProps) => {
    if (!confirm(t(confirmKey))) {
      return
    }

    setRunning(action)
    try {
      await remove()
    } catch {
      // Nothing was removed or the counts show what's left
    } finally {
      setRunning(null)
    }
  }

  const getTabProps = (value: StorageListTab) => ({
    'aria-expanded': tab === value,
    onClick: () => setTab((prev) => (prev === value ? null : value)),
    sx: { ...sx.statItem, ...sx.statTab, ...(tab === value ? sx.selectedTab : null) },
  })

  // Shows the stat expands its list, flipped while it's shown
  const getChevronSx = (value: StorageListTab) => ({ ...sx.chevron, ...(tab === value ? sx.chevronOpen : null) })

  const renderList = () => {
    const items =
      tab === 'files'
        ? files.map((file) => ({ id: file.id, label: file.file.name }))
        : parsers.map((parser) => ({
            id: parser.id,
            label: (
              <>
                <strong>{parser.bankName}</strong> {parser.accountName} ({parser.currency})
              </>
            ),
          }))

    if (!items.length) {
      return (
        <Typography component="p" sx={sx.listEmpty}>
          {t(tab === 'files' ? 'SETTINGS_PAGE.STORAGE.NO_FILES' : 'SETTINGS_PAGE.STORAGE.NO_FORMATS')}
        </Typography>
      )
    }

    return (
      <Box component="ul" sx={sx.list}>
        {items.map((item) => (
          <li key={item.id}>{item.label}</li>
        ))}
      </Box>
    )
  }

  const getButtonProps = (action: StorageDeleteAction, hasData: boolean) => ({
    disabled: !hasData || (!!running && running !== action),
    loading: running === action,
  })

  return (
    <SettingsCard title={t('SETTINGS_PAGE.STORAGE.TITLE')}>
      <Box sx={sx.details}>
        <Box sx={sx.statsContainer}>
          <ButtonBase {...getTabProps('files')}>
            <FolderOutlined sx={sx.statIcon} />
            <Box sx={sx.statText}>
              <Typography sx={sx.statValue(isLoadingFiles)}>{fileCount}</Typography>
              <Typography variant="caption" sx={sx.statLabel}>
                {t('SETTINGS_PAGE.STORAGE.FILES', { count: fileCount })}
              </Typography>
            </Box>
            <ExpandMoreRounded sx={getChevronSx('files')} />
          </ButtonBase>

          <ButtonBase {...getTabProps('formats')}>
            <TableChartOutlined sx={sx.statIcon} />
            <Box sx={sx.statText}>
              <Typography sx={sx.statValue(isLoadingParsers)}>{parsers.length}</Typography>
              <Typography variant="caption" sx={sx.statLabel}>
                {t('SETTINGS_PAGE.STORAGE.CUSTOM_FORMATS', { count: parsers.length })}
              </Typography>
            </Box>
            <ExpandMoreRounded sx={getChevronSx('formats')} />
          </ButtonBase>

          <Box sx={sx.statItem}>
            <StorageRounded sx={sx.statIcon} />
            <Box sx={sx.statText}>
              <Typography sx={sx.statValue(isCalculating)}>{storageSize}</Typography>
              <Typography variant="caption" sx={sx.statLabel}>
                {t('SETTINGS_PAGE.STORAGE.STORAGE_USED')}
              </Typography>
            </Box>
          </Box>
        </Box>
        {tab ? renderList() : null}
      </Box>

      <Box sx={sx.actions}>
        <Button
          color="error"
          variant="outlined"
          startIcon={<DeleteOutlined />}
          onClick={() =>
            runDelete({
              action: 'files',
              confirmKey: 'SETTINGS_PAGE.STORAGE.CONFIRM_DELETE_FILES',
              remove: removeAllFiles,
            })
          }
          {...getButtonProps('files', hasFiles)}
        >
          {t('SETTINGS_PAGE.STORAGE.DELETE_FILES')}
        </Button>
        <Button
          color="error"
          variant="outlined"
          startIcon={<DeleteOutlined />}
          onClick={() =>
            runDelete({
              action: 'formats',
              confirmKey: 'SETTINGS_PAGE.STORAGE.CONFIRM_DELETE_FORMATS',
              remove: removeAllCustomParsers,
            })
          }
          {...getButtonProps('formats', hasParsers)}
        >
          {t('SETTINGS_PAGE.STORAGE.DELETE_FORMATS')}
        </Button>
        <Button
          color="error"
          variant="contained"
          startIcon={<DeleteOutlined />}
          onClick={() =>
            runDelete({
              action: 'all',
              confirmKey: 'SETTINGS_PAGE.STORAGE.CONFIRM_DELETE_ALL',
              remove: async () => {
                // Files first, so there's nothing to re-parse once the formats are gone
                await removeAllFiles()
                await removeAllCustomParsers()
              },
            })
          }
          {...getButtonProps('all', hasFiles || hasParsers)}
        >
          {t('SETTINGS_PAGE.STORAGE.DELETE_ALL_DATA')}
        </Button>
      </Box>
    </SettingsCard>
  )
}

export default Component
