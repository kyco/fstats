import type { TFunction } from 'i18next'
import { mapValues } from 'lodash'

import type {
  CategoryCode,
  CategoryWithTransactions,
  NumberString,
  ParentCategoryCode,
  ParentCategoryWithTransactions,
  SortingPref,
  Transaction,
} from '@/types'
import { ALL_CATEGORIES } from '@/common'
import { getCategoryLabel, getParentCategoryCode } from '@/utils/Category'
import { sumValues } from '@/utils/Stats'
import { Big } from '@/lib/w-big'

export const COL_SPACING = { xs: 1, sm: 2 }
export const COL1 = [4.5, 3]
export const COL2 = [3.2, 3]
export const COL3 = [2.3, 1]
export const COL4 = [2, 5]

export const getTransactionsGroupedByCategory = (
  transactions: Transaction[],
  t: TFunction,
): ParentCategoryWithTransactions[] => {
  const categories: Record<ParentCategoryCode, ParentCategoryWithTransactions> = {}

  Object.values(ALL_CATEGORIES).forEach((category) => {
    const subcategories: Record<CategoryCode, CategoryWithTransactions> = {}
    Object.values(category.subcategories).forEach((subcategory) => {
      subcategories[subcategory.code] = {
        ...subcategory,
        label: getCategoryLabel(subcategory.code, t),
        transactions: [],
        total: '0',
      }
    })

    categories[category.code] = {
      ...category,
      label: getCategoryLabel(category.code, t),
      subcategories,
      transactions: [],
      total: '0',
    }
  })

  transactions.forEach((transaction) => {
    if (!transaction.category) {
      return
    }

    const parentCategory = categories[getParentCategoryCode(transaction.category)]
    if (!parentCategory) {
      console.warn(`Unknown category code "${transaction.category}":`, transaction)
      return
    }
    const category = parentCategory.subcategories[transaction.category]
    if (!category) {
      console.warn(`Unknown category code "${transaction.category}":`, transaction)
      return
    }

    parentCategory.transactions.push(transaction)
    category.transactions.push(transaction)
  })

  return Object.values(categories).map((category) => ({
    ...category,
    total: sumValues(category.transactions).toString(),
    subcategories: mapValues(category.subcategories, (subcategory) => ({
      ...subcategory,
      total: sumValues(subcategory.transactions).toString(),
    })),
  }))
}

const sortByName = (a: string, b: string, dir: 'asc' | 'desc') => {
  return dir === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
}

const sortByTotal = (a: NumberString, b: NumberString, dir: 'asc' | 'desc') => {
  return dir === 'asc' ? Big(a).abs().cmp(Big(b).abs()) : Big(b).abs().cmp(Big(a).abs())
}

export const getSortedCategories = <T extends ParentCategoryWithTransactions | CategoryWithTransactions>(
  items: T[],
  sortingPref: SortingPref,
): T[] => {
  // Always sort alphabetically first to ensure consistent sorting when totals are the same
  return [...items]
    .sort((a, b) => sortByName(a.label, b.label, 'asc'))
    .sort((a, b) => {
      if (sortingPref === 'asc') {
        return sortByName(a.label, b.label, 'asc')
      }
      if (sortingPref === 'desc') {
        return sortByName(a.label, b.label, 'desc')
      }
      if (sortingPref === 'totalAsc') {
        return sortByTotal(a.total, b.total, 'asc')
      }
      if (sortingPref === 'totalDesc') {
        return sortByTotal(a.total, b.total, 'desc')
      }
      return 0
    })
}
