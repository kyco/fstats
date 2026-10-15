import type { RulesetDef } from '@/types'

export const defineRuleset = <const Id extends string>(ruleset: RulesetDef & { id: Id }): RulesetDef & { id: Id } => {
  return ruleset
}
