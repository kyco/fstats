import type { DateRange } from './global'
import type { Transaction } from './services/transaction'

export type Size = {
  width?: number
  height?: number
}

export type TransactionRangeItem = {
  range: DateRange
  label: string
  transactions: Transaction[]
  /**
   * All its transactions were filtered out by date, shown as a gap.
   */
  isExcluded: boolean
}

export type SortingPref = 'asc' | 'desc' | 'totalAsc' | 'totalDesc'
