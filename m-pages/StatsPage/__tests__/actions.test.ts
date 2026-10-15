import { describe, expect, it } from 'vitest'

import type { Transaction } from '@/types'
import { AmountFilter, EmptyReason } from '@/types-enums'
import { NO_CATEGORY } from '@/m-transaction/service'

import { getEmptyReason } from '../actions'

const toFilter = (amount: AmountFilter, excludedCategories: string[] = []) => ({
  amount,
  excludedCategories: new Set(excludedCategories),
})

describe('getEmptyReason', () => {
  const all = [
    { id: 'a', date: '2026-01-02T00:00:00+00:00', value: '-3', category: null, currency: 'EUR' } as Transaction,
  ]
  const toInput = (transactions?: Parameters<typeof getEmptyReason>[0]['transactions']) => ({
    fileCount: 2,
    checkedCount: 1,
    transactions,
  })

  it('should tell missing files and selections apart', () => {
    expect(getEmptyReason({ fileCount: 0, checkedCount: 0 })).toBe(EmptyReason.NO_FILES)
    expect(getEmptyReason({ fileCount: 2, checkedCount: 0, transactions: { all, shown: all } })).toBe(
      EmptyReason.NO_SELECTION,
    )
    expect(getEmptyReason(toInput())).toBeNull()
  })

  it('should tell checked files without transactions apart, unless the view shows them', () => {
    expect(getEmptyReason(toInput({ all: [], shown: [] }))).toBe(EmptyReason.NO_TRANSACTIONS)
    expect(getEmptyReason(toInput({ all: [], shown: [], allowEmpty: true }))).toBeNull()
  })

  it('should tell deselected days from filters without matches', () => {
    expect(getEmptyReason(toInput({ all, shown: [], filter: toFilter(AmountFilter.ALL) }))).toBe(EmptyReason.NO_DATES)
    expect(getEmptyReason(toInput({ all, shown: all, filter: toFilter(AmountFilter.IN) }))).toBe(EmptyReason.NO_MATCHES)
    expect(getEmptyReason(toInput({ all, shown: all, filter: toFilter(AmountFilter.OUT) }))).toBeNull()
    expect(getEmptyReason(toInput({ all, shown: all, filter: toFilter(AmountFilter.OUT, [NO_CATEGORY]) }))).toBe(
      EmptyReason.NO_MATCHES,
    )
    expect(getEmptyReason(toInput({ all, shown: all }))).toBeNull()
  })
})
