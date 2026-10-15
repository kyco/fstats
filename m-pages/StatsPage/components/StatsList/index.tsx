'use client'

import { Box, Typography } from '@mui/material'

import type { Transaction, TransactionCounts } from '@/types'
import type { Currency } from '@/types-enums'
import { useUserPreferences } from '@/m-user/service'
import { toFixedLocaleCurrency } from '@/utils/Number'
import { getStats } from '@/utils/Stats'
import { useTranslation } from '@/lib/i18n'
import { Big } from '@/lib/w-big'

import { getAmountColor, getTransactionCountText } from '../../actions'
import { ui } from './styled'

type StatsListProps = {
  transactions: Transaction[]
  currency: Currency
  /**
   * Shown above the stats, the count of `transactions` without.
   */
  counts?: TransactionCounts
}

/**
 * Income minus expenses with the total below, like a ledger.
 */
const Component = ({ transactions, currency, counts }: StatsListProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const { locale } = useUserPreferences()
  const { totalIncome, totalExpense, profit } = getStats(transactions)

  const items = [
    { label: t('MISC.INCOME'), value: totalIncome },
    { label: t('MISC.EXPENSES'), value: Big(totalExpense).times(-1).toString() },
  ]

  return (
    <Box>
      <Typography component="div" sx={sx.count}>
        {getTransactionCountText(counts ?? { count: transactions.length, dateExcludedCount: 0, duplicateCount: 0 })}
      </Typography>
      <Box component="dl" sx={sx.list}>
        {items.map((item) => (
          <Box key={item.label} sx={sx.row}>
            <Typography component="dt" sx={sx.label}>
              {item.label}
            </Typography>
            <Typography component="dd" sx={{ ...sx.value, color: getAmountColor(item.value) }}>
              {toFixedLocaleCurrency({ value: item.value, currency, locale })}
            </Typography>
          </Box>
        ))}
        <Box sx={{ ...sx.row, ...sx.totalRow }}>
          <Typography component="dt" sx={{ ...sx.label, ...sx.total }}>
            {t('MISC.TOTAL')}
          </Typography>
          <Typography component="dd" sx={sx.totalValue(getAmountColor(profit))}>
            {toFixedLocaleCurrency({ value: profit, currency, locale })}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Component
