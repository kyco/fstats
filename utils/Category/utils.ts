import type { TFunction } from 'i18next'

import type { CategoryCode, ParentCategoryCode, Transaction } from '@/types'
import { isExpense } from '@/utils/Stats'

/**
 * Category of transactions no rule matches, by direction. Zero amounts are income.
 */
export const getUncategorisedCode = (row: Pick<Transaction, 'value'>): CategoryCode => {
  return isExpense(row) ? 'TFO_02' : 'TFI_02'
}

const UNCATEGORISED_CODES: CategoryCode[] = ['TFI_02', 'TFO_02']

export const isUncategorisedCode = (code: CategoryCode | null) => {
  return !code || UNCATEGORISED_CODES.includes(code)
}

/**
 * Translated label of a (parent) category, the code itself when unknown.
 */
export const getCategoryLabel = (code: CategoryCode | ParentCategoryCode | null, t: TFunction): string => {
  return t(code ?? 'UNCATEGORISED', { ns: 'categories' })
}

/**
 * E.g. "INC" for "INC_01"
 */
export const getParentCategoryCode = (code: CategoryCode): ParentCategoryCode => {
  return code.split('_')[0]
}
