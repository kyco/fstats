import { z } from 'zod'

import type { CategoryColor, CategoryRuleDirection, CategoryRuleField, CategorySource } from '@/types-enums'
import {
  zCategoryColor,
  zCategoryDirection,
  zCategoryRuleDirection,
  zCategoryRuleField,
  zCategoryRuleMatch,
} from '@/types-enums'

import { zDateTimeString, zIdString, zNonEmptyString } from '../global'
import type { CategoryCode, ParentCategoryCode } from './transaction'
import { zCategoryCode, zParentCategoryCode } from './transaction'

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
   * Shown to the user, e.g. "R1-003" (see `getRuleRef`). Counts up within the rule set, never reused.
   */
  number: z.number().int().positive(),
  field: zCategoryRuleField,
  match: zCategoryRuleMatch,
  ignoreCase: z.boolean(),
  keyword: zNonEmptyString,
  direction: zCategoryRuleDirection,
  category: zCategoryCode,
})

export type CategoryRule = z.infer<typeof zCategoryRule>

/**
 * A rule being created, or of a template (without ID and number).
 */
export type CategoryRuleDraft = Omit<CategoryRule, 'id' | 'number'>

/**
 * A subcategory. Without a label, the translation of its code is shown (categories of the templates).
 */
export const zCategoryDef = z.object({
  code: zCategoryCode,
  label: zNonEmptyString.optional(),
  /**
   * Transfers between the user's own accounts, excluded from profit and loss (listed separately).
   */
  isTransfer: z.boolean().optional(),
})

export type CategoryDef = z.infer<typeof zCategoryDef>

/**
 * A parent category with its subcategories, for money in or out. Without a label, like `CategoryDef`.
 */
export const zParentCategoryDef = z.object({
  code: zParentCategoryCode,
  label: zNonEmptyString.optional(),
  color: zCategoryColor,
  direction: zCategoryDirection,
  children: z.array(zCategoryDef),
})

export type ParentCategoryDef = z.infer<typeof zParentCategoryDef>

/**
 * The user's categories and the rules assigning them, created from a template (see `utils/Category/templates/`) or
 * empty. One is active at a time, see `useActiveRuleset`. The system categories (see `SYSTEM_CATEGORIES`) aren't
 * stored, every rule set has them.
 */
export const zCategoryRuleset = z.object({
  id: zIdString,
  /**
   * In rule references, e.g. "R2-003" (see `getRuleRef`). Counts up, never reused.
   */
  number: z.number().int().positive(),
  name: zNonEmptyString,
  categories: z.array(zParentCategoryDef),
  rules: z.array(zCategoryRule),
  created: zDateTimeString,
  modified: zDateTimeString,
})

export type CategoryRuleset = z.infer<typeof zCategoryRuleset>

/**
 * Category of a single transaction, by its (stable) ID. Applies with every rule set that has the category.
 */
export const zCategoryOverride = z.object({
  transactionId: zIdString,
  category: zCategoryCode,
  created: zDateTimeString,
})

export type CategoryOverride = z.infer<typeof zCategoryOverride>

// -------------------------------------------------------
// Templates, see `utils/Category/templates/`
// -------------------------------------------------------

export type KeywordRuleDef = {
  category: CategoryCode
  keywords: string[]
}

export type TemplateCategoryDef = {
  code: ParentCategoryCode
  color: CategoryColor
  children: CategoryCode[]
  /**
   * Its subcategories are internal transfers, see `CategoryDef.isTransfer`.
   */
  isTransfer?: boolean
}

export type TemplateDirectionDef = {
  categories: TemplateCategoryDef[]
  /**
   * Matched against money in (also zero amounts) for `income`, money out for `expense`.
   */
  rules: KeywordRuleDef[]
}

export type CategoryTemplateDef = {
  id: string
  income: TemplateDirectionDef
  expense: TemplateDirectionDef
}

// -------------------------------------------------------
// Category tree, see `buildCategoryTree`
// -------------------------------------------------------

export type CategoryNode = CategoryDef & {
  parentCode: ParentCategoryCode
}

export type ParentCategoryNode = Omit<ParentCategoryDef, 'children'> & {
  children: CategoryNode[]
  /**
   * "Uncategorised", which every rule set has and can't be changed.
   */
  isSystem: boolean
}

/**
 * The categories of a rule set with the system categories, income first. Labels are resolved with
 * `getCategoryLabel`.
 */
export type CategoryTree = {
  parents: ParentCategoryNode[]
  parentsByCode: Map<ParentCategoryCode, ParentCategoryNode>
  categoriesByCode: Map<CategoryCode, CategoryNode>
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
   * Stored rules, so they can be referenced and removed.
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
   * Of the active rule set.
   */
  rules: CompiledCategoryRule[]
  /**
   * The categories that can be assigned, others (e.g. of an override set with another rule set) are uncategorised.
   */
  tree: CategoryTree
  /**
   * Categories set in the transaction data (the demo) are kept.
   */
  usePresets: boolean
}

export type ResolvedCategory = {
  category: CategoryCode
  source: CategorySource
  /**
   * The stored rule that matched, only for `CategorySource.RULE`.
   */
  rule?: CompiledCategoryRule['rule']
}
