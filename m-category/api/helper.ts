import type { CategoryOverride, CategoryRule, CategoryRuleset } from '@/types'
import { zCategoryOverride, zCategoryRule, zCategoryRuleset } from '@/types'
import { parseOrThrow } from '@/lib/zod'

export const syncCategoryRuleset = (dataToSync: CategoryRuleset): CategoryRuleset => {
  return parseOrThrow({ schema: zCategoryRuleset, data: dataToSync, label: 'Cannot sync CategoryRuleset' })
}

export const syncCategoryOverride = (dataToSync: CategoryOverride): CategoryOverride => {
  return parseOrThrow({ schema: zCategoryOverride, data: dataToSync, label: 'Cannot sync CategoryOverride' })
}

export const syncCategoryRule = (dataToSync: CategoryRule): CategoryRule => {
  return parseOrThrow({ schema: zCategoryRule, data: dataToSync, label: 'Cannot sync CategoryRule' })
}
