import { z } from 'zod'

import type {
  CategoryColor,
  CategoryDirection,
  CategoryRuleDirection,
  CategoryRuleField,
  CategoryRuleMatch,
  CategorySource,
  Country,
} from '@/types-enums'
import {
  zCategoryColor,
  zCategoryDirection,
  zCategoryRuleDirection,
  zCategoryRuleField,
  zCategoryRuleMatch,
} from '@/types-enums'
import type { Hint } from '@/utils/Category/hints'
import type { BuiltInBankId } from '@/utils/Parser/registry'

import { zDateTimeString, zIdString, zNonEmptyString } from '../global'
import type { CategoryId } from './transaction'
import { zCategoryId } from './transaction'

// -------------------------------------------------------
// Stored, see `m-category`
// -------------------------------------------------------

/**
 * The user's own rule (in their library): matches transactions whose `field` matches `keyword` (see `CategoryRuleMatch`),
 * ignoring case unless `ignoreCase` is off. Shared by all rule sets, each maps it to one of its categories (see
 * `CategoryRuleset.rules`), like the keywords of the built-in library.
 */
export const zCategoryRule = z.object({
  id: zIdString,
  /**
   * Shown to the user, e.g. "R-003" (see `getRuleRef`). Counts up, never reused.
   */
  number: z.number().int().positive(),
  field: zCategoryRuleField,
  match: zCategoryRuleMatch,
  ignoreCase: z.boolean(),
  keyword: zNonEmptyString,
  direction: zCategoryRuleDirection,
})

export type CategoryRule = z.infer<typeof zCategoryRule>

/**
 * A rule being created, or of a template (without ID and number).
 */
export type CategoryRuleDraft = Omit<CategoryRule, 'id' | 'number'>

/**
 * A subcategory. Without a label, the translation of its ID is shown (categories of the templates).
 */
export const zCategoryDef = z.object({
  id: zCategoryId,
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
  id: zCategoryId,
  label: zNonEmptyString.optional(),
  color: zCategoryColor,
  direction: zCategoryDirection,
  children: z.array(zCategoryDef),
})

export type ParentCategoryDef = z.infer<typeof zParentCategoryDef>

/**
 * How a rule set categorises what the library recognises (see `utils/Category/library/`), for one direction (the
 * direction of the transaction, e.g. interest received and interest paid get different categories).
 */
export const zCategoryMappings = z.object({
  /**
   * By hint (see `HINTS`), e.g. 'supermarket'.
   */
  hints: z.record(z.string(), zCategoryId),
  /**
   * By library keyword ID (e.g. 'de.rewe'), before its hints. `null` leaves its transactions uncategorised.
   */
  keywords: z.record(z.string(), zCategoryId.nullable()),
})

export type CategoryMappings = z.infer<typeof zCategoryMappings>

/**
 * A mapping of a rule set to one of its categories: a hint or library keyword, for money in or out.
 */
export type CategoryMappingRef = {
  type: 'hint' | 'keyword'
  key: string
  direction: CategoryDirection
}

/**
 * The user's categories, the rules assigning them and how library keywords map to them, created from a template (see
 * `utils/Category/templates/`) or empty. One is active at a time, see `useActiveRuleset`. Transactions nothing assigns
 * are uncategorised (`null`), not in a category.
 */
export const zCategoryRuleset = z.object({
  id: zIdString,
  /**
   * In rule references, e.g. "R2-003" (see `getRuleRef`). Counts up, never reused.
   */
  number: z.number().int().positive(),
  name: zNonEmptyString,
  categories: z.array(zParentCategoryDef),
  /**
   * The category of each of the user's rules (by ID) this rule set uses, see `zCategoryRule`. Others don't apply.
   */
  rules: z.record(z.string(), zCategoryId),
  /**
   * For money in (also zero amounts) and money out.
   */
  mappings: z.object({ in: zCategoryMappings, out: zCategoryMappings }),
  created: zDateTimeString,
  modified: zDateTimeString,
})

export type CategoryRuleset = z.infer<typeof zCategoryRuleset>

/**
 * Category of a single transaction (by its stable ID) in a rule set, before everything else.
 */
export const zCategoryOverride = z.object({
  rulesetId: zIdString,
  transactionId: zIdString,
  category: zCategoryId,
  created: zDateTimeString,
})

export type CategoryOverride = z.infer<typeof zCategoryOverride>

// -------------------------------------------------------
// Templates, see `utils/Category/templates/`
// -------------------------------------------------------

/**
 * Category IDs of templates are plain strings, converted to `CategoryId` when a rule set is created from it.
 */
export type TemplateCategoryDef = {
  id: string
  color: CategoryColor
  children: string[]
  /**
   * Its subcategories are internal transfers, see `CategoryDef.isTransfer`.
   */
  isTransfer?: boolean
}

export type TemplateDirectionDef = {
  categories: TemplateCategoryDef[]
  /**
   * Categories of library hints, for transactions of this direction, see `CategoryMappings.hints`.
   */
  hints: Partial<Record<Hint, string>>
  /**
   * Categories of single library keywords, see `CategoryMappings.keywords`.
   */
  keywords?: Record<string, string | null>
}

export type CategoryTemplateDef = {
  id: string
  income: TemplateDirectionDef
  expense: TemplateDirectionDef
}

// -------------------------------------------------------
// Library, see `utils/Category/library/`
// -------------------------------------------------------

/**
 * How library keywords match: as whole words (the default), at the start, or the whole description. Not inside words,
 * see `CategoryRuleMatch`.
 */
export type LibraryMatch = Exclude<CategoryRuleMatch, 'contains'>

/**
 * A library keyword: what the built-in library recognises (e.g. REWE), by one or more keywords. Hints group them.
 */
export type LibraryKeywordDef = {
  /**
   * Unique in its pack, in snake_case. The full ID is `{pack}.{ID}`, e.g. 'de.rewe'.
   */
  id: string
  /**
   * Shown to the user, e.g. "REWE".
   */
  name: string
  /**
   * What it is, which rule sets map to their categories.
   */
  hint: Hint
  keywords: string[]
  match?: LibraryMatch
  /**
   * Only money in or out, both by default.
   */
  direction?: CategoryRuleDirection
  /**
   * Only for transactions of banks of these countries, for names that mean something else elsewhere.
   */
  countries?: Country[]
  /**
   * Descriptions as banks write them (anonymised), tested to be recognised as this library keyword.
   */
  examples: [string, ...string[]]
}

export type LibraryPackDef = {
  /**
   * The country ('de', 'gb', 'za'), 'global', or the bank ID for bank packs.
   */
  id: string
  /**
   * Only for transactions of this bank, e.g. its fees.
   */
  bank?: BuiltInBankId
  libraryKeywords: LibraryKeywordDef[]
}

/**
 * A library keyword of a pack, with its full ID.
 */
export type LibraryKeyword = Omit<LibraryKeywordDef, 'match' | 'direction'> & {
  packId: string
  bank?: string
  match: LibraryMatch
  direction: CategoryRuleDirection
}

export type CompiledLibraryPattern = {
  keyword: string
  pattern: RegExp
  highlightPattern: RegExp
  /**
   * More specific match types win: equals, starts with, whole words.
   */
  rank: number
  length: number
}

export type CompiledLibraryKeyword = {
  libraryKeyword: LibraryKeyword
  patterns: CompiledLibraryPattern[]
}

/**
 * The compiled library, library keywords indexed by a word every match contains (see `getLibraryIndex`).
 */
export type LibraryIndex = {
  libraryKeywords: CompiledLibraryKeyword[]
  byToken: Map<string, CompiledLibraryKeyword[]>
}

export type LibraryMatchResult = {
  libraryKeyword: LibraryKeyword
  pattern: CompiledLibraryPattern
}

/**
 * How the rule set categorises a recognised transaction: by the library keyword, by a hint, not at all (the library
 * keyword is mapped to `null`), or it doesn't map the library keyword or any of its hints.
 */
export type LibraryMapping =
  { type: 'keyword' } | { type: 'hint'; hint: string } | { type: 'excluded' } | { type: 'unmapped' }

// -------------------------------------------------------
// Category tree, see `buildCategoryTree`
// -------------------------------------------------------

export type CategoryNode = CategoryDef & {
  parentId: CategoryId
}

export type ParentCategoryNode = Omit<ParentCategoryDef, 'children'> & {
  children: CategoryNode[]
}

/**
 * The categories of a rule set, income first. Labels are resolved with
 * `getCategoryLabel`.
 */
export type CategoryTree = {
  parents: ParentCategoryNode[]
  // By (any) string, to look up what isn't known to be a category ID
  parentsById: Map<string, ParentCategoryNode>
  categoriesById: Map<string, CategoryNode>
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
  /**
   * `null` for previews, which only compare matches.
   */
  category: CategoryId | null
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
  rule?: { id: string; number: number; keyword: string }
}

/**
 * Everything that decides the categories, see `resolveCategory`. A new object whenever any of it changes, so
 * categorised transactions can be cached by it.
 */
export type CategoryEngine = {
  overrides: Map<string, CategoryId>
  /**
   * Of the active rule set.
   */
  rules: CompiledCategoryRule[]
  /**
   * Of the active rule set, by direction.
   */
  mappings: Record<CategoryDirection, CategoryMappings>
  library: LibraryIndex
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
  /**
   * `null` when uncategorised.
   */
  category: CategoryId | null
  source: CategorySource
  /**
   * The stored rule that matched, only for `CategorySource.RULE`.
   */
  rule?: CompiledCategoryRule['rule']
  /**
   * The library keyword recognising the transaction (and which of its keywords matched), for `CategorySource.LIBRARY`,
   * and for `CategorySource.NONE` when the rule set doesn't map it.
   */
  library?: { libraryKeyword: LibraryKeyword; keyword: string; mapping: LibraryMapping }
}
