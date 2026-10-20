import { formatISO } from 'date-fns'

import type { CategoryCode, CategoryOverride, CategoryRuleset } from '@/types'
import { db, getStoreSize } from '@/lib/localforage'

import { syncCategoryOverride, syncCategoryRuleset } from './helper'

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

export const getCategoryStoreSize = async () => {
  const sizes = await Promise.all([getStoreSize(db.categoryRulesetsStore), getStoreSize(db.categoryOverridesStore)])
  return sizes[0] + sizes[1]
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
