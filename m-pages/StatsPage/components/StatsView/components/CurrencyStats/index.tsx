'use client'

import { Box, Divider, Stack } from '@mui/material'
import { useMemo } from 'react'

import type { CurrencyTransactions } from '@/types'
import type { Currency } from '@/types-enums'
import { filterTransactions, getTransactionHelper } from '@/m-transaction/service'
import { useUserPreferences } from '@/m-user/service'

import { useStatsTransactions } from '../../../../context'
import { useTransactionFilter } from '../../../../hooks'
import BalanceChart from '../../../BalanceChart'
import CategoryBreakdown from '../../../CategoryBreakdown'
import TransactionChart from '../../../TransactionChart'
import TransactionCountChart from '../../../TransactionCountChart'
import { ui } from './styled'

type CurrencyStatsProps = {
  currency: Currency
  /**
   * Of the currency, see `StatsTransactions.byCurrency`.
   */
  transactions: CurrencyTransactions
  /**
   * In the chart titles, when several currencies are shown.
   */
  chip?: string
}

/**
 * Charts and category breakdown of the transactions of one currency.
 */
const Component = ({ currency, transactions: { all, shown }, chip }: CurrencyStatsProps) => {
  const sx = ui()
  const { locale, dateFormat } = useUserPreferences()
  const { deselectedDays, excludedDayCount, count } = useStatsTransactions()
  const { filter, direction } = useTransactionFilter()
  const { transactions, transactionRangeItems } = useMemo(
    () =>
      getTransactionHelper({
        transactions: filterTransactions(shown, filter),
        locale,
        dateFormat,
        excludedDays: deselectedDays,
      }),
    [shown, locale, dateFormat, filter, deselectedDays],
  )
  const counts = useMemo(() => count(filterTransactions(all, filter)), [count, all, filter])

  return (
    <Stack divider={<Divider flexItem />}>
      <Box sx={sx.section}>
        <BalanceChart transactionRangeItems={transactionRangeItems} excludedDayCount={excludedDayCount} chip={chip} />
      </Box>

      <Box sx={sx.section}>
        <TransactionCountChart transactions={transactions} excludedDays={deselectedDays} counts={counts} chip={chip} />
      </Box>

      <Box sx={sx.section}>
        <TransactionChart transactions={transactions} currency={currency} chip={chip} />
      </Box>

      <Box sx={sx.section}>
        <CategoryBreakdown transactions={transactions} currency={currency} direction={direction} chip={chip} />
      </Box>
    </Stack>
  )
}

export default Component
