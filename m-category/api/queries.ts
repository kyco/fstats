import { formatISO } from 'date-fns'

import type { CategoryId, CategoryOverride, CategoryRule, CategoryRuleset } from '@/types'
import { db, getStoreSize } from '@/lib/localforage'

import { syncCategoryOverride, syncCategoryRule, syncCategoryRuleset } from './helper'

export const getCategoryRulesets = async (): Promise<CategoryRuleset[]> => {
  const rulesets: CategoryRuleset[] = []
  await db.categoryRulesetsStore.iterate<CategoryRuleset, void>((value) => {
    rulesets.push(value)
  })
  return rulesets
}

export const getCategoryRuleset = async (id: string): Promise<CategoryRuleset> => {
  const stored = await db.categoryRulesetsStore.getItem<CategoryRuleset>(id)

  if (!stored) {
    throw new Error(`Category rule set "${id}" not found`)
  }

  return syncCategoryRuleset(stored)
}

export const putCategoryRuleset = async (ruleset: CategoryRuleset): Promise<CategoryRuleset> => {
  return db.categoryRulesetsStore.setItem<CategoryRuleset>(ruleset.id, syncCategoryRuleset(ruleset))
}

export const removeCategoryRuleset = async (id: string) => {
  await db.categoryRulesetsStore.removeItem(id)
}

export const getCategoryOverrides = async (): Promise<CategoryOverride[]> => {
  const overrides: CategoryOverride[] = []
  await db.categoryOverridesStore.iterate<CategoryOverride, void>((value) => {
    overrides.push(value)
  })
  return overrides
}

export const getStoredCategoryRules = async (): Promise<CategoryRule[]> => {
  const rules: CategoryRule[] = []
  await db.categoryRulesStore.iterate<CategoryRule, void>((value) => {
    rules.push(value)
  })
  return rules
}

export const putCategoryRule = async (rule: CategoryRule): Promise<CategoryRule> => {
  return db.categoryRulesStore.setItem<CategoryRule>(rule.id, syncCategoryRule(rule))
}

export const removeCategoryRule = async (id: string) => {
  await db.categoryRulesStore.removeItem(id)
}

export const getCategoryStoreSize = async () => {
  const sizes = await Promise.all([
    getStoreSize(db.categoryRulesetsStore),
    getStoreSize(db.categoryOverridesStore),
    getStoreSize(db.categoryRulesStore),
  ])
  return sizes.reduce((total, size) => total + size, 0)
}

const toOverrideKey = (rulesetId: string, transactionId: string) => `${rulesetId}:${transactionId}`

export const setCategoryOverride = async (rulesetId: string, transactionId: string, category: CategoryId) => {
  const override: CategoryOverride = { rulesetId, transactionId, category, created: formatISO(new Date()) }
  return db.categoryOverridesStore.setItem<CategoryOverride>(
    toOverrideKey(rulesetId, transactionId),
    syncCategoryOverride(override),
  )
}

export const removeCategoryOverride = async (rulesetId: string, transactionId: string) => {
  await db.categoryOverridesStore.removeItem(toOverrideKey(rulesetId, transactionId))
}

/**
 * Of a removed rule set.
 */
export const removeRulesetOverrides = async (rulesetId: string) => {
  const overrides = await getCategoryOverrides()
  await Promise.all(
    overrides
      .filter((override) => override.rulesetId === rulesetId)
      .map((override) => removeCategoryOverride(rulesetId, override.transactionId)),
  )
}

/**
 * Of a rule set, for a copy of it.
 */
export const copyRulesetOverrides = async (fromId: string, toId: string) => {
  const overrides = await getCategoryOverrides()
  await Promise.all(
    overrides
      .filter((override) => override.rulesetId === fromId)
      .map((override) => setCategoryOverride(toId, override.transactionId, override.category)),
  )
}

export const removeAllCategoryData = async () => {
  await Promise.all([
    db.categoryRulesetsStore.clear(),
    db.categoryOverridesStore.clear(),
    db.categoryRulesStore.clear(),
  ])
}
