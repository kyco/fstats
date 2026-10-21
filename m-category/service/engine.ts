import { sortBy } from 'lodash'

import type {
  CategoryEngine,
  CategoryId,
  CategoryMappings,
  CategoryOverride,
  CategoryRule,
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
import { CategoryDirection, CategoryRuleDirection, CategoryRuleField, CategorySource } from '@/types-enums'
import { isParsed } from '@/m-stats-file/service'
import { getPatternRanges, toKeywordHighlightPattern, toKeywordPattern } from '@/utils/Category'
import { toBankId } from '@/utils/Parser'
import { isExpense } from '@/utils/Stats'

import { findLibraryMatch, getLibraryIndex, mapLibraryKeyword } from './library'
import { buildCategoryTree, hasCategory } from './tree'

const NO_MAPPINGS: CategoryMappings = { hints: {}, keywords: {} }

type CompileRuleProps = {
  /**
   * Stored rules (with an `id` and `number`) are referenced, so they can be shown and removed.
   */
  rule: CategoryRuleDraft & { id?: string; number?: number }
  /**
   * The rule set maps the rule to, see `CategoryRuleset.rules`. None for previews, which only compare matches.
   */
  category?: CategoryId | null
}

export const compileRule = ({
  rule: { id, number, ...rule },
  category = null,
}: CompileRuleProps): CompiledCategoryRule => {
  return {
    field: rule.field,
    direction: rule.direction,
    category,
    pattern: toKeywordPattern(rule),
    highlightPattern: toKeywordHighlightPattern(rule),
    length: rule.keyword.trim().length,
    rule: id && number ? { id, number, keyword: rule.keyword } : undefined,
  }
}

type CreateCategoryEngineProps = {
  /**
   * The active one, all transactions are uncategorised without.
   */
  ruleset: CategoryRuleset | null
  /**
   * The user's rules (their library), those the rule set maps apply.
   */
  rules: CategoryRule[]
  overrides: CategoryOverride[]
  /**
   * Keeps the categories set in the transaction data (the demo) that the rule set has.
   */
  usePresets?: boolean
}

export const createCategoryEngine = ({
  ruleset,
  rules,
  overrides,
  usePresets = false,
}: CreateCategoryEngineProps): CategoryEngine => {
  const tree = buildCategoryTree(ruleset?.categories ?? [])
  // Oldest first, the first of equally long keywords wins
  const mappedRules = sortBy(rules, 'number').flatMap((rule) => {
    const category = ruleset?.rules[rule.id]
    return category && hasCategory(tree, category) ? [compileRule({ rule, category })] : []
  })

  return {
    // Of the rule set, others are of other rule sets
    overrides: new Map(
      overrides
        .filter((override) => override.rulesetId === ruleset?.id)
        .map((override) => [override.transactionId, override.category]),
    ),
    rules: mappedRules,
    mappings: {
      [CategoryDirection.IN]: ruleset?.mappings.in ?? NO_MAPPINGS,
      [CategoryDirection.OUT]: ruleset?.mappings.out ?? NO_MAPPINGS,
    },
    library: getLibraryIndex(),
    tree,
    usePresets,
  }
}

/**
 * Bank of the transactions categorised so far (see `categoriseFiles`), for library keywords of a bank or country. Their
 * IDs include the bank account, so a transaction always belongs to the same bank.
 */
const transactionBanks = new Map<string, string>()

/**
 * Of the transaction, see `transactionBanks`, `undefined` before its file was categorised.
 */
export const getTransactionBankId = (transaction: Transaction) => {
  return transactionBanks.get(transaction.id)
}

type RecogniseTransactionProps = {
  transaction: Transaction
  engine: CategoryEngine
  /**
   * Of the transaction, known for categorised transactions.
   */
  bankId?: string
}

/**
 * The library keyword recognising the transaction, whatever decides its category.
 */
export const recogniseTransaction = ({ transaction, engine, bankId }: RecogniseTransactionProps) => {
  return findLibraryMatch({
    transaction,
    index: engine.library,
    bankId: bankId ?? getTransactionBankId(transaction),
  })
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
  preset?: CategoryId | null
  /**
   * Of the transaction, known for categorised transactions (see `getTransactionBankId`).
   */
  bankId?: string
}

/**
 * First match wins: the override of the transaction, a preset category (only in the demo), the rules of the active rule
 * set, the library keyword recognising it as the rule set maps it, otherwise uncategorised. Categories the rule set
 * doesn't have (e.g. an override set with another one) are skipped. See `docs/categorisation.md`.
 */
export const resolveCategory = ({ transaction, engine, preset, bankId }: ResolveCategoryProps): ResolvedCategory => {
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

  const match = recogniseTransaction({ transaction, engine, bankId })
  if (match) {
    const direction = isExpense(transaction) ? CategoryDirection.OUT : CategoryDirection.IN
    const { category, mapping } = mapLibraryKeyword({
      libraryKeyword: match.libraryKeyword,
      mappings: engine.mappings[direction],
      tree: engine.tree,
    })
    const library = { libraryKeyword: match.libraryKeyword, keyword: match.pattern.keyword, mapping }

    return category
      ? { category, source: CategorySource.LIBRARY, library }
      : { category: null, source: CategorySource.NONE, library }
  }

  return { category: null, source: CategorySource.NONE }
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

type GetKeywordMappingEffectProps = {
  transaction: Transaction
  engine: CategoryEngine
  /**
   * The edited transaction, its override is removed on saving.
   */
  editedId: string
}

/**
 * Whether mapping the library keyword recognising the transaction would change its category (see `resolveCategory`),
 * otherwise what wins over the library: its override or a rule.
 */
export const getKeywordMappingEffect = ({
  transaction,
  engine,
  editedId,
}: GetKeywordMappingEffectProps): NewRuleKeptBy | null => {
  const override = engine.overrides.get(transaction.id)
  if (transaction.id !== editedId && override && hasCategory(engine.tree, override)) {
    return 'override'
  }

  return findRule(transaction, engine.rules) ? 'rule' : null
}

/**
 * The parts of the description the library keyword recognising the transaction matches, to highlight them.
 */
export const getLibraryDescriptionMatches = (transaction: Transaction, engine: CategoryEngine): TextRange[] => {
  const match = recogniseTransaction({ transaction, engine })
  return match ? getPatternRanges(transaction.description, match.pattern.highlightPattern) : []
}

/**
 * Short reference of one of the user's rules, e.g. "R-014".
 */
export const getRuleRef = (number: number) => {
  return `R-${String(number).padStart(3, '0')}`
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
    sections: file.sections.map((section) => {
      const bankId = toBankId(section.parserId)

      return {
        ...section,
        transactions: section.transactions.map((transaction) => {
          transactionBanks.set(transaction.id, bankId)
          return {
            ...transaction,
            category: resolveCategory({ transaction, engine, preset: transaction.category, bankId }).category,
          }
        }),
      }
    }),
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
