'use client'

import { InsertChartOutlined } from '@mui/icons-material'
import { Box, Stack } from '@mui/material'
import { useMemo } from 'react'

import { FletchingDivider } from '@/components'
import { getFilteredCurrencies } from '@/m-transaction/service'
import { useTranslation } from '@/lib/i18n'

import { getEmptyReason } from '../../actions'
import { useStatsTransactions, useWorkspaceFiles } from '../../context'
import { useCurrencySelect, useTransactionFilter } from '../../hooks'
import ViewEmptyState from '../ViewEmptyState'
import ViewToolbar from '../ViewToolbar'
import { CurrencyStats } from './components'
import { ui } from './styled'

/**
 * Stats view of the workspace: charts and category breakdown of the selected files, per currency.
 */
const Component = () => {
  const sx = ui()
  const { t } = useTranslation()
  const { files, checkedFiles } = useWorkspaceFiles()
  const { all, shown, byCurrency } = useStatsTransactions()
  const { filter } = useTransactionFilter()
  const emptyReason = useMemo(
    () =>
      getEmptyReason({
        fileCount: files.length,
        checkedCount: checkedFiles.length,
        transactions: { all, shown, filter },
      }),
    [files.length, checkedFiles.length, all, shown, filter],
  )
  // Only those with transactions left by the filters
  const currencies = useMemo(() => getFilteredCurrencies(shown, filter), [shown, filter])
  const { selected, setSelected, shownCurrencies } = useCurrencySelect(currencies)

  return (
    <>
      <ViewToolbar currency={{ currencies, value: selected, onChange: setSelected }} />
      <Box sx={sx.scroll}>
        {emptyReason ? (
          <ViewEmptyState
            reason={emptyReason}
            dropZone={{
              icon: InsertChartOutlined,
              title: t('STATS_PAGE.STATS_VIEW.NO_DATA'),
              subtitleKey: 'STATS_PAGE.STATS_VIEW.NO_DATA_SELECT',
            }}
          />
        ) : (
          // One block per currency, as amounts in different currencies can't be summed up
          <Stack divider={<FletchingDivider />}>
            {shownCurrencies.map((currency) => (
              <CurrencyStats
                key={currency}
                currency={currency}
                transactions={byCurrency[currency]!}
                chip={currencies.length > 1 ? currency : undefined}
              />
            ))}
          </Stack>
        )}
      </Box>
    </>
  )
}

export default Component
