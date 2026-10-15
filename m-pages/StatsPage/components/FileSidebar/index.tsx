'use client'

import { Box, Typography } from '@mui/material'
import { useSearchParams } from 'next/navigation'

import { getView, WorkspaceView } from '@/common'
import { useTranslation } from '@/lib/i18n'

import { useWorkspaceFiles } from '../../context'
import { useTransactionFilter } from '../../hooks'
import FileDetails from '../FileDetails'
import StatsCard from '../StatsCard'
import StatsSkeleton from '../StatsSkeleton'
import TransactionsSummary from '../TransactionsSummary'
import { ui } from './styled'

/**
 * Summary of the checked files and the details per file.
 */
const Component = () => {
  const sx = ui()
  const { t } = useTranslation()
  const { checkedFiles, selectedFiles: checkedParsedFiles } = useWorkspaceFiles()
  // The summary is only a placeholder, the filters don't apply to the CSV view
  const isCsv = getView(useSearchParams()) === WorkspaceView.CSV
  const csvTitle = t('STATS_PAGE.CSV_DISABLED')
  // The stats show money in and out side by side, so only the category filter applies
  const { categoryFilter } = useTransactionFilter()

  if (!checkedFiles.length) {
    return (
      <Box sx={sx.sidebar}>
        <StatsSkeleton title={t('STATS_PAGE.NO_SELECTION.TITLE')} />
      </Box>
    )
  }

  return (
    <Box sx={sx.sidebar}>
      {checkedParsedFiles.length ? (
        <>
          {isCsv ? (
            <StatsSkeleton title={csvTitle} />
          ) : (
            <StatsCard>
              <TransactionsSummary filter={categoryFilter} />
            </StatsCard>
          )}
          <Typography component="h2" sx={sx.subheader}>
            {t('STATS_PAGE.SIDEBAR.FILE_DETAILS')}
          </Typography>
        </>
      ) : null}
      <StatsCard>
        {checkedFiles.map((file) => (
          <FileDetails key={file.id} file={file} filter={categoryFilter} />
        ))}
      </StatsCard>
    </Box>
  )
}

export default Component
