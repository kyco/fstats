import { describe, expect, it } from 'vitest'

import type { ParsedStatsFile, Transaction } from '@/types'
import { AmountFilter, StatsFileStatus } from '@/types-enums'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/common'

import {
  filterTransactions,
  getCheckedTransactions,
  getDirection,
  getDuplicates,
  getStatsTransactions,
  getTransactionCounts,
  NO_CATEGORY,
  toAmountFilter,
} from '..'

const toTransaction = (date: string, value: string, category: string | null = null) =>
  ({ id: `${date}-${value}`, date, value, category, currency: 'EUR' }) as Transaction

const toFilter = (excludedCategories: string[] = [], amount: AmountFilter = AmountFilter.ALL) => ({
  amount,
  excludedCategories: new Set(excludedCategories),
})

const toFile = (id: string, transactions: Transaction[]) =>
  ({
    id,
    status: StatsFileStatus.PARSED,
    sections: [{ parserId: 'ing__giro', transactions }],
  }) as unknown as ParsedStatsFile

const fileA = toFile('a', [
  toTransaction('2026-01-01T00:00:00+00:00', '10'),
  toTransaction('2026-01-02T00:00:00+00:00', '-5'),
])
const fileB = toFile('b', [toTransaction('2026-01-02T00:00:00+00:00', '-3')])
describe('getStatsTransactions', () => {
  it('should remove duplicates and the transactions on deselected days and count them', () => {
    const overlapping = toFile('d', [toTransaction('2026-01-02T00:00:00+00:00', '-5')])
    const checked = getCheckedTransactions([fileA, fileB, overlapping])
    const stats = getStatsTransactions(checked, new Set(['2026-01-02', '2025-12-31']))

    expect(stats.all).toHaveLength(4)
    expect(stats.unique).toHaveLength(3)
    expect(stats.duplicates).toEqual(new Set(overlapping.sections[0].transactions))
    expect(stats.shown).toEqual([fileA.sections[0].transactions[0]])
    // Only days of the files count, not stale ones
    expect(stats.excludedDayCount).toBe(1)
    expect(stats.byCurrency.EUR?.shown).toEqual(stats.shown)
    expect(stats.count(stats.all)).toEqual({ count: 1, dateExcludedCount: 2, duplicateCount: 0 })
  })

  it('should keep the transactions as they are without deselected days', () => {
    const checked = getCheckedTransactions([fileA])
    expect(getStatsTransactions(checked, new Set()).shown).toBe(checked.unique)
  })
})

describe('getTransactionCounts', () => {
  it('should count duplicates of earlier files in a later file', () => {
    const overlapping = toFile('d', [
      toTransaction('2026-01-02T00:00:00+00:00', '-5'),
      toTransaction('2026-01-03T00:00:00+00:00', '7'),
    ])
    const transactions = overlapping.sections[0].transactions
    const duplicates = getDuplicates([fileA, overlapping].flatMap((file) => file.sections[0].transactions))

    // On its own, the file has no duplicates
    expect(getTransactionCounts({ transactions, deselectedDays: new Set() })).toEqual({
      count: 2,
      dateExcludedCount: 0,
      duplicateCount: 0,
    })
    expect(getTransactionCounts({ transactions, deselectedDays: new Set(), duplicates })).toEqual({
      count: 1,
      dateExcludedCount: 0,
      duplicateCount: 1,
    })
    expect(
      getTransactionCounts({ transactions: fileA.sections[0].transactions, deselectedDays: new Set(), duplicates })
        .duplicateCount,
    ).toBe(0)
  })
})

describe('filterTransactions', () => {
  it('should filter by amount and excluded categories', () => {
    const transactions = [
      toTransaction('2026-01-01T00:00:00+00:00', '10', 'INC_01'),
      toTransaction('2026-01-02T00:00:00+00:00', '-5', 'HOU_01'),
      toTransaction('2026-01-03T00:00:00+00:00', '-3'),
    ]

    expect(filterTransactions(transactions, toFilter(['HOU_01']))).toEqual([transactions[0], transactions[2]])
    expect(filterTransactions(transactions, toFilter([NO_CATEGORY]))).toEqual([transactions[0], transactions[1]])
    expect(filterTransactions(transactions, toFilter([NO_CATEGORY], AmountFilter.OUT))).toEqual([transactions[1]])
    expect(filterTransactions(transactions, toFilter([], AmountFilter.NONE))).toEqual([])
  })

  it('should combine the shown money in and out', () => {
    expect(toAmountFilter(true, true)).toBe(AmountFilter.ALL)
    expect(toAmountFilter(true, false)).toBe(AmountFilter.IN)
    expect(toAmountFilter(false, true)).toBe(AmountFilter.OUT)
    expect(toAmountFilter(false, false)).toBe(AmountFilter.NONE)
  })
})

describe('getDirection', () => {
  const incomeKeys = Object.values(INCOME_CATEGORIES).flatMap((parent) => Object.keys(parent.subcategories))
  const expenseKeys = [
    ...Object.values(EXPENSE_CATEGORIES).flatMap((parent) => Object.keys(parent.subcategories)),
    NO_CATEGORY,
  ]

  it('should follow the type of the excluded categories', () => {
    expect(getDirection(new Set())).toBe(AmountFilter.ALL)
    expect(getDirection(new Set(['HOU_01']))).toBe(AmountFilter.ALL)
    expect(getDirection(new Set(incomeKeys))).toBe(AmountFilter.OUT)
    expect(getDirection(new Set(expenseKeys))).toBe(AmountFilter.IN)
    expect(getDirection(new Set([...incomeKeys, ...expenseKeys]))).toBeNull()
  })
})
