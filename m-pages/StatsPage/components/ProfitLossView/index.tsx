'use client'

import { ReceiptLongOutlined } from '@mui/icons-material'
import { Box, Stack } from '@mui/material'
import { mapValues } from 'lodash'
import { useMemo } from 'react'

import type { Currency } from '@/types-enums'
import { FletchingDivider, SegmentedToggle } from '@/components'
import { filterDays, filterTransactions, getAccountTransactions, getProfitLoss } from '@/m-transaction/service'
import { useTranslation } from '@/lib/i18n'

import { EMPTY_REASON_TITLE_KEYS, getEmptyReason, getTransactionCountText, isMissingData } from '../../actions'
import { useStatsTransactions, useWorkspaceFiles } from '../../context'
import { useBreakdownPeriod, useCurrencySelect, useTransactionFilter } from '../../hooks'
import PreviewSection from '../PreviewSection'
import ViewEmptyState from '../ViewEmptyState'
import ViewToolbar from '../ViewToolbar'
import { getBreakdownPeriodOptions } from './actions'
import { ProfitLossTable } from './components'
import { ui } from './styled'

/**
 * Profit and loss view of the workspace: income and expenses per category and period, one table per currency.
 */
const Component = () => {
  const sx = ui()
  const { t } = useTranslation()
  const { files, checkedFiles, selectedFiles } = useWorkspaceFiles()
  const { all, unique, shown, byCurrency, deselectedDays, count } = useStatsTransactions()
  const { period, setPeriod } = useBreakdownPeriod()
  // Income and expenses are both part of it, so the amount filter doesn't apply
  const { categoryFilter: filter } = useTransactionFilter()
  const emptyReason = useMemo(
    () =>
      getEmptyReason({
        fileCount: files.length,
        checkedCount: checkedFiles.length,
        transactions: { all, shown, filter },
      }),
    [files.length, checkedFiles.length, all, shown, filter],
  )
  const countsByCurrency = useMemo(
    () => mapValues(byCurrency, (transactions) => count(filterTransactions(transactions!.all, filter))),
    [byCurrency, count, filter],
  )
  // With the bank account of their section, only depends on the files
  const accountTransactions = useMemo(() => getAccountTransactions(selectedFiles, unique), [selectedFiles, unique])
  const profitLosses = useMemo(
    () =>
      getProfitLoss({
        accountTransactions,
        period,
        t,
        filter: (transactions) => filterTransactions(filterDays(transactions, deselectedDays), filter),
      }),
    [accountTransactions, deselectedDays, filter, period, t],
  )
  const getCaption = (currency: Currency) => {
    const counts = countsByCurrency[currency]
    return counts ? getTransactionCountText(counts) : undefined
  }
  const currencies = useMemo(() => profitLosses.map((profitLoss) => profitLoss.currency), [profitLosses])
  const { selected, setSelected, shownCurrencies } = useCurrencySelect(currencies)

  return (
    <>
      <ViewToolbar currency={{ currencies, value: selected, onChange: setSelected }}>
        <SegmentedToggle
          value={period}
          options={getBreakdownPeriodOptions()}
          onChange={setPeriod}
          disabled={isMissingData(emptyReason)}
          disabledTooltip={emptyReason ? t(EMPTY_REASON_TITLE_KEYS[emptyReason]) : undefined}
        />
      </ViewToolbar>
      <Box sx={sx.scroll}>
        {emptyReason ? (
          <ViewEmptyState
            reason={emptyReason}
            dropZone={{
              icon: ReceiptLongOutlined,
              title: t('STATS_PAGE.STATS_VIEW.NO_DATA'),
              subtitleKey: 'STATS_PAGE.STATS_VIEW.NO_DATA_SELECT',
            }}
          />
        ) : (
          // Sections like the transactions view, so the headings line up when switching. Padded per currency, so the
          // dividers between them go edge to edge.
          <Stack divider={<FletchingDivider />}>
            {profitLosses
              .filter((profitLoss) => shownCurrencies.includes(profitLoss.currency))
              .map((profitLoss) => (
                <Box key={profitLoss.currency} sx={sx.section}>
                  <PreviewSection
                    title={t('STATS_PAGE.PROFIT_LOSS.TITLE')}
                    chip={currencies.length > 1 ? profitLoss.currency : undefined}
                    caption={getCaption(profitLoss.currency)}
                  >
                    <ProfitLossTable profitLoss={profitLoss} period={period} />
                  </PreviewSection>
                </Box>
              ))}
          </Stack>
        )}
      </Box>
    </>
  )
}

export default Component
