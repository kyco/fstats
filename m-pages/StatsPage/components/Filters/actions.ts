import type { TFunction } from 'i18next'
import { countBy, sumBy } from 'lodash'

import type { CategoryGroup, CategoryTree, ParentCategoryOption, Transaction } from '@/types'
import { CategoryDirection } from '@/types-enums'
import { getCategoryLabel, getDirectionParents } from '@/m-category/service'
import { getCategoryKey, NO_CATEGORY } from '@/m-transaction/service'
import { isIncome } from '@/utils/Stats'

type ToParentOptionsProps = {
  tree: CategoryTree
  direction: CategoryDirection
  counts: Record<string, number>
  inCounts: Record<string, number>
  t: TFunction
}

const toParentOptions = ({ tree, direction, counts, inCounts, t }: ToParentOptionsProps): ParentCategoryOption[] => {
  return getDirectionParents(tree, direction).map((parent) => {
    const children = parent.children.map((category) => ({
      key: category.code,
      label: getCategoryLabel({ code: category.code, tree, t }),
      count: counts[category.code] ?? 0,
      inCount: inCounts[category.code] ?? 0,
    }))

    return {
      key: parent.code,
      label: getCategoryLabel({ code: parent.code, tree, t }),
      count: sumBy(children, 'count'),
      inCount: sumBy(children, 'inCount'),
      keys: children.map((child) => child.key),
      // A single subcategory (e.g. "Uncategorised") is toggled with its parent, without expanding it
      children: children.length > 1 ? children : [],
    }
  })
}

type GetCategoryGroupsProps = {
  transactions: Transaction[]
  /**
   * Of the active rule set.
   */
  tree: CategoryTree
  t: TFunction
}

/**
 * All categories with their number of transactions, income and expenses, those without transactions are disabled.
 * Transactions without a (known) category are last in expenses.
 */
export const getCategoryGroups = ({ transactions, tree, t }: GetCategoryGroupsProps): CategoryGroup[] => {
  const counts = countBy(transactions, getCategoryKey)
  const inCounts = countBy(transactions.filter(isIncome), getCategoryKey)
  const otherOptions = Object.keys(counts)
    .filter((key) => !tree.categoriesByCode.has(key))
    .map((key) => ({
      key,
      label: getCategoryLabel({ code: key === NO_CATEGORY ? null : key, tree, t }),
      count: counts[key],
      inCount: inCounts[key] ?? 0,
      keys: [key],
      children: [],
    }))

  return [
    {
      key: 'in',
      label: t('MISC.INCOME'),
      parents: toParentOptions({ tree, direction: CategoryDirection.IN, counts, inCounts, t }),
    },
    {
      key: 'out',
      label: t('MISC.EXPENSES'),
      parents: [...toParentOptions({ tree, direction: CategoryDirection.OUT, counts, inCounts, t }), ...otherOptions],
    },
  ]
}
