import { describe, expect, it } from 'vitest'

import type { ParentCategory } from '@/types'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/common'
import { MY_RULES_ID, RULESETS } from '@/utils/Category'

import deLocale from '../../../public/locales/de.json'
import enLocale from '../../../public/locales/en.json'

const toCodes = (categories: Record<string, ParentCategory>) => {
  return new Set(Object.values(categories).flatMap((parent) => Object.keys(parent.subcategories)))
}

describe('RULESETS', () => {
  it('should have unique IDs, other than the reserved ones', () => {
    const ids = RULESETS.map((ruleset) => ruleset.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).not.toContain(MY_RULES_ID)
  })

  it('should only use known category codes of the right direction', () => {
    const incomeCodes = toCodes(INCOME_CATEGORIES)
    const expenseCodes = toCodes(EXPENSE_CATEGORIES)

    RULESETS.forEach((ruleset) => {
      ruleset.income.forEach((rule) => expect(incomeCodes).toContain(rule.category))
      ruleset.expense.forEach((rule) => expect(expenseCodes).toContain(rule.category))
    })
  })

  it('should have a translated name', () => {
    RULESETS.forEach((ruleset) => {
      expect(enLocale.STATS_PAGE.CATEGORY_RULES.RULESETS).toHaveProperty(ruleset.id)
      expect(deLocale.STATS_PAGE.CATEGORY_RULES.RULESETS).toHaveProperty(ruleset.id)
    })
  })
})
