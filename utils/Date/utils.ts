import { format, isValid, parse, parseISO, startOfDay } from 'date-fns'
import type { Locale } from 'date-fns'
import { de, enGB } from 'date-fns/locale'

import type { SelectOptionWithType, Transaction } from '@/types'
import { DateFormat, SortOrder, UserLocale } from '@/types-enums'

type ToDisplayDateProps = {
  date: Date | string
  locale: UserLocale
  formatTo: string
  formatFrom?: string
}

/**
 * Date strings are parsed with `formatFrom`, ISO by default.
 */
export const toDisplayDate = ({ date, locale, formatTo, formatFrom }: ToDisplayDateProps): string => {
  const dateObject = date instanceof Date ? date : toDate(date, { formatFrom })

  if (!isValid(dateObject)) {
    throw new Error('Invalid date')
  }

  return format(dateObject, formatTo, { locale: getDateFnsLocale(locale) })
}

type ToDateProps = {
  formatFrom?: string
}

/**
 * Parsed with `options.formatFrom`, ISO by default.
 */
export const toDate = (date: string, options?: ToDateProps): Date => {
  const dateObject = options?.formatFrom ? parse(date, options.formatFrom, new Date()) : parseISO(date)

  if (!isValid(dateObject)) {
    throw new Error('Invalid date')
  }

  return dateObject
}

export const getDateFormatSelectOptions = (locale: UserLocale): SelectOptionWithType<DateFormat>[] => {
  return Object.entries(DateFormat).map(([, value]) => {
    return {
      value,
      label: toDisplayDate({ date: new Date(), locale, formatTo: value }),
    }
  })
}

const getDateFnsLocale = (locale: UserLocale): Locale => {
  switch (locale) {
    // @locale-updates
    case UserLocale.EN:
      return enGB
    case UserLocale.DE:
      return de
    default:
      throw new Error(`Unsupported locale: ${locale}`)
  }
}

type GetUniqueTimestampsProps = {
  dates: Date[]
  dateFormat: string
  sortOrder: SortOrder
}

/**
 * Spreads dates that share a timestamp (a day, for formats without time) one second apart, keeping their order.
 * Dates from formats with seconds are returned unchanged, so duplicates there stay.
 */
export const getUniqueTimestamps = ({ dates, dateFormat, sortOrder }: GetUniqueTimestampsProps): Date[] => {
  const { hasTime, hasSeconds } = getDateFormatPrecision(dateFormat)

  if (hasTime && hasSeconds) {
    return dates
  }

  return attachUniqueSecondsToDates({
    dates,
    sortOrder,
    getBaseTimestamp: (date) => (hasTime ? date : startOfDay(date)).getTime(),
  })
}

type AttachUniqueSecondsToDatesProps = {
  dates: Date[]
  sortOrder: SortOrder
  getBaseTimestamp: (date: Date) => number
}

const attachUniqueSecondsToDates = ({
  dates,
  sortOrder,
  getBaseTimestamp,
}: AttachUniqueSecondsToDatesProps): Date[] => {
  const totalByGroup = new Map<number, number>()
  const seenByGroup = new Map<number, number>()

  dates.forEach((date) => {
    const groupKey = getBaseTimestamp(date)
    totalByGroup.set(groupKey, (totalByGroup.get(groupKey) ?? 0) + 1)
  })

  return dates.map((date) => {
    const groupKey = getBaseTimestamp(date)
    const seen = seenByGroup.get(groupKey) ?? 0
    const total = totalByGroup.get(groupKey) ?? 1
    const secondOffset = sortOrder === SortOrder.ASC ? seen : total - seen - 1

    seenByGroup.set(groupKey, seen + 1)

    return new Date(groupKey + secondOffset * 1000)
  })
}

const getDateFormatPrecision = (
  dateFormat: string,
): {
  hasTime: boolean
  hasSeconds: boolean
} => {
  const hasHours = /[HhKk]/.test(dateFormat)
  const hasMinutes = /m/.test(dateFormat)
  const hasSeconds = /s/.test(dateFormat)

  return {
    hasTime: hasHours || hasMinutes || hasSeconds,
    hasSeconds,
  }
}

/**
 * Day (`yyyy-MM-dd`) of a transaction as it was parsed, ignoring time zones.
 */
export const getTransactionDay = (transaction: Pick<Transaction, 'date'>) => {
  return transaction.date.split('T')[0]
}

/**
 * Day (`yyyy-MM-dd`) of a date, same format as `getTransactionDay`.
 */
export const toDayKey = (date: Date) => {
  return format(date, 'yyyy-MM-dd')
}
