import { describe, expect, it } from 'vitest'

import type { Transaction } from '@/types'
import { NO_CATEGORY } from '@/m-transaction/service'
import { i18n } from '@/lib/i18n'

import { getCategoryGroups, getCheckState, toggleCategories } from '../actions'

const toTransaction = (category: string | null) => ({ category }) as Transaction

describe('getCategoryGroups', () => {
  it('should count the categories of the transactions, money in and out', () => {
    const groups = getCategoryGroups(['INC_01', 'HOU_01', 'HOU_01', 'HOU_02', null].map(toTransaction), i18n.t)
    const findParent = (groupIndex: number, key: string) =>
      groups[groupIndex].parents.find((parent) => parent.key === key)

    expect(groups.map((group) => group.key)).toEqual(['in', 'out'])
    expect(findParent(0, 'INC')?.count).toBe(1)
    expect(findParent(1, 'HOU')?.count).toBe(3)
    // Only those with transactions are toggled
    expect(findParent(1, 'HOU')?.keys).toEqual(['HOU_01', 'HOU_02'])
    expect(findParent(1, 'HOU')?.children.length).toBeGreaterThan(2)
    // Without a category last
    expect(groups[1].parents.at(-1)?.keys).toEqual([NO_CATEGORY])
  })
})

describe('toggleCategories', () => {
  it('should include all keys if any is excluded, otherwise exclude them', () => {
    const excluded = new Set(['HOU_01', 'INC_01'])

    expect([...toggleCategories(excluded, ['HOU_01', 'HOU_02'])]).toEqual(['INC_01'])
    expect([...toggleCategories(new Set(), ['HOU_01', 'HOU_02'])]).toEqual(['HOU_01', 'HOU_02'])
    expect(getCheckState(excluded, ['HOU_01', 'HOU_02'])).toEqual({ checked: false, indeterminate: true })
  })
})
