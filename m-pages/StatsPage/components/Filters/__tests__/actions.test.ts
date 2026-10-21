import { describe, expect, it } from 'vitest'

import type { Transaction } from '@/types'
import { getTemplateTree } from '@/m-category/service'
import { NO_CATEGORY } from '@/m-transaction/service'
import { DEFAULT_TEMPLATE_ID } from '@/utils/Category'
import { i18n } from '@/lib/i18n'

import { getCategoryGroups } from '../actions'

const toTransaction = (category: string | null, value = '-1') => ({ category, value }) as Transaction

describe('getCategoryGroups', () => {
  it('should count the categories of the transactions, income and expenses', () => {
    const groups = getCategoryGroups({
      transactions: [
        toTransaction('salary', '1'),
        toTransaction('rent'),
        toTransaction('rent', '1'),
        toTransaction('utilities'),
        toTransaction(null),
      ],
      tree: getTemplateTree(DEFAULT_TEMPLATE_ID),
      t: i18n.t,
    })
    const findParent = (groupIndex: number, key: string) =>
      groups[groupIndex].parents.find((parent) => parent.key === key)

    expect(groups.map((group) => group.key)).toEqual(['in', 'out'])
    expect(findParent(0, 'income')?.count).toBe(1)
    expect(findParent(1, 'housing')?.count).toBe(3)
    // E.g. a refund of an expense
    expect(findParent(1, 'housing')?.inCount).toBe(1)
    expect(findParent(1, 'housing')?.children.find((child) => child.key === 'rent')?.inCount).toBe(1)
    // All children are toggled, also those without transactions
    expect(findParent(1, 'housing')?.children.length).toBeGreaterThan(2)
    expect(findParent(1, 'housing')?.keys).toEqual(findParent(1, 'housing')?.children.map((child) => child.key))
    // A single subcategory is toggled with its parent
    expect(findParent(1, 'transfers')).toMatchObject({ keys: ['transfers_out'], children: [] })
    // Without a category last
    expect(groups[1].parents.at(-1)?.keys).toEqual([NO_CATEGORY])
  })
})
