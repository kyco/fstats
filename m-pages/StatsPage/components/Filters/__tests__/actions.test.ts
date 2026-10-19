import { describe, expect, it } from 'vitest'

import type { Transaction } from '@/types'
import { NO_CATEGORY } from '@/m-transaction/service'
import { i18n } from '@/lib/i18n'

import { getCategoryGroups } from '../actions'

const toTransaction = (category: string | null, value = '-1') => ({ category, value }) as Transaction

describe('getCategoryGroups', () => {
  it('should count the categories of the transactions, income and expenses', () => {
    const groups = getCategoryGroups(
      [
        toTransaction('INC_01', '1'),
        toTransaction('HOU_01'),
        toTransaction('HOU_01', '1'),
        toTransaction('HOU_02'),
        toTransaction(null),
      ],
      i18n.t,
    )
    const findParent = (groupIndex: number, key: string) =>
      groups[groupIndex].parents.find((parent) => parent.key === key)

    expect(groups.map((group) => group.key)).toEqual(['in', 'out'])
    expect(findParent(0, 'INC')?.count).toBe(1)
    expect(findParent(1, 'HOU')?.count).toBe(3)
    // E.g. a refund of an expense
    expect(findParent(1, 'HOU')?.inCount).toBe(1)
    expect(findParent(1, 'HOU')?.children.find((child) => child.key === 'HOU_01')?.inCount).toBe(1)
    // All children are toggled, also those without transactions
    expect(findParent(1, 'HOU')?.children.length).toBeGreaterThan(2)
    expect(findParent(1, 'HOU')?.keys).toEqual(findParent(1, 'HOU')?.children.map((child) => child.key))
    // Without a category last
    expect(groups[1].parents.at(-1)?.keys).toEqual([NO_CATEGORY])
  })
})
