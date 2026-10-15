import type { SimilarTransactions, Transaction } from '@/types'
import { sumValues } from '@/utils/Stats'

const normalizeDescription = (description: string) => {
  return description.trim().replace(/\s+/g, ' ').toLowerCase()
}

/**
 * Transactions with the same description (ignoring case and spacing) and currency, e.g. the payments to a shop, with
 * their total and dates.
 */
export const getSimilarTransactions = (transactions: Transaction[], transaction: Transaction): SimilarTransactions => {
  const key = normalizeDescription(transaction.description)
  const similar = transactions
    .filter((other) => other.currency === transaction.currency && normalizeDescription(other.description) === key)
    .sort((a, b) => a.date.localeCompare(b.date))
  const total = sumValues(similar)

  return {
    count: similar.length,
    total: total.toString(),
    average: similar.length ? total.div(similar.length).toString() : '0',
    first: similar.at(0)?.date ?? null,
    last: similar.at(-1)?.date ?? null,
  }
}
