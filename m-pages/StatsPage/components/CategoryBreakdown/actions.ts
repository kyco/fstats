import type { TFunction } from 'i18next'

import type {
  CategoryTree,
  CategoryWithTransactions,
  NumberString,
  ParentCategoryWithTransactions,
  SortingPref,
  Transaction,
} from '@/types'
import { CategoryDirection } from '@/types-enums'
import { CATEGORY_COLORS } from '@/common'
import { getCategoryLabel, getParentCategory } from '@/m-category/service'
import { isExpense, sumValues } from '@/utils/Stats'
import { Big } from '@/lib/w-big'

/**
 * Prefix of the groups of transactions without a category, by direction.
 */
const UNCATEGORISED_KEY = 'uncategorised'

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
    id: parent.id,
    label: getCategoryLabel({ id: parent.id, tree, t }),
    color: CATEGORY_COLORS[parent.color],
    direction: parent.direction,
    transactions: [] as Transaction[],
    subcategories: Object.fromEntries(
      parent.children.map((child) => [
        child.id,
        { id: child.id, label: getCategoryLabel({ id: child.id, tree, t }), transactions: [] as Transaction[] },
      ]),
    ),
  }))

  // Transactions without a category, last of their direction
  const uncategorised = [CategoryDirection.IN, CategoryDirection.OUT].map((direction) => {
    const id = `${UNCATEGORISED_KEY}_${direction}`
    const label = getCategoryLabel({ id: null, tree, t })
    return {
      id,
      label,
      color: CATEGORY_COLORS.blueGrey,
      direction,
      transactions: [] as Transaction[],
      subcategories: { [id]: { id, label, transactions: [] as Transaction[] } },
    }
  })

  transactions.forEach((transaction) => {
    const parent = getParentCategory(tree, transaction.category)
    const category = categories.find((other) => other.id === parent?.id)

    if (!category || !transaction.category) {
      const other = uncategorised[isExpense(transaction) ? 1 : 0]
      other.transactions.push(transaction)
      other.subcategories[other.id].transactions.push(transaction)
      return
    }

    category.transactions.push(transaction)
    category.subcategories[transaction.category].transactions.push(transaction)
  })

  return [...categories, ...uncategorised.filter((other) => other.transactions.length)].map((category) => ({
    ...category,
    total: sumValues(category.transactions).toString(),
    subcategories: Object.fromEntries(
      Object.entries(category.subcategories).map(([id, subcategory]) => [
        id,
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
