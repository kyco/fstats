import type {
  CategoryCode,
  CategoryEngine,
  CategoryOverride,
  CategoryRuleDraft,
  CategoryRuleset,
  CompiledCategoryRule,
  NewRuleKeptBy,
  ParsedStatsFile,
  ResolvedCategory,
  StatsFile,
  TextRange,
  Transaction,
} from '@/types'
import { CategoryRuleDirection, CategoryRuleField, CategorySource } from '@/types-enums'
import { isParsed } from '@/m-stats-file/service'
import { getPatternRanges, getUncategorisedCode, toKeywordHighlightPattern, toKeywordPattern } from '@/utils/Category'
import { isExpense } from '@/utils/Stats'

import { buildCategoryTree, hasCategory } from './tree'

/**
 * Stored rules (with an `id`, `number` and `rulesetId`) can be removed and are shown, so they're referenced.
 */
export const compileRule = (
  { id, number, ...rule }: CategoryRuleDraft & { id?: string; number?: number },
  rulesetId?: string,
): CompiledCategoryRule => {
  return {
    field: rule.field,
    direction: rule.direction,
    category: rule.category,
    pattern: toKeywordPattern(rule),
    highlightPattern: toKeywordHighlightPattern(rule),
    length: rule.keyword.trim().length,
    rule: id && number && rulesetId ? { rulesetId, id, number, keyword: rule.keyword } : undefined,
  }
}

type CreateCategoryEngineProps = {
  /**
   * The active one, all transactions are uncategorised without.
   */
  ruleset: CategoryRuleset | null
  overrides: CategoryOverride[]
  /**
   * Keeps the categories set in the transaction data (the demo) that the rule set has.
   */
  usePresets?: boolean
}

export const createCategoryEngine = ({
  ruleset,
  overrides,
  usePresets = false,
}: CreateCategoryEngineProps): CategoryEngine => {
  return {
    overrides: new Map(overrides.map((override) => [override.transactionId, override.category])),
    rules: ruleset ? ruleset.rules.map((rule) => compileRule(rule, ruleset.id)) : [],
    tree: buildCategoryTree(ruleset?.categories ?? []),
    usePresets,
  }
}

export const getRuleFieldValue = (transaction: Transaction, field: CategoryRuleField) => {
  return field === CategoryRuleField.DESCRIPTION ? transaction.description : transaction.extra?.[field]
}

export const matchesRule = (transaction: Transaction, rule: CompiledCategoryRule) => {
  const isIncome = !isExpense(transaction)
  const isDirection =
    rule.direction === CategoryRuleDirection.ANY || (rule.direction === CategoryRuleDirection.IN) === isIncome
  const value = getRuleFieldValue(transaction, rule.field)

  return isDirection && !!value && rule.pattern.test(value)
}

/**
 * The parts of the description the rule matches, to highlight them. None when it doesn't match or matches another
 * field.
 */
export const getRuleDescriptionMatches = (transaction: Transaction, rule: CompiledCategoryRule): TextRange[] => {
  return rule.field === CategoryRuleField.DESCRIPTION && matchesRule(transaction, rule)
    ? getPatternRanges(transaction.description, rule.highlightPattern)
    : []
}

/**
 * The most specific (longest keyword) matching rule, the first of equally long ones.
 */
const findRule = (transaction: Transaction, rules: CompiledCategoryRule[]) => {
  let match: CompiledCategoryRule | null = null

  for (const rule of rules) {
    if ((!match || rule.length > match.length) && matchesRule(transaction, rule)) {
      match = rule
    }
  }

  return match
}

type ResolveCategoryProps = {
  transaction: Transaction
  engine: CategoryEngine
  /**
   * Category set in the transaction data (the demo transactions).
   */
  preset?: CategoryCode | null
}

/**
 * First match wins: the override of the transaction, a preset category (only in the demo), the rules of the active rule
 * set, otherwise uncategorised. Categories the rule set doesn't have (e.g. an override set with another one) are
 * skipped.
 */
export const resolveCategory = ({ transaction, engine, preset }: ResolveCategoryProps): ResolvedCategory => {
  const override = engine.overrides.get(transaction.id)
  if (override && hasCategory(engine.tree, override)) {
    return { category: override, source: CategorySource.OVERRIDE }
  }

  if (preset && engine.usePresets && hasCategory(engine.tree, preset)) {
    return { category: preset, source: CategorySource.PRESET }
  }

  const rule = findRule(transaction, engine.rules)
  if (rule) {
    return { category: rule.category, source: CategorySource.RULE, rule: rule.rule }
  }

  return { category: getUncategorisedCode(transaction), source: CategorySource.NONE }
}

type GetNewRuleEffectProps = {
  transaction: Transaction
  engine: CategoryEngine
  /**
   * The rule being created, matching the transaction.
   */
  rule: CompiledCategoryRule
  /**
   * The edited transaction, its override is removed on saving.
   */
  editedId: string
}

/**
 * Whether a new rule would change the category of a transaction it matches (see `resolveCategory`), otherwise what wins
 * over it: the override of the transaction or another rule.
 */
export const getNewRuleEffect = ({
  transaction,
  engine,
  rule,
  editedId,
}: GetNewRuleEffectProps): NewRuleKeptBy | null => {
  const override = engine.overrides.get(transaction.id)
  if (transaction.id !== editedId && override && hasCategory(engine.tree, override)) {
    return 'override'
  }

  return findRule(transaction, [...engine.rules, rule]) === rule ? null : 'rule'
}

type GetRuleRefProps = {
  rulesetId: string
  number: number
  rulesets: CategoryRuleset[]
}

/**
 * Short reference of a stored rule, e.g. "R2-014" for rule 14 of the user's second rule set.
 */
export const getRuleRef = ({ rulesetId, number, rulesets }: GetRuleRefProps) => {
  const setNumber = rulesets.find((ruleset) => ruleset.id === rulesetId)?.number ?? '?'
  return `R${setNumber}-${String(number).padStart(3, '0')}`
}

// By file, so files keep their transactions (and references) until the engine changes
const fileCache = new WeakMap<ParsedStatsFile, { engine: CategoryEngine; file: ParsedStatsFile }>()

const categoriseFile = (file: ParsedStatsFile, engine: CategoryEngine): ParsedStatsFile => {
  const cached = fileCache.get(file)
  if (cached?.engine === engine) {
    return cached.file
  }

  const categorised = {
    ...file,
    sections: file.sections.map((section) => ({
      ...section,
      transactions: section.transactions.map((transaction) => ({
        ...transaction,
        category: resolveCategory({ transaction, engine, preset: transaction.category }).category,
      })),
    })),
  }

  fileCache.set(file, { engine, file: categorised })
  return categorised
}

/**
 * Files with the categories of their transactions resolved, see `resolveCategory`. Categories aren't stored, so
 * changing rules applies to all transactions.
 */
export const categoriseFiles = (files: StatsFile[], engine: CategoryEngine): StatsFile[] => {
  return files.map((file) => (isParsed(file) ? categoriseFile(file, engine) : file))
}
