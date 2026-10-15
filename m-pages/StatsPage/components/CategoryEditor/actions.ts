import type { TFunction } from 'i18next'

import type { CategoryRuleDraft, CategoryRuleset, MenuSelectOption, ResolvedCategory, Transaction } from '@/types'
import { CategoryRuleField, CategorySource } from '@/types-enums'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/common'
import { compileRule, getRuleRef, matchesRule } from '@/m-category/service'
import { getCategoryLabel } from '@/utils/Category'

import { getRulesetName } from '../RulesetSelect/actions'

/**
 * "Save to" option of a rule set created on saving.
 */
export const NEW_RULESET = 'new'

/**
 * Categories of the transaction's direction, grouped by parent category.
 */
export const getCategoryPickerOptions = (isIncome: boolean, t: TFunction): MenuSelectOption[] => {
  return Object.values(isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).flatMap((parent) =>
    Object.values(parent.subcategories).map((category) => ({
      value: category.code,
      label: getCategoryLabel(category.code, t),
      group: getCategoryLabel(parent.code, t),
    })),
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
 * Whether the rule matches the edited transaction, and how many of the shown ones it matches.
 */
export const getRuleMatches = ({ rule, transaction, transactions }: GetRuleMatchesProps) => {
  if (!rule.keyword) {
    return { isMatch: false, count: 0 }
  }

  const compiled = compileRule(rule)

  return {
    isMatch: matchesRule(transaction, compiled),
    count: transactions.filter((other) => matchesRule(other, compiled)).length,
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
