import { formatISO } from 'date-fns'

import type { CategoryCode, CategoryOverride, CategoryRule, CategoryRuleset, CategoryRulesetAtRest } from '@/types'
import { MY_RULES_ID } from '@/utils/Category'
import { db, getStoreSize } from '@/lib/localforage'

import { getNextNumber, syncCategoryOverride, syncCategoryRuleset, withNumbers } from './helper'

export const getCategoryRulesets = async (): Promise<CategoryRuleset[]> => {
  const stored: CategoryRulesetAtRest[] = []
  await db.categoryRulesetsStore.iterate<CategoryRulesetAtRest, void>((value) => {
    stored.push(value)
  })

  // Numbers are stored once given, so they stay the same. Syncing adds other fields of newer versions, e.g. the match
  // type of rules.
  return Promise.all(
    withNumbers(stored).map(({ ruleset, isChanged }) =>
      isChanged
        ? db.categoryRulesetsStore.setItem<CategoryRuleset>(ruleset.id, syncCategoryRuleset(ruleset))
        : syncCategoryRuleset(ruleset),
    ),
  )
}

export const getCategoryOverrides = async (): Promise<CategoryOverride[]> => {
  const overrides: CategoryOverride[] = []
  await db.categoryOverridesStore.iterate<CategoryOverride, void>((value) => {
    overrides.push(value)
  })
  return overrides
}

export const getCategoryStoreSize = async () => {
  const sizes = await Promise.all([getStoreSize(db.categoryRulesetsStore), getStoreSize(db.categoryOverridesStore)])
  return sizes[0] + sizes[1]
}

type AddCategoryRulesetProps = {
  name: string
  rules: Omit<CategoryRule, 'id' | 'number'>[]
}

export const addCategoryRuleset = async ({ name, rules }: AddCategoryRulesetProps): Promise<CategoryRuleset> => {
  const created = formatISO(new Date())
  const number = getNextNumber(await getCategoryRulesets())
  const ruleset: CategoryRuleset = {
    id: crypto.randomUUID(),
    number,
    name,
    rules: rules.map((rule, index) => ({ ...rule, id: crypto.randomUUID(), number: index + 1 })),
    created,
    modified: created,
  }

  return db.categoryRulesetsStore.setItem<CategoryRuleset>(ruleset.id, syncCategoryRuleset(ruleset))
}

export const removeCategoryRuleset = async (id: string) => {
  await db.categoryRulesetsStore.removeItem(id)
}

type UpdateRulesProps = {
  rulesetId: string
  update: (rules: CategoryRule[]) => CategoryRule[]
}

/**
 * "My rules" is created with its first rule.
 */
const updateRules = async ({ rulesetId, update }: UpdateRulesProps): Promise<CategoryRuleset> => {
  const now = formatISO(new Date())
  // Numbered, see `getCategoryRulesets`
  const stored = (await getCategoryRulesets()).find((ruleset) => ruleset.id === rulesetId)

  if (!stored && rulesetId !== MY_RULES_ID) {
    throw new Error(`Category rule set "${rulesetId}" not found`)
  }

  const ruleset = stored ?? { id: MY_RULES_ID, number: 0, name: 'My rules', rules: [], created: now, modified: now }

  return db.categoryRulesetsStore.setItem<CategoryRuleset>(
    rulesetId,
    syncCategoryRuleset({ ...ruleset, rules: update(ruleset.rules), modified: now }),
  )
}

type AddCategoryRuleProps = {
  rulesetId: string
  rule: Omit<CategoryRule, 'id' | 'number'>
}

export const addCategoryRule = ({ rulesetId, rule }: AddCategoryRuleProps) => {
  return updateRules({
    rulesetId,
    update: (rules) => [...rules, { ...rule, id: crypto.randomUUID(), number: getNextNumber(rules) }],
  })
}

type RemoveCategoryRuleProps = {
  rulesetId: string
  ruleId: string
}

export const removeCategoryRule = ({ rulesetId, ruleId }: RemoveCategoryRuleProps) => {
  return updateRules({ rulesetId, update: (rules) => rules.filter((rule) => rule.id !== ruleId) })
}

export const setCategoryOverride = async (transactionId: string, category: CategoryCode) => {
  const override: CategoryOverride = { transactionId, category, created: formatISO(new Date()) }
  return db.categoryOverridesStore.setItem<CategoryOverride>(transactionId, syncCategoryOverride(override))
}

export const removeCategoryOverride = async (transactionId: string) => {
  await db.categoryOverridesStore.removeItem(transactionId)
}

export const removeAllCategoryData = async () => {
  await Promise.all([db.categoryRulesetsStore.clear(), db.categoryOverridesStore.clear()])
}
