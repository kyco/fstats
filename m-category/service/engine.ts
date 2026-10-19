import type {
  CategoryCode,
  CategoryEngine,
  CategoryOverride,
  CategoryRuleDraft,
  CategoryRuleset,
  CompiledCategoryRule,
  KeywordRuleDef,
  NewRuleKeptBy,
  ParsedStatsFile,
  ResolvedCategory,
  RulesetDef,
  StatsFile,
  TextRange,
  Transaction,
} from '@/types'
import { CategoryRuleDirection, CategoryRuleField, CategoryRuleMatch, CategorySource } from '@/types-enums'
import { isParsed } from '@/m-stats-file/service'
import {
  getBuiltInRuleset,
  getPatternRanges,
  getUncategorisedCode,
  MY_RULES_ID,
  RULESETS,
  toKeywordHighlightPattern,
  toKeywordPattern,
} from '@/utils/Category'
import { isExpense } from '@/utils/Stats'

/**
 * Rules of the user (with an `id`, `number` and `rulesetId`) can be removed and are shown, so they're referenced.
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
    rulesetId,
    rule: id && number && rulesetId ? { rulesetId, id, number, keyword: rule.keyword } : undefined,
  }
}

const compileRuleset = ({ id, rules }: Pick<CategoryRuleset, 'id' | 'rules'>) => {
  return rules.map((rule) => compileRule(rule, id))
}

const toDirectionRules = (rules: KeywordRuleDef[], direction: CategoryRuleDirection) => {
  return rules.flatMap(({ category, keywords }) =>
    keywords.map((keyword) => ({
      field: CategoryRuleField.DESCRIPTION,
      match: CategoryRuleMatch.CONTAINS_WORD,
      ignoreCase: true,
      direction,
      category,
      keyword,
    })),
  )
}

/**
 * Rules of a built-in rule set, one per keyword, as a user's rule set would have them.
 */
export const toCategoryRules = (ruleset: RulesetDef): CategoryRuleDraft[] => {
  return [
    ...toDirectionRules(ruleset.income, CategoryRuleDirection.IN),
    ...toDirectionRules(ruleset.expense, CategoryRuleDirection.OUT),
  ]
}

const builtInCache = new Map<string, CompiledCategoryRule[]>()

const compileBuiltInRuleset = (ruleset: RulesetDef) => {
  const cached = builtInCache.get(ruleset.id)
  if (cached) {
    return cached
  }

  const compiled = toCategoryRules(ruleset).map((rule) => compileRule(rule, ruleset.id))
  builtInCache.set(ruleset.id, compiled)
  return compiled
}

/**
 * Custom rule sets the user can select, without "My rules".
 */
export const getCustomRulesets = (rulesets: CategoryRuleset[]) => {
  return rulesets.filter((ruleset) => ruleset.id !== MY_RULES_ID)
}

type GetActiveRulesetIdsProps = {
  rulesetIds: string[]
  rulesets: CategoryRuleset[]
}

/**
 * The checked rule sets that exist (e.g. not a removed custom rule set), in the order they're listed: the built-in ones,
 * "My rules", then the user's. "My rules" is applied first regardless.
 */
export const getActiveRulesetIds = ({ rulesetIds, rulesets }: GetActiveRulesetIdsProps) => {
  const ids = [
    ...RULESETS.map((ruleset) => ruleset.id),
    MY_RULES_ID,
    ...getCustomRulesets(rulesets).map((ruleset) => ruleset.id),
  ]
  return ids.filter((id) => rulesetIds.includes(id))
}

type CreateCategoryEngineProps = {
  rulesetIds: string[]
  rulesets: CategoryRuleset[]
  overrides: CategoryOverride[]
}

export const createCategoryEngine = ({
  rulesetIds,
  rulesets,
  overrides,
}: CreateCategoryEngineProps): CategoryEngine => {
  const activeIds = getActiveRulesetIds({ rulesetIds, rulesets })
  const myRules = rulesets.find((ruleset) => ruleset.id === MY_RULES_ID)

  return {
    overrides: new Map(overrides.map((override) => [override.transactionId, override.category])),
    myRules: myRules && activeIds.includes(MY_RULES_ID) ? compileRuleset(myRules) : [],
    rulesetRules: activeIds.flatMap((id) => {
      const builtIn = getBuiltInRuleset(id)
      const custom = rulesets.find((ruleset) => ruleset.id === id)
      return builtIn ? compileBuiltInRuleset(builtIn) : custom ? compileRuleset(custom) : []
    }),
    usePresets: activeIds.some((id) => !!getBuiltInRuleset(id)),
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
 * First match wins: the override of the transaction, "My rules", a preset category (only with a built-in rule set),
 * the rules of the checked rule sets, otherwise uncategorised.
 */
export const resolveCategory = ({ transaction, engine, preset }: ResolveCategoryProps): ResolvedCategory => {
  const override = engine.overrides.get(transaction.id)
  if (override) {
    return { category: override, source: CategorySource.OVERRIDE }
  }

  const myRule = findRule(transaction, engine.myRules)
  if (myRule) {
    return { category: myRule.category, source: CategorySource.MY_RULE, rulesetId: MY_RULES_ID, rule: myRule.rule }
  }

  if (preset && engine.usePresets) {
    return { category: preset, source: CategorySource.PRESET }
  }

  const rulesetRule = findRule(transaction, engine.rulesetRules)
  if (rulesetRule) {
    return {
      category: rulesetRule.category,
      source: CategorySource.RULESET,
      rulesetId: rulesetRule.rulesetId,
      rule: rulesetRule.rule,
    }
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
   * Saved to "My rules", otherwise to a rule set (checked on saving, its rules are then applied after the others).
   */
  isMyRules: boolean
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
  isMyRules,
  editedId,
}: GetNewRuleEffectProps): NewRuleKeptBy | null => {
  if (transaction.id !== editedId && engine.overrides.has(transaction.id)) {
    return 'override'
  }

  // "My rules" are applied first, then the rule sets
  const isApplied = isMyRules
    ? findRule(transaction, [...engine.myRules, rule]) === rule
    : !findRule(transaction, engine.myRules) && findRule(transaction, [...engine.rulesetRules, rule]) === rule

  return isApplied ? null : 'rule'
}

type GetRuleRefProps = {
  rulesetId: string
  number: number
  rulesets: CategoryRuleset[]
}

/**
 * Short reference of a rule of the user, e.g. "MR-003" for "My rules", "R2-014" for the user's second rule set.
 */
export const getRuleRef = ({ rulesetId, number, rulesets }: GetRuleRefProps) => {
  const prefix =
    rulesetId === MY_RULES_ID ? 'MR' : `R${rulesets.find((ruleset) => ruleset.id === rulesetId)?.number ?? '?'}`
  return `${prefix}-${String(number).padStart(3, '0')}`
}

// Rules by rule set, in order, computed once per engine
const groupCache = new WeakMap<CategoryEngine, CompiledCategoryRule[][]>()

const getRuleGroups = (engine: CategoryEngine) => {
  const cached = groupCache.get(engine)
  if (cached) {
    return cached
  }

  const groups = new Map<string, CompiledCategoryRule[]>()
  ;[...engine.myRules, ...engine.rulesetRules].forEach((rule) => {
    const key = rule.rulesetId ?? ''
    groups.set(key, [...(groups.get(key) ?? []), rule])
  })

  const result = [...groups.values()]
  groupCache.set(engine, result)
  return result
}

type GetCategoryConflictsProps = {
  transaction: Transaction
  engine: CategoryEngine
  resolved: ResolvedCategory
}

/**
 * Other rule sets (or "My rules") whose rules match the transaction with a different category than the one it got, e.g.
 * when combining rule sets. Not for categories set for the transaction only, which always win.
 */
export const getCategoryConflicts = ({ transaction, engine, resolved }: GetCategoryConflictsProps) => {
  if (resolved.source !== CategorySource.MY_RULE && resolved.source !== CategorySource.RULESET) {
    return []
  }

  return getRuleGroups(engine)
    .map((rules) => findRule(transaction, rules))
    .filter((rule): rule is CompiledCategoryRule => !!rule && rule.category !== resolved.category)
    .map((rule) => ({ rulesetId: rule.rulesetId ?? '', category: rule.category }))
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
