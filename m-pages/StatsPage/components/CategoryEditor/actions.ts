import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import type { TFunction } from 'i18next'

import type { CategoryRuleDraft, CategoryRuleset, MenuSelectOption, ResolvedCategory, Transaction } from '@/types'
import { CategoryRuleField, CategorySource } from '@/types-enums'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/common'
import { compileRule, getRuleRef, matchesRule } from '@/m-category/service'
import { sortNewestFirst } from '@/m-transaction/service'
import { getCategoryLabel } from '@/utils/Category'

import { getRulesetName } from '../RulesetSelect/actions'

/**
 * "Save to" option of a rule set created on saving.
 */
export const NEW_RULESET = 'new'

/**
 * Arrows scrolling the table to the previous and next match of the rule.
 */
export const MATCH_STEPS = [
  { step: -1, labelKey: 'STATS_PAGE.CATEGORY_RULES.PREVIOUS_MATCH', Icon: KeyboardArrowUp },
  { step: 1, labelKey: 'STATS_PAGE.CATEGORY_RULES.NEXT_MATCH', Icon: KeyboardArrowDown },
]

/**
 * All categories that can be assigned, grouped by parent category and direction (e.g. "Transfers & Uncategorised" is in
 * both). Those of the transaction's direction first.
 */
export const getCategoryPickerOptions = (isIncome: boolean, t: TFunction): MenuSelectOption[] => {
  const directions = [
    { categories: INCOME_CATEGORIES, label: t('STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.IN_TITLE') },
    { categories: EXPENSE_CATEGORIES, label: t('STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.OUT_TITLE') },
  ]

  return (isIncome ? directions : directions.toReversed()).flatMap(({ categories, label }) =>
    Object.values(categories).flatMap((parent) =>
      Object.values(parent.subcategories).map((category) => ({
        value: category.code,
        label: getCategoryLabel(category.code, t),
        group: `${getCategoryLabel(parent.code, t)} · ${label}`,
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
  t: TFunction
}

/**
 * Where the current category comes from, e.g. "Via <b>Standard</b> rule set." or "Set by rule <b>MR-003</b> of <b>My
 * rules</b>.", for `Trans`.
 */
export const getSourceText = ({ resolved: { source, rulesetId, rule }, rulesets, t }: GetSourceTextProps) => {
  const name = rulesetId ? getRulesetName({ id: rulesetId, rulesets, t }) : undefined
  const key = source === CategorySource.RULESET && rule ? 'customRule' : source
  const ref = rule ? getRuleRef({ rulesetId: rule.rulesetId, number: rule.number, rulesets }) : undefined

  return { i18nKey: `STATS_PAGE.CATEGORY_RULES.SOURCE.${key}`, values: { rule: ref, name } }
}
