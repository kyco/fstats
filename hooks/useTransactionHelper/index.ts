import { parseISO } from 'date-fns'

import { Transaction, TransactionRangeItem } from '@/types'
import { DateFormat, UserLocale } from '@/types-enums'

import { getTransactionRangeItems, getTransactionsDateRange } from './helper'

export { getTransactionRangeItems, getTransactionsDateRange, RangeGranularity } from './helper'

type GetTransactionHelperProps = {
  /**
   * Without duplicates, e.g. `StatsTransactions.shown`.
   */
  transactions: Transaction[]
  locale: UserLocale
  dateFormat: DateFormat
  /**
   * Days (`yyyy-MM-dd`) whose transactions were removed, shown as gaps.
   */
  excludedDays?: Set<string>
}

/**
 * The transactions sorted by date, and their range items for the charts.
 */
export const getTransactionHelper = ({
  transactions: unsorted,
  locale,
  dateFormat,
  excludedDays,
}: GetTransactionHelperProps): {
  transactions: Transaction[]
  transactionRangeItems: TransactionRangeItem[]
} => {
  if (!unsorted.length) {
    return {
      transactions: [],
      transactionRangeItems: [],
    }
  }

  // Copied, the transactions are shared
  const transactions = [...unsorted].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
  const transactionRangeItems = getTransactionRangeItems({
    dateRange: getTransactionsDateRange(transactions),
    transactions,
    locale,
    dateFormat,
    excludedDays,
  })

  return {
    transactions,
    transactionRangeItems,
  }
}
