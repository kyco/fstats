import { differenceInCalendarDays, eachDayOfInterval, parseISO, startOfMonth, startOfWeek } from 'date-fns'

import type { DateRange, Transaction, TransactionRangeItem } from '@/types'
import { DateFormat, UserLocale } from '@/types-enums'
import { groupInOrder } from '@/utils/Array'
import { getTransactionDay, toDayKey, toDisplayDate } from '@/utils/Date'

export const RangeGranularity = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
} as const

export type RangeGranularity = (typeof RangeGranularity)[keyof typeof RangeGranularity]

/**
 * Days up to about 3 months, weeks up to 2 years, months beyond, so long ranges have fewer, more readable points.
 */
export const getRangeGranularity = ({ start, end }: DateRange): RangeGranularity => {
  const dayCount = differenceInCalendarDays(end, start) + 1
  return dayCount <= 92 ? RangeGranularity.DAY : dayCount <= 730 ? RangeGranularity.WEEK : RangeGranularity.MONTH
}

/**
 * From the first to the last of the sorted transactions.
 */
export const getTransactionsDateRange = (transactions: Transaction[]): DateRange => {
  return { start: parseISO(transactions[0].date), end: parseISO(transactions[transactions.length - 1].date) }
}

const getBucketStart = (day: Date, granularity: RangeGranularity) => {
  switch (granularity) {
    case RangeGranularity.WEEK:
      return startOfWeek(day, { weekStartsOn: 1 })
    case RangeGranularity.MONTH:
      return startOfMonth(day)
    default:
      return day
  }
}

type GetTransactionRangeItemsProps = {
  dateRange: DateRange
  transactions: Transaction[]
  locale: UserLocale
  dateFormat: DateFormat
  /**
   * Days (`yyyy-MM-dd`) whose transactions were filtered out, items without any other transactions are excluded.
   */
  excludedDays?: Set<string>
  /**
   * By default based on the length of the range.
   */
  granularity?: RangeGranularity
}

/**
 * One item per day, week or month in the range (including those without transactions), see `getRangeGranularity`.
 */
export const getTransactionRangeItems = ({
  dateRange,
  transactions,
  locale,
  dateFormat,
  excludedDays = new Set(),
  granularity = getRangeGranularity(dateRange),
}: GetTransactionRangeItemsProps): TransactionRangeItem[] => {
  const transactionsByDay = groupInOrder(transactions, getTransactionDay)
  const daysByBucket = groupInOrder(eachDayOfInterval(dateRange), (day) => toDayKey(getBucketStart(day, granularity)))

  return [...daysByBucket.values()].map((days) => {
    const dayKeys = days.map(toDayKey)
    const bucketTransactions = dayKeys.flatMap((day) => transactionsByDay.get(day) ?? [])

    return {
      range: { start: days[0], end: days[days.length - 1] },
      label: toDisplayDate({
        date: days[0],
        locale,
        formatTo: granularity === RangeGranularity.MONTH ? 'MMM yyyy' : dateFormat,
      }),
      transactions: bucketTransactions,
      // Shown as a gap rather than as a period without transactions
      isExcluded: !bucketTransactions.length && dayKeys.some((day) => excludedDays.has(day)),
    }
  })
}

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
