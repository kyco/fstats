import type { TFunction } from 'i18next'
import { countBy, sumBy } from 'lodash'
import type { KeyboardEvent } from 'react'

import type { CategoryGroup, ParentCategory, ParentCategoryCode, ParentCategoryOption, Transaction } from '@/types'
import { ALL_CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/common'
import { getCategoryLabel } from '@/utils/Category'

import { getCategoryKey, NO_CATEGORY } from '../../actions'

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
      keys: children.filter((child) => child.count).map((child) => child.key),
      children,
    }
  })
}

/**
 * All categories with their number of transactions, money in and out, those without transactions are disabled.
 * Transactions without a (known) category are last in money out.
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
      label: t('STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.IN_TITLE'),
      parents: toParentOptions({ categories: INCOME_CATEGORIES, counts, t }),
    },
    {
      key: 'out',
      label: t('STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.OUT_TITLE'),
      parents: [...toParentOptions({ categories: EXPENSE_CATEGORIES, counts, t }), ...otherOptions],
    },
  ]
}

/**
 * Checked when none of the keys are excluded, indeterminate when some are.
 */
export const getCheckState = (excluded: Set<string>, keys: string[]) => {
  const excludedCount = keys.filter((key) => excluded.has(key)).length
  return { checked: !excludedCount, indeterminate: excludedCount > 0 && excludedCount < keys.length }
}

/**
 * Includes all keys if any is excluded, otherwise excludes them.
 */
export const toggleCategories = (excluded: Set<string>, keys: string[]) => {
  const isIncluding = keys.some((key) => excluded.has(key))
  const next = new Set(excluded)
  keys.forEach((key) => (isIncluding ? next.delete(key) : next.add(key)))
  return next
}

// Rows are buttons, like the rows of the date explorer
export const onRowKeyDown = (event: KeyboardEvent<HTMLElement>) => {
  if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    event.currentTarget.click()
  }
}
