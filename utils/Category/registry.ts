import type { ParentCategoryDef } from '@/types'
import { CategoryDirection } from '@/types-enums'

import { defaultTemplate, minimalGermanyTemplate } from './templates'

/**
 * The templates users can create a rule set from, see `createRulesetFromTemplate`.
 */
export const TEMPLATES = [defaultTemplate, minimalGermanyTemplate] as const

export type TemplateId = (typeof TEMPLATES)[number]['id']

/**
 * Rule set of new users.
 */
export const DEFAULT_TEMPLATE_ID: TemplateId = 'default'

export const getTemplate = (id: string) => {
  return TEMPLATES.find((template) => template.id === id)
}

/**
 * Of every rule set, can't be changed: uncategorised, for money in and out, where transactions no rule matches end up.
 * Listed after the user's categories.
 */
export const SYSTEM_CATEGORIES: ParentCategoryDef[] = [
  {
    code: 'TFI',
    color: 'blueGrey',
    direction: CategoryDirection.IN,
    children: [{ code: 'TFI_02' }],
  },
  {
    code: 'TFO',
    color: 'blueGrey',
    direction: CategoryDirection.OUT,
    children: [{ code: 'TFO_02' }],
  },
]
