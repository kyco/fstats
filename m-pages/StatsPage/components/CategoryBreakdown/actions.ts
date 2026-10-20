import type { TFunction } from 'i18next'

import type {
  CategoryTree,
  CategoryWithTransactions,
  NumberString,
  ParentCategoryWithTransactions,
  SortingPref,
  Transaction,
} from '@/types'
import { CATEGORY_COLORS } from '@/common'
import { getCategoryLabel, getParentCategory } from '@/m-category/service'
import { sumValues } from '@/utils/Stats'
import { Big } from '@/lib/w-big'

export const COL_SPACING = { xs: 1, sm: 2 }
export const COL1 = [4.5, 3]
export const COL2 = [3.2, 3]
export const COL3 = [2.3, 1]
export const COL4 = [2, 5]

type GetTransactionsGroupedByCategoryProps = {
  transactions: Transaction[]
  /**
   * Of the active rule set, transactions of other categories are skipped.
   */
  tree: CategoryTree
  t: TFunction
}

export const getTransactionsGroupedByCategory = ({
  transactions,
  tree,
  t,
}: GetTransactionsGroupedByCategoryProps): ParentCategoryWithTransactions[] => {
  const categories = tree.parents.map((parent) => ({
    code: parent.code,
    label: getCategoryLabel({ code: parent.code, tree, t }),
    color: CATEGORY_COLORS[parent.color],
    direction: parent.direction,
    transactions: [] as Transaction[],
    subcategories: Object.fromEntries(
      parent.children.map((child) => [
        child.code,
        { code: child.code, label: getCategoryLabel({ code: child.code, tree, t }), transactions: [] as Transaction[] },
      ]),
    ),
  }))

  transactions.forEach((transaction) => {
    const parent = getParentCategory(tree, transaction.category)
    const category = categories.find((other) => other.code === parent?.code)

    if (!category || !transaction.category) {
      return
    }

    category.transactions.push(transaction)
    category.subcategories[transaction.category].transactions.push(transaction)
  })

  return categories.map((category) => ({
    ...category,
    total: sumValues(category.transactions).toString(),
    subcategories: Object.fromEntries(
      Object.entries(category.subcategories).map(([code, subcategory]) => [
        code,
        { ...subcategory, total: sumValues(subcategory.transactions).toString() },
      ]),
    ),
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
