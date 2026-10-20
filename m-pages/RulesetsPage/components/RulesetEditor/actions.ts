import type { i18n as I18n, TFunction } from 'i18next'

import type { CategoryRule, CategoryRuleset } from '@/types'
import type { CategoryColor } from '@/types-enums'
import { zCategoryColor } from '@/types-enums'

type GetTemplateLabelProps = {
  code: string
  i18n: I18n
  t: TFunction
}

/**
 * Translated label of a template's category, `undefined` for categories created by the user.
 */
export const getTemplateLabel = ({ code, i18n, t }: GetTemplateLabelProps) => {
  return i18n.exists(code, { ns: 'categories' }) ? t(code, { ns: 'categories' }) : undefined
}

/**
 * The first colour not used by a parent category yet, so new ones stand out.
 */
export const getNextColor = (ruleset: CategoryRuleset): CategoryColor => {
  const used = new Set(ruleset.categories.map((parent) => parent.color))
  const colors = zCategoryColor.options
  return colors.find((color) => !used.has(color)) ?? colors[ruleset.categories.length % colors.length]
}

/**
 * Newest first, like the transactions.
 */
export const getSortedRules = (rules: CategoryRule[]) => {
  return [...rules].sort((a, b) => b.number - a.number)
}
