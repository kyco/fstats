import type { TFunction } from 'i18next'
import { countBy, sumBy } from 'lodash'

import type { CategoryGroup, ParentCategory, ParentCategoryCode, ParentCategoryOption, Transaction } from '@/types'
import { ALL_CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/common'
import { getCategoryKey, NO_CATEGORY } from '@/m-transaction/service'
import { getCategoryLabel } from '@/utils/Category'

const KNOWN_KEYS = new Set(Object.values(ALL_CATEGORIES).flatMap((parent) => Object.keys(parent.subcategories)))

type ToParentOptionsProps = {
  categories: Record<ParentCategoryCode, ParentCategory>
  counts: Record<string, number>
  t: TFunction
}

const toParentOptions = ({ categories, counts, t }: ToParentOptionsProps): ParentCategoryOption[] => {
  return Object.values(categories).map((parent) => {
    const children = Object.values(parent.subcategories).map((category) => ({
      key: category.code,
      label: getCategoryLabel(category.code, t),
      count: counts[category.code] ?? 0,
    }))

    return {
      key: parent.code,
      label: getCategoryLabel(parent.code, t),
      count: sumBy(children, 'count'),
      keys: children.map((child) => child.key),
      children,
    }
  })
}

/**
 * All categories with their number of transactions, income and expenses, those without transactions are disabled.
 * Transactions without a (known) category are last in expenses.
 */
export const getCategoryGroups = (transactions: Transaction[], t: TFunction): CategoryGroup[] => {
  const counts = countBy(transactions, getCategoryKey)
  const otherOptions = Object.keys(counts)
    .filter((key) => !KNOWN_KEYS.has(key))
    .map((key) => ({
      key,
      label: getCategoryLabel(key === NO_CATEGORY ? null : key, t),
      count: counts[key],
      keys: [key],
      children: [],
    }))

  return [
    {
      key: 'in',
      label: t('MISC.INCOME'),
      parents: toParentOptions({ categories: INCOME_CATEGORIES, counts, t }),
    },
    {
      key: 'out',
      label: t('MISC.EXPENSES'),
      parents: [...toParentOptions({ categories: EXPENSE_CATEGORIES, counts, t }), ...otherOptions],
    },
  ]
}
