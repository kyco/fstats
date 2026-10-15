'use client'

import { AccountBalanceOutlined, CreditCardOutlined } from '@mui/icons-material'
import { Box, Chip } from '@mui/material'
import { useMemo } from 'react'

import type { StatsFile, TransactionFilter } from '@/types'
import { MISC } from '@/common'
import { getFileAccount, getFileCurrency, getFileTransactions, isParsed } from '@/m-stats-file/service'
import { filterDays, filterTransactions, withoutDuplicates } from '@/m-transaction/service'
import { useUserPreferences } from '@/m-user/service'
import { toDisplayDate } from '@/utils/Date'
import { formatFileSize } from '@/utils/File'

import { getFileFormat, getFileNameColor } from '../../actions'
import { useStatsTransactions } from '../../context'
import StatsRow from '../StatsRow'
import { ui } from './styled'

type FileDetailsProps = {
  file: StatsFile
  filter: TransactionFilter
}

const Component = ({ file, filter }: FileDetailsProps) => {
  const sx = ui()
  const { locale } = useUserPreferences()
  // Duplicates across all checked files in their order, so the per-file stats add up to the summary
  const { duplicates, deselectedDays, count } = useStatsTransactions()
  const stats = useMemo(() => {
    if (!isParsed(file)) {
      return null
    }

    const transactions = filterTransactions(getFileTransactions(file), filter)
    return {
      transactions: filterDays(withoutDuplicates(transactions, duplicates), deselectedDays),
      currency: getFileCurrency(file),
      counts: count(transactions),
    }
  }, [file, filter, duplicates, deselectedDays, count])

  const renderAccount = () => {
    if (!isParsed(file)) {
      // Why the file wasn't parsed
      const format = getFileFormat(file)
      return (
        <Box sx={{ ...sx.status, color: format.color }} title={format.value}>
          {format.value}
        </Box>
      )
    }

    const { bankName, accountNames } = getFileAccount(file)

    return (
      <Box sx={sx.chips}>
        <Chip size="small" variant="outlined" icon={<AccountBalanceOutlined />} label={bankName} sx={sx.chip} />
        {accountNames.map((accountName) => (
          <Chip
            key={accountName}
            size="small"
            variant="outlined"
            icon={<CreditCardOutlined />}
            label={accountName}
            sx={sx.chip}
          />
        ))}
      </Box>
    )
  }

  return (
    <StatsRow
      title={file.file.name}
      titleColor={getFileNameColor(file)}
      stats={stats && { transactions: stats.transactions, currency: stats.currency }}
      counts={stats?.counts}
    >
      <Box sx={sx.info}>
        {renderAccount()}
        <Box sx={sx.meta}>
          {formatFileSize(file.file.size)} {MISC.CENTER_DOT}{' '}
          {toDisplayDate({ date: new Date(file.created), locale, formatTo: 'd MMM yyyy, HH:mm' })}
        </Box>
      </Box>
    </StatsRow>
  )
}

export default Component
