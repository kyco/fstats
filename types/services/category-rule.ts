import { z } from 'zod'

import type { CategoryRuleDirection, CategoryRuleField, CategorySource } from '@/types-enums'
import { CategoryRuleMatch, zCategoryRuleDirection, zCategoryRuleField, zCategoryRuleMatch } from '@/types-enums'

import { zDateTimeString, zIdString, zNonEmptyString } from '../global'
import type { CategoryCode } from './transaction'
import { zCategoryCode } from './transaction'

// -------------------------------------------------------
// Stored, see `m-category`
// -------------------------------------------------------

/**
 * Assigns `category` to transactions whose `field` matches `keyword` (see `CategoryRuleMatch`), ignoring case unless
 * `ignoreCase` is off.
 */
export const zCategoryRule = z.object({
  id: zIdString,
  /**
   * Shown to the user, e.g. "MR-3" (see `getRuleRef`). Counts up within the rule set, never reused.
   */
  number: z.number().int().positive(),
  field: zCategoryRuleField,
  // Rules stored before there were match types contain the keyword as whole words
  match: zCategoryRuleMatch.default(CategoryRuleMatch.CONTAINS_WORD),
  // Rules stored before ignore case was an option ignore it
  ignoreCase: z.boolean().default(true),
  keyword: zNonEmptyString,
  direction: zCategoryRuleDirection,
  category: zCategoryCode,
})

export type CategoryRule = z.infer<typeof zCategoryRule>

/**
 * A rule being created, or of a built-in rule set (without ID and number).
 */
export type CategoryRuleDraft = Omit<CategoryRule, 'id' | 'number'>

/**
 * A rule set created by the user, selectable like the built-in ones. "My rules" is stored as one too (`MY_RULES_ID`),
 * but applies with every rule set.
 */
export const zCategoryRuleset = z.object({
  id: zIdString,
  /**
   * Of the user's rule sets in rule references, e.g. "R2-3" (see `getRuleRef`). Counts up, never reused. 0 for "My
   * rules".
   */
  number: z.number().int().nonnegative(),
  name: zNonEmptyString,
  rules: z.array(zCategoryRule),
  created: zDateTimeString,
  modified: zDateTimeString,
})

export type CategoryRuleset = z.infer<typeof zCategoryRuleset>

/**
 * As stored before rules and rule sets were numbered, see `withNumbers`.
 */
export type CategoryRulesetAtRest = Omit<CategoryRuleset, 'number' | 'rules'> & {
  number?: number
  rules: (Omit<CategoryRule, 'number'> & { number?: number })[]
}

/**
 * Category of a single transaction, by its (stable) ID.
 */
export const zCategoryOverride = z.object({
  transactionId: zIdString,
  category: zCategoryCode,
  created: zDateTimeString,
})

export type CategoryOverride = z.infer<typeof zCategoryOverride>

// -------------------------------------------------------
// Built-in rule sets, see `utils/Category/rulesets/`
// -------------------------------------------------------

export type KeywordRuleDef = {
  category: CategoryCode
  keywords: string[]
}

export type RulesetDef = {
  id: string
  /**
   * Matched against money in (also zero amounts).
   */
  income: KeywordRuleDef[]
  /**
   * Matched against money out.
   */
  expense: KeywordRuleDef[]
}

// -------------------------------------------------------
// Engine
// -------------------------------------------------------

/**
 * What keeps a transaction's category although a new rule matches it, see `getNewRuleEffect`: its override (set
 * manually) or another rule.
 */
export type NewRuleKeptBy = 'override' | 'rule'

export type CompiledCategoryRule = {
  field: CategoryRuleField
  direction: CategoryRuleDirection
  category: CategoryCode
  pattern: RegExp
  /**
   * The parts of the value the keyword matches, see `toKeywordHighlightPattern`.
   */
  highlightPattern: RegExp
  /**
   * Of the keyword, the longest matching keyword wins.
   */
  length: number
  /**
   * The rule set it's from, `MY_RULES_ID` for "My rules".
   */
  rulesetId?: string
  /**
   * Only rules of the user, so they can be removed.
   */
  rule?: { rulesetId: string; id: string; number: number; keyword: string }
}

/**
 * Everything that decides the categories, see `resolveCategory`. A new object whenever any of it changes, so
 * categorised transactions can be cached by it.
 */
export type CategoryEngine = {
  overrides: Map<string, CategoryCode>
  /**
   * Only while checked like a rule set, applied before all rule sets.
   */
  myRules: CompiledCategoryRule[]
  /**
   * Of all checked rule sets, in their order (the first wins for equally long keywords).
   */
  rulesetRules: CompiledCategoryRule[]
  /**
   * Categories set in the transaction data (the demo) are kept, only with a built-in rule set checked.
   */
  usePresets: boolean
}

export type ResolvedCategory = {
  category: CategoryCode
  source: CategorySource
  /**
   * The rule set of the matching rule, `MY_RULES_ID` for "My rules".
   */
  rulesetId?: string
  /**
   * The user's rule that matched, only for `CategorySource.MY_RULE` and rules of custom rule sets.
   */
  rule?: CompiledCategoryRule['rule']
}
