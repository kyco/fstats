import { describe, expect, it } from 'vitest'

import type { Transaction } from '@/types'
import { DateFormat, UserLocale } from '@/types-enums'

import { getRangeGranularity, getTransactionRangeItems, RangeGranularity } from '../range'

const toTransaction = (day: string) => ({ date: `${day}T00:00:00+00:00`, value: '1' }) as Transaction

const getItems = (start: string, end: string, days: string[], excludedDays: string[] = []) => {
  return getTransactionRangeItems({
    dateRange: { start: new Date(`${start}T00:00:00`), end: new Date(`${end}T00:00:00`) },
    transactions: days.map(toTransaction),
    locale: UserLocale.EN,
    dateFormat: DateFormat.YMD_DASH,
    excludedDays: new Set(excludedDays),
  })
}

describe('getRangeGranularity', () => {
  it('should use days up to 3 months, weeks up to 2 years and months beyond', () => {
    const toRange = (start: string, end: string) => ({ start: new Date(start), end: new Date(end) })

    expect(getRangeGranularity(toRange('2026-01-01', '2026-04-02'))).toBe(RangeGranularity.DAY)
    expect(getRangeGranularity(toRange('2026-01-01', '2026-04-03'))).toBe(RangeGranularity.WEEK)
    expect(getRangeGranularity(toRange('2024-01-01', '2025-12-30'))).toBe(RangeGranularity.WEEK)
    expect(getRangeGranularity(toRange('2024-01-01', '2026-01-01'))).toBe(RangeGranularity.MONTH)
  })
})

describe('getTransactionRangeItems', () => {
  it('should mark days excluded by date as gaps, but not days without transactions', () => {
    const items = getItems('2026-01-01', '2026-01-04', ['2026-01-01', '2026-01-04'], ['2026-01-02'])

    expect(items.map((item) => [item.label, item.transactions.length, item.isExcluded])).toEqual([
      ['2026-01-01', 1, false],
      ['2026-01-02', 0, true],
      ['2026-01-03', 0, false],
      ['2026-01-04', 1, false],
    ])
  })

  it('should group long ranges by month, a month is only excluded without other transactions', () => {
    const items = getItems(
      '2024-01-15',
      '2026-03-10',
      ['2024-01-15', '2024-02-10', '2026-03-10'],
      ['2024-02-20', '2024-03-05'],
    )

    expect(items).toHaveLength(27)
    expect(items.slice(0, 3).map((item) => [item.label, item.transactions.length, item.isExcluded])).toEqual([
      ['Jan 2024', 1, false],
      ['Feb 2024', 1, false],
      ['Mar 2024', 0, true],
    ])
  })
})
