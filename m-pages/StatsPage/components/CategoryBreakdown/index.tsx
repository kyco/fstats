import { Box, FormControlLabel, Switch } from '@mui/material'
import { useState } from 'react'

import type { Transaction } from '@/types'
import { AmountFilter, CategoryDirection, Currency } from '@/types-enums'
import { CardTitle } from '@/components'
import { getStats } from '@/m-transaction/service'
import { useTranslation } from '@/lib/i18n'

import { useWorkspaceCategories } from '../../context'
import { getTransactionsGroupedByCategory } from './actions'
import { BreakdownTable } from './components'

type CategoryBreakdownProps = {
  transactions: Transaction[]
  currency: Currency
  /**
   * Of the category filter, only its table is shown.
   */
  direction: AmountFilter | null
  /**
   * Next to the title, e.g. the currency when several are shown.
   */
  chip?: string
}

const Component = ({ transactions, currency, direction, chip }: CategoryBreakdownProps) => {
  const { t } = useTranslation()
  const { totalIncome, totalExpense } = getStats(transactions)
  const { tree } = useWorkspaceCategories()
  const groupedTransactions = getTransactionsGroupedByCategory({ transactions, tree, t })
  const income = groupedTransactions.filter((category) => category.direction === CategoryDirection.IN)
  const expenses = groupedTransactions.filter((category) => category.direction === CategoryDirection.OUT)
  const [showAll, setShowAll] = useState(false)

  return (
    <Box>
      <CardTitle
        chip={chip}
        action={
          <FormControlLabel
            control={<Switch size="small" checked={showAll} onChange={(event) => setShowAll(event.target.checked)} />}
            label={t('STATS_PAGE.STATS_VIEW.SHOW_ALL_CATEGORIES')}
            slotProps={{ typography: { variant: 'caption', color: 'text.secondary' } }}
            sx={{ mr: 0 }}
          />
        }
      >
        {t('STATS_PAGE.STATS_VIEW.BREAKDOWN_BY_CATEGORY')}
      </CardTitle>

      {/* Only the table matching the direction */}
      {direction !== AmountFilter.OUT ? (
        <Box sx={direction !== AmountFilter.IN ? { mb: 3 } : undefined}>
          <BreakdownTable
            title={t('MISC.INCOME')}
            emptyText={t('STATS_PAGE.STATS_VIEW.NO_INCOME')}
            transactionsGrouped={income}
            total={totalIncome}
            currency={currency}
            showAll={showAll}
          />
        </Box>
      ) : null}

      {direction !== AmountFilter.IN ? (
        <BreakdownTable
          title={t('MISC.EXPENSES')}
          emptyText={t('STATS_PAGE.STATS_VIEW.NO_EXPENSES')}
          transactionsGrouped={expenses}
          total={totalExpense}
          currency={currency}
          showAll={showAll}
        />
      ) : null}
    </Box>
  )
}

export default Component
