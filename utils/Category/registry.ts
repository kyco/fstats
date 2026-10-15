import { defaultRuleset, minimalGermanyRuleset } from './rulesets'

/**
 * The built-in rule sets, checked in the stats page toolbar. Their IDs are stored as the checked rule sets, never change
 * them.
 */
export const RULESETS = [defaultRuleset, minimalGermanyRuleset] as const

export type BuiltInRulesetId = (typeof RULESETS)[number]['id']

export const DEFAULT_RULESET_ID: BuiltInRulesetId = 'default'

/**
 * ID of the stored rule set holding "My rules", which apply with every rule set.
 */
export const MY_RULES_ID = 'my_rules'

export const getBuiltInRuleset = (id: string) => {
  return RULESETS.find((ruleset) => ruleset.id === id)
}
