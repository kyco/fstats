import { groupBy, mapValues, uniq } from 'lodash'

import type {
  CategoryTree,
  CheckedTransactions,
  ParsedStatsFile,
  SourcedTransaction,
  StatsTransactions,
  Transaction,
  TransactionCounts,
  TransactionFilter,
} from '@/types'
import type { Currency } from '@/types-enums'
import { AmountFilter, CategoryDirection } from '@/types-enums'
import { getDirectionParents } from '@/m-category/service'
import { getFileCurrency, getFileTransactions } from '@/m-stats-file/service'
import { getTransactionDay } from '@/utils/Date'
import { isExpense, isIncome } from '@/utils/Stats'

/**
 * Category filter key of transactions without a category.
 */
export const NO_CATEGORY = 'none'

export const getCategoryKey = (transaction: Transaction) => {
  return transaction.category ?? NO_CATEGORY
}

export const filterAmount = <T extends Transaction>(transactions: T[], filter: AmountFilter) => {
  switch (filter) {
    case AmountFilter.IN:
      return transactions.filter(isIncome)
    case AmountFilter.OUT:
      return transactions.filter(isExpense)
    case AmountFilter.NONE:
      return []
    default:
      return transactions
  }
}

/**
 * The amount filter of money in and out being shown.
 */
export const toAmountFilter = (isInShown: boolean, isOutShown: boolean): AmountFilter => {
  if (isInShown && isOutShown) {
    return AmountFilter.ALL
  }

  return isInShown ? AmountFilter.IN : isOutShown ? AmountFilter.OUT : AmountFilter.NONE
}

export const filterTransactions = <T extends Transaction>(
  transactions: T[],
  { amount, excludedCategories }: TransactionFilter,
) => {
  const amountTransactions = filterAmount(transactions, amount)
  return excludedCategories.size
    ? amountTransactions.filter((transaction) => !excludedCategories.has(getCategoryKey(transaction)))
    : amountTransactions
}

type IsAllExcludedProps = {
  excludedCategories: Set<string>
  tree: CategoryTree
  direction: CategoryDirection
}

/**
 * Whether all categories of the direction (and transactions without a category for expenses, like the filters) are
 * excluded.
 */
const isAllExcluded = ({ excludedCategories, tree, direction }: IsAllExcludedProps) => {
  const keys = [
    ...getDirectionParents(tree, direction).flatMap((parent) => parent.children.map((child) => child.id)),
    ...(direction === CategoryDirection.OUT ? [NO_CATEGORY] : []),
  ]
  return keys.every((key) => excludedCategories.has(key))
}

/**
 * Direction shown by the category filter: income or expenses when all categories of the other are excluded, all when
 * neither, `null` when both.
 */
export const getDirection = (excludedCategories: Set<string>, tree: CategoryTree): AmountFilter | null => {
  const isInExcluded = isAllExcluded({ excludedCategories, tree, direction: CategoryDirection.IN })
  const isOutExcluded = isAllExcluded({ excludedCategories, tree, direction: CategoryDirection.OUT })

  if (isInExcluded && isOutExcluded) {
    return null
  }

  return isOutExcluded ? AmountFilter.IN : isInExcluded ? AmountFilter.OUT : AmountFilter.ALL
}

/**
 * Transactions without those on the deselected days of the date explorer.
 */
export const filterDays = <T extends Transaction>(transactions: T[], deselectedDays: Set<string>) => {
  return deselectedDays.size
    ? transactions.filter((transaction) => !deselectedDays.has(getTransactionDay(transaction)))
    : transactions
}

/**
 * Currencies of the transactions matching the filter, in order.
 */
export const getFilteredCurrencies = (transactions: Transaction[], filter: TransactionFilter) => {
  return uniq(filterTransactions(transactions, filter).map((transaction) => transaction.currency))
}

/**
 * Transactions that are also earlier in the list (e.g. in an earlier file with overlapping statements), by reference.
 * IDs are content hashes, so identical transactions are duplicates. Determined across all checked files, so the stats
 * of a single file agree with the totals.
 */
export const getDuplicates = <T extends Transaction>(transactions: T[]) => {
  const seenIds = new Set<string>()
  const duplicates = new Set<T>()

  transactions.forEach((transaction) => {
    if (seenIds.has(transaction.id)) {
      duplicates.add(transaction)
    } else {
      seenIds.add(transaction.id)
    }
  })

  return duplicates
}

export const withoutDuplicates = (transactions: Transaction[], duplicates: Set<Transaction>) => {
  return transactions.filter((transaction) => !duplicates.has(transaction))
}

/**
 * Files per currency, as amounts in different currencies can't be summed up. Only for tables listing the source files,
 * otherwise see `StatsTransactions.byCurrency`.
 */
// TODO: Once we have currency conversion logic, convert files with different currencies
export const groupFilesByCurrency = (files: ParsedStatsFile[]) => {
  return groupBy(files, getFileCurrency) as Record<Currency, ParsedStatsFile[]>
}

type GetTransactionCountsProps = {
  transactions: Transaction[]
  deselectedDays: Set<string>
  duplicates?: Set<Transaction>
}

/**
 * Counts of the transactions (before the date explorer), the same wherever a transaction count is shown. Duplicates
 * and transactions on deselected days are never counted, also when shown in the transactions table.
 */
export const getTransactionCounts = ({
  transactions,
  deselectedDays,
  duplicates = getDuplicates(transactions),
}: GetTransactionCountsProps): TransactionCounts => {
  const unique = withoutDuplicates(transactions, duplicates)
  const isOnSelectedDay = (transaction: Transaction) => !deselectedDays.has(getTransactionDay(transaction))
  const count = unique.filter(isOnSelectedDay).length

  return {
    count,
    dateExcludedCount: unique.length - count,
    duplicateCount: transactions.filter((transaction) => duplicates.has(transaction) && isOnSelectedDay(transaction))
      .length,
  }
}

export const getCheckedTransactions = (files: ParsedStatsFile[]): CheckedTransactions => {
  const all = files.flatMap(getFileTransactions)
  const duplicates = getDuplicates(all)

  return {
    all,
    unique: withoutDuplicates(all, duplicates),
    duplicates,
    byCurrency: mapValues(groupFilesByCurrency(files), (currencyFiles) => {
      const currencyAll = currencyFiles.flatMap(getFileTransactions)
      return { all: currencyAll, unique: withoutDuplicates(currencyAll, duplicates) }
    }),
  }
}

export const getStatsTransactions = (
  { all, unique, duplicates, byCurrency }: CheckedTransactions,
  deselectedDays: Set<string>,
): StatsTransactions => {
  const days = new Set(all.map(getTransactionDay))

  return {
    all,
    unique,
    shown: filterDays(unique, deselectedDays),
    duplicates,
    deselectedDays,
    excludedDayCount: [...days].filter((day) => deselectedDays.has(day)).length,
    byCurrency: mapValues(byCurrency, (transactions) => ({
      ...transactions!,
      shown: filterDays(transactions!.unique, deselectedDays),
    })),
    count: (transactions) => getTransactionCounts({ transactions, deselectedDays, duplicates }),
  }
}

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

/**
 * Newest first, stable (the order is kept for equal dates). Sorts in place.
 */
export const sortNewestFirst = <T extends Pick<Transaction, 'date'>>(transactions: T[]) => {
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Transactions of all files in a single list, newest first like the date explorer. Stable, so the order of files is
 * kept for equal dates. The first occurrence of a transaction in multiple files is the original, the others are
 * duplicates.
 */
export const getSourcedTransactions = (files: ParsedStatsFile[]): SourcedTransaction[] => {
  const transactions = files.flatMap((file) =>
    getFileTransactions(file).map((transaction) => ({ ...transaction, source: file.file.name })),
  )
  const duplicates = getDuplicates(transactions)
  const sourcesById = groupBy(transactions, 'id')

  return sortNewestFirst(
    transactions.map((transaction) => ({
      ...transaction,
      sources: sourcesById[transaction.id].map(({ source }) => source),
      isDuplicate: duplicates.has(transaction),
    })),
  )
}
