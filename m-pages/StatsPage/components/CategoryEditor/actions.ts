import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import type { TFunction } from 'i18next'

import type {
  CategoryEngine,
  CategoryRuleDraft,
  CategoryTree,
  MenuSelectOption,
  ResolvedCategory,
  Transaction,
} from '@/types'
import { CategoryDirection, CategoryRuleField, CategorySource } from '@/types-enums'
import {
  compileRule,
  getCategoryLabel,
  getDirectionParents,
  getRuleRef,
  matchesRule,
  recogniseTransaction,
} from '@/m-category/service'
import { sortNewestFirst } from '@/m-transaction/service'
import { isExpense } from '@/utils/Stats'

/**
 * Arrows scrolling the table to the previous and next match of the rule.
 */
export const MATCH_STEPS = [
  { step: -1, labelKey: 'STATS_PAGE.CATEGORY_RULES.PREVIOUS_MATCH', Icon: KeyboardArrowUp },
  { step: 1, labelKey: 'STATS_PAGE.CATEGORY_RULES.NEXT_MATCH', Icon: KeyboardArrowDown },
]

type GetCategoryPickerOptionsProps = {
  isIncome: boolean
  /**
   * Of the active rule set.
   */
  tree: CategoryTree
  t: TFunction
}

/**
 * All categories of the rule set, grouped by parent category and direction (e.g. "Transfers & Uncategorised" is in
 * both). Those of the transaction's direction first.
 */
export const getCategoryPickerOptions = ({ isIncome, tree, t }: GetCategoryPickerOptionsProps): MenuSelectOption[] => {
  const directions = [
    { direction: CategoryDirection.IN, label: t('STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.IN_TITLE') },
    { direction: CategoryDirection.OUT, label: t('STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.OUT_TITLE') },
  ]

  return (isIncome ? directions : directions.toReversed()).flatMap(({ direction, label }) =>
    getDirectionParents(tree, direction).flatMap((parent) =>
      parent.children.map((category) => ({
        value: category.id,
        label: getCategoryLabel({ id: category.id, tree, t }),
        group: `${getCategoryLabel({ id: parent.id, tree, t })} · ${label}`,
      })),
    ),
  )
}

/**
 * Fields a rule can match for this transaction: the description, and the category the file comes with if any.
 */
export const getFieldOptions = (transaction: Transaction): CategoryRuleField[] => {
  return [
    CategoryRuleField.DESCRIPTION,
    ...(transaction.extra?.category ? [CategoryRuleField.CATEGORY] : []),
    ...(transaction.extra?.parentCategory ? [CategoryRuleField.PARENT_CATEGORY] : []),
  ]
}

type GetRuleMatchesProps = {
  rule: CategoryRuleDraft
  transaction: Transaction
  transactions: Transaction[]
}

/**
 * Whether the rule matches the edited transaction, and which of the shown ones it matches, newest first like the
 * transactions table.
 */
export const getRuleMatches = ({ rule, transaction, transactions }: GetRuleMatchesProps) => {
  const compiled = compileRule({ rule })
  const matched = rule.keyword ? sortNewestFirst(transactions.filter((other) => matchesRule(other, compiled))) : []

  return {
    isMatch: !!rule.keyword && matchesRule(transaction, compiled),
    count: matched.length,
    transactions: matched,
  }
}

type GetKeywordMatchCountProps = {
  keywordId: string
  isIncome: boolean
  transactions: Transaction[]
  engine: CategoryEngine
}

/**
 * Transactions of the direction recognised as the library keyword, which a mapping of the library keyword changes.
 */
export const getKeywordMatchCount = ({ keywordId, isIncome, transactions, engine }: GetKeywordMatchCountProps) => {
  return transactions.filter(
    (transaction) =>
      isExpense(transaction) !== isIncome &&
      recogniseTransaction({ transaction, engine })?.libraryKeyword.id === keywordId,
  ).length
}

type GetSourceTextProps = {
  resolved: ResolvedCategory
  /**
   * Of the active rule set, which maps the rules and library keywords.
   */
  activeName?: string
  t: TFunction
}

/**
 * Where the current category comes from, e.g. "Set by your rule <b>R-003</b> (“REWE”), mapped by <b>Standard</b>." or
 * "Recognised as <b>REWE</b> (Supermarket), mapped by <b>Standard</b>.", for `Trans`.
 */
export const getSourceText = ({ resolved: { source, rule, library }, activeName, t }: GetSourceTextProps) => {
  if (library && (source === CategorySource.LIBRARY || source === CategorySource.NONE)) {
    const key =
      source === CategorySource.LIBRARY
        ? 'library'
        : library.mapping.type === 'excluded'
          ? 'library_excluded'
          : 'library_unmapped'
    const values = {
      keyword: library.libraryKeyword.name,
      tag: t(library.libraryKeyword.tag, { ns: 'tags' }),
      name: activeName,
    }

    return { i18nKey: `STATS_PAGE.CATEGORY_RULES.SOURCE.${key}`, values }
  }

  const values = rule ? { rule: getRuleRef(rule.number), keyword: rule.keyword, name: activeName } : {}
  return { i18nKey: `STATS_PAGE.CATEGORY_RULES.SOURCE.${source}`, values }
}
