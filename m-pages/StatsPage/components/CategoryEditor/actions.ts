import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import type { TFunction } from 'i18next'

import type {
  CategoryRuleDraft,
  CategoryRuleset,
  CategoryTree,
  MenuSelectOption,
  ResolvedCategory,
  Transaction,
} from '@/types'
import { CategoryDirection, CategoryRuleField } from '@/types-enums'
import { compileRule, getCategoryLabel, getDirectionParents, getRuleRef, matchesRule } from '@/m-category/service'
import { sortNewestFirst } from '@/m-transaction/service'

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
        value: category.code,
        label: getCategoryLabel({ code: category.code, tree, t }),
        group: `${getCategoryLabel({ code: parent.code, tree, t })} · ${label}`,
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
  const compiled = compileRule(rule)
  const matched = rule.keyword ? sortNewestFirst(transactions.filter((other) => matchesRule(other, compiled))) : []

  return {
    isMatch: !!rule.keyword && matchesRule(transaction, compiled),
    count: matched.length,
    transactions: matched,
  }
}

type GetSourceTextProps = {
  resolved: ResolvedCategory
  rulesets: CategoryRuleset[]
}

/**
 * Where the current category comes from, e.g. "Set by rule <b>R1-003</b> of <b>Standard</b>.", for `Trans`.
 */
export const getSourceText = ({ resolved: { source, rule }, rulesets }: GetSourceTextProps) => {
  const name = rule ? rulesets.find((ruleset) => ruleset.id === rule.rulesetId)?.name : undefined
  const ref = rule ? getRuleRef({ rulesetId: rule.rulesetId, number: rule.number, rulesets }) : undefined

  return { i18nKey: `STATS_PAGE.CATEGORY_RULES.SOURCE.${source}`, values: { rule: ref, name } }
}
