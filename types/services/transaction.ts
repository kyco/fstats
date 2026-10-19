import { z } from 'zod'

import type { AmountFilter, Currency } from '@/types-enums'
import { zCurrency } from '@/types-enums'
import type { BankAccountId } from '@/utils/Parser/registry'

import type { DateRange, NumberString } from '../global'
import { zDateTimeString, zIdString, zNumberString } from '../global'
import type { _KeysCheck } from '../key-check'

const zParentCategoryCode = z.string().regex(/^[A-Z]{3}$/)
export const zCategoryCode = z.string().regex(/^[A-Z]{3}_\d{2}$/)

export type ParentCategoryCode = z.infer<typeof zParentCategoryCode>
export type CategoryCode = z.infer<typeof zCategoryCode>

export const zCategory = z.object({
  code: zCategoryCode,
})

export type Category = z.infer<typeof zCategory>

export const zParentCategory = z.object({
  code: zParentCategoryCode,
  subcategories: z.record(zCategoryCode, zCategory),
})

export type ParentCategory = z.infer<typeof zParentCategory>

export const zTransaction = z.object({
  /**
   * Hash of the transaction content (excluding `category`), so it's stable across re-parses
   * and equal for identical transactions in overlapping statements.
   */
  id: zIdString,
  date: zDateTimeString,
  description: z.string(),
  value: zNumberString,
  currency: zCurrency,
  category: zCategoryCode.nullable(),
  /**
   * Optional bank specific columns, see `extraColumns` in the bank definitions (`utils/Parser/banks/`).
   */
  extra: z
    .object({
      parentCategory: z.string().optional(),
      category: z.string().optional(),
      balance: zNumberString.optional(),
      reference: z.string().optional(),
      transactionType: z.string().optional(),
    })
    .nullable(),
})

export type Transaction = z.infer<typeof zTransaction>

export const zTransactionAtRest = z.object({
  ...zTransaction.shape,
  currency: z.string(),
})

// Safety checks
true satisfies _KeysCheck<Transaction, z.infer<typeof zTransactionAtRest>>

// -------------------------------------------------------
// Filters and counts, see `m-transaction`
// -------------------------------------------------------

export type TransactionFilter = {
  amount: AmountFilter
  /**
   * Category codes (or `NO_CATEGORY`) deselected in the filters.
   */
  excludedCategories: Set<string>
}

/**
 * Transactions of the checked parsed files: all (before the date explorer, in file order), without duplicates and on
 * the selected days of the date explorer. The single source of the transactions of the views and the sidebar, see
 * `useStatsTransactions`. Each view applies its `TransactionFilter` itself.
 */
export type StatsTransactions = CurrencyTransactions & {
  /**
   * Transactions also in an earlier file (e.g. overlapping statements), by reference.
   */
  duplicates: Set<Transaction>
  deselectedDays: Set<string>
  /**
   * Days with transactions that are deselected.
   */
  excludedDayCount: number
  /**
   * Per currency of the files, in file order. Also currencies of files without transactions.
   */
  byCurrency: Partial<Record<Currency, CurrencyTransactions>>
  /**
   * Counts of transactions out of `all` (e.g. filtered), see `getTransactionCounts`.
   */
  count: (transactions: Transaction[]) => TransactionCounts
}

export type CurrencyTransactions = {
  /**
   * Before the date explorer, with duplicates.
   */
  all: Transaction[]
  unique: Transaction[]
  /**
   * Unique, on selected days.
   */
  shown: Transaction[]
}

/**
 * The part of `StatsTransactions` that only depends on the files, so it is kept when (de)selecting days.
 */
export type CheckedTransactions = {
  all: Transaction[]
  unique: Transaction[]
  duplicates: Set<Transaction>
  byCurrency: Partial<Record<Currency, { all: Transaction[]; unique: Transaction[] }>>
}

export type TransactionCounts = {
  /**
   * Counted in the stats: without duplicates and those on deselected days.
   */
  count: number
  /**
   * On days deselected in the date explorer.
   */
  dateExcludedCount: number
  /**
   * Also in an earlier file (e.g. overlapping statements), on selected days.
   */
  duplicateCount: number
}

export type SourcedTransaction = Transaction & {
  /**
   * Name of the file the transaction is from.
   */
  source: string
  /**
   * Names of all files containing the transaction, in file order.
   */
  sources: string[]
  /**
   * The same transaction is also in an earlier file (e.g. overlapping statements).
   */
  isDuplicate: boolean
}

/**
 * Transactions with the same description, see `getSimilarTransactions`.
 */
export type SimilarTransactions = {
  count: number
  total: NumberString
  average: NumberString
  /**
   * Dates of the oldest and newest, `null` without any.
   */
  first: string | null
  last: string | null
}

// -------------------------------------------------------
// Profit and loss
// -------------------------------------------------------

export type AccountTransaction = Transaction & { bankAccountId: BankAccountId }

export type ProfitLossAmounts = Pick<ProfitLossRow, 'values' | 'total'>

export type ProfitLossRow = {
  key: string
  label: string
  /**
   * By period key, periods without transactions are missing.
   */
  values: Record<string, NumberString>
  total: NumberString
  children: ProfitLossRow[]
  /**
   * Sums of the incoming and outgoing transactions (not negated), only category rows that have both, e.g. a medical
   * aid payout to a medical expense.
   */
  flows?: { incoming: ProfitLossAmounts; outgoing: ProfitLossAmounts }
  /**
   * Only rows of a single transaction.
   */
  date?: string
}

export type ProfitLoss = {
  currency: Currency
  /**
   * Period keys with transactions (or transfers), oldest first.
   */
  periods: string[]
  income: { rows: ProfitLossRow[]; total: ProfitLossRow }
  expenses: { rows: ProfitLossRow[]; total: ProfitLossRow }
  net: ProfitLossRow
  /**
   * Of the net result, per period (missing without income) and in total.
   */
  netMargin: { values: Record<string, NumberString>; total?: NumberString }
  transfers: { incoming: ProfitLossRow; outgoing: ProfitLossRow; net: ProfitLossRow; count: number }
}

// -------------------------------------------------------
// Date ranges
// -------------------------------------------------------

export type TransactionRangeItem = {
  range: DateRange
  label: string
  transactions: Transaction[]
  /**
   * All its transactions were filtered out by date, shown as a gap.
   */
  isExcluded: boolean
}
