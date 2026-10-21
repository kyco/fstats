'use client'

import {
  DeleteOutlined,
  ExpandMoreRounded,
  FolderOutlined,
  RuleOutlined,
  StorageRounded,
  TableChartOutlined,
} from '@mui/icons-material'
import { Box, Button, ButtonBase, Typography } from '@mui/material'
import { useState } from 'react'

import type { StorageDeleteAction, StorageListTab } from '@/types'
import {
  getRuleCount,
  useCategoryOverrides,
  useCategoryRules,
  useCategoryRulesets,
  useCategoryStorageSize,
  useMutateRemoveAllCategoryData,
} from '@/m-category/service'
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
  const { data: rulesets = [], isLoading: isLoadingRulesets } = useCategoryRulesets()
  const { data: overrides = [], isLoading: isLoadingOverrides } = useCategoryOverrides()
  const { data: rules = [], isLoading: isLoadingRules } = useCategoryRules()
  const { mutateAsync: removeAllCategoryData } = useMutateRemoveAllCategoryData()
  // One at a time, the others are disabled meanwhile
  const [running, setRunning] = useState<StorageDeleteAction | null>(null)
  // The list shown below the stats, a second click hides it
  const [tab, setTab] = useState<StorageListTab | null>(null)
  const { data: filesSize = 0, isLoading: isCalculatingFiles, isError: isFilesError } = useStorageSize()
  const { data: parsersSize = 0, isLoading: isCalculatingParsers, isError: isParsersError } = useCustomParsersSize()
  const { data: rulesSize = 0, isLoading: isCalculatingRules, isError: isRulesError } = useCategoryStorageSize()
  const isCalculating = isCalculatingFiles || isCalculatingParsers || isCalculatingRules
  const storageSize =
    isFilesError || isParsersError || isRulesError
      ? t('SETTINGS_PAGE.STORAGE.FAILED_TO_CALCULATE')
      : formatFileSize(filesSize + parsersSize + rulesSize)

  const fileCount = files.length
  const hasFiles = fileCount > 0
  const hasParsers = parsers.length > 0
  // The user's rules (their library) and the categories changed for single transactions
  const ruleCount = rules.length + overrides.length
  const hasRules = rulesets.length > 0 || rules.length > 0 || overrides.length > 0

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

  const renderList = (shownTab: StorageListTab) => {
    const items =
      shownTab === 'files'
        ? files.map((file) => ({ id: file.id, label: file.file.name }))
        : shownTab === 'formats'
          ? parsers.map((parser) => ({
              id: parser.id,
              label: (
                <>
                  <strong>{parser.bankName}</strong> {parser.accountName} ({parser.currency})
                </>
              ),
            }))
          : [
              ...rulesets.map((ruleset) => ({
                id: ruleset.id,
                label: (
                  <>
                    <strong>{ruleset.name}</strong>{' '}
                    {t('SETTINGS_PAGE.STORAGE.RULE_COUNT', { count: getRuleCount(ruleset) })}
                  </>
                ),
              })),
              ...(rules.length
                ? [
                    {
                      id: 'rules',
                      label: (
                        <>
                          <strong>{t('SETTINGS_PAGE.STORAGE.YOUR_RULES')}</strong>{' '}
                          {t('SETTINGS_PAGE.STORAGE.RULE_COUNT', { count: rules.length })}
                        </>
                      ),
                    },
                  ]
                : []),
              ...(overrides.length
                ? [
                    {
                      id: 'overrides',
                      label: (
                        <>
                          <strong>{t('SETTINGS_PAGE.STORAGE.SINGLE_TRANSACTIONS')}</strong>{' '}
                          {t('MISC.TRANSACTION_COUNT', { count: overrides.length })}
                        </>
                      ),
                    },
                  ]
                : []),
            ]

    if (!items.length) {
      const emptyKeys: Record<StorageListTab, string> = {
        files: 'SETTINGS_PAGE.STORAGE.NO_FILES',
        formats: 'SETTINGS_PAGE.STORAGE.NO_FORMATS',
        rules: 'SETTINGS_PAGE.STORAGE.NO_RULES',
      }

      return (
        <Typography component="p" sx={sx.listEmpty}>
          {t(emptyKeys[shownTab])}
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

          <ButtonBase {...getTabProps('rules')}>
            <RuleOutlined sx={sx.statIcon} />
            <Box sx={sx.statText}>
              <Typography sx={sx.statValue(isLoadingRulesets || isLoadingRules || isLoadingOverrides)}>
                {ruleCount}
              </Typography>
              <Typography variant="caption" sx={sx.statLabel}>
                {t('SETTINGS_PAGE.STORAGE.CATEGORY_RULES', { count: ruleCount })}
              </Typography>
            </Box>
            <ExpandMoreRounded sx={getChevronSx('rules')} />
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
        {tab ? renderList(tab) : null}
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
          variant="outlined"
          startIcon={<DeleteOutlined />}
          onClick={() =>
            runDelete({
              action: 'rules',
              confirmKey: 'SETTINGS_PAGE.STORAGE.CONFIRM_DELETE_RULES',
              remove: removeAllCategoryData,
            })
          }
          {...getButtonProps('rules', hasRules)}
        >
          {t('SETTINGS_PAGE.STORAGE.DELETE_RULES')}
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
                await removeAllCategoryData()
              },
            })
          }
          {...getButtonProps('all', hasFiles || hasParsers || hasRules)}
        >
          {t('SETTINGS_PAGE.STORAGE.DELETE_ALL_DATA')}
        </Button>
      </Box>
    </SettingsCard>
  )
}

export default Component
