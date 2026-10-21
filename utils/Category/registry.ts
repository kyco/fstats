import { dePack, fnbPack, gbPack, globalPack, zaPack } from './library'
import { defaultTemplate } from './templates'

/**
 * The templates users can create a rule set from, see `createRuleset`.
 */
export const TEMPLATES = [defaultTemplate] as const

/**
 * The packs of library keywords recognising transactions, see `docs/categorisation.md`.
 */
export const LIBRARY = [globalPack, dePack, gbPack, zaPack, fnbPack] as const

export type TemplateId = (typeof TEMPLATES)[number]['id']

/**
 * Rule set of new users.
 */
export const DEFAULT_TEMPLATE_ID: TemplateId = 'default'

export const getTemplate = (id: string) => {
  return TEMPLATES.find((template) => template.id === id)
}
