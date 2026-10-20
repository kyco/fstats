import type { CategoryOverride, CategoryRuleset } from '@/types'
import { zCategoryOverride, zCategoryRuleset } from '@/types'
import { parseOrThrow } from '@/lib/zod'

export const syncCategoryRuleset = (dataToSync: CategoryRuleset): CategoryRuleset => {
  return parseOrThrow({ schema: zCategoryRuleset, data: dataToSync, label: 'Cannot sync CategoryRuleset' })
}

export const syncCategoryOverride = (dataToSync: CategoryOverride): CategoryOverride => {
  return parseOrThrow({ schema: zCategoryOverride, data: dataToSync, label: 'Cannot sync CategoryOverride' })
}
