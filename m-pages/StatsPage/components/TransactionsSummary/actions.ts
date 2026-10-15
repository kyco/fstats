import type { StatsTransactions, TransactionFilter } from '@/types'
import type { Currency } from '@/types-enums'

import { filterTransactions } from '../../actions'

/**
 * Transactions matching the filter (without duplicates and those on deselected days) and their counts, grouped by
 * currency, as amounts in different currencies can't be summed up.
 */
export const getTransactionsByCurrency = ({ byCurrency, count }: StatsTransactions, filter: TransactionFilter) => {
  return Object.entries(byCurrency).map(([currency, { all, shown }]) => ({
    currency: currency as Currency,
    transactions: filterTransactions(shown, filter),
    counts: count(filterTransactions(all, filter)),
  }))
}
