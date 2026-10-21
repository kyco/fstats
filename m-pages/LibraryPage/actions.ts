import type { TFunction } from 'i18next'

import type { CategoryRule, CategoryRuleset, LibraryKeyword } from '@/types'
import { buildCategoryTree, getCategoryLabel } from '@/m-category/service'

/**
 * DOM ID of a hint or library keyword, scrolled to when linked.
 */
export const toAnchorId = (type: 'hint' | 'keyword' | 'rule', id: string) => {
  return `${type}-${id.replaceAll('.', '-')}`
}

type GetExpandedHintsProps = {
  hint: string | null
  libraryKeyword: LibraryKeyword | undefined
}

/**
 * Hints to expand to show the linked hint, or the hint of the linked library keyword.
 */
export const getExpandedHints = ({ hint, libraryKeyword }: GetExpandedHintsProps) => {
  return [...(hint ? [hint] : []), ...(libraryKeyword ? [libraryKeyword.hint] : [])]
}

type GetRuleUsesProps = {
  rule: CategoryRule
  rulesets: CategoryRuleset[]
  t: TFunction
}

/**
 * The rule sets mapping the rule, with the category, e.g. "Standard → Groceries".
 */
export const getRuleUses = ({ rule, rulesets, t }: GetRuleUsesProps) => {
  return rulesets.flatMap((ruleset) => {
    const id = ruleset.rules[rule.id]
    return id ? [`${ruleset.name} → ${getCategoryLabel({ id, tree: buildCategoryTree(ruleset.categories), t })}`] : []
  })
}

type SearchRulesProps = {
  rules: CategoryRule[]
  query: string
}

/**
 * The user's rules whose keyword contains the query, ignoring case.
 */
export const searchRules = ({ rules, query }: SearchRulesProps) => {
  const needle = query.trim().toLowerCase()
  return rules.filter((rule) => rule.keyword.toLowerCase().includes(needle))
}
