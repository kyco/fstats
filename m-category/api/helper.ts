import type { CategoryOverride, CategoryRuleset, CategoryRulesetAtRest } from '@/types'
import { zCategoryOverride, zCategoryRuleset } from '@/types'
import { MY_RULES_ID } from '@/utils/Category'
import { parseOrThrow } from '@/lib/zod'

export const syncCategoryRuleset = (dataToSync: CategoryRuleset): CategoryRuleset => {
  return parseOrThrow({ schema: zCategoryRuleset, data: dataToSync, label: 'Cannot sync CategoryRuleset' })
}

export const syncCategoryOverride = (dataToSync: CategoryOverride): CategoryOverride => {
  return parseOrThrow({ schema: zCategoryOverride, data: dataToSync, label: 'Cannot sync CategoryOverride' })
}

/**
 * Numbers rules (and the user's rule sets) stored before they were numbered, after the highest number, in order.
 */
export const withNumbers = (rulesets: CategoryRulesetAtRest[]) => {
  let setNumber = Math.max(0, ...rulesets.map((ruleset) => ruleset.number ?? 0))

  return [...rulesets]
    .sort((a, b) => a.created.localeCompare(b.created))
    .map((ruleset) => {
      let ruleNumber = Math.max(0, ...ruleset.rules.map((rule) => rule.number ?? 0))
      const nextRuleNumber = () => {
        ruleNumber += 1
        return ruleNumber
      }
      const nextSetNumber = () => {
        setNumber += 1
        return setNumber
      }

      const number = ruleset.number ?? (ruleset.id === MY_RULES_ID ? 0 : nextSetNumber())
      const rules = ruleset.rules.map((rule) => ({ ...rule, number: rule.number ?? nextRuleNumber() }))
      const isChanged = number !== ruleset.number || ruleset.rules.some((rule) => rule.number === undefined)

      return { ruleset: { ...ruleset, number, rules }, isChanged }
    })
}

/**
 * Next number of a rule in the rule set, never reused.
 */
export const getNextNumber = (items: { number: number }[]) => {
  return Math.max(0, ...items.map((item) => item.number)) + 1
}
