import type { TFunction } from 'i18next'

import type { CategoryRuleset, CategoryTemplateDef, ParentCategoryDef, RulesetStartOption } from '@/types'
import { getCategoryCount, isUnchangedTemplate, toTemplateCategories, toTemplateRules } from '@/m-category/service'

import { getCopyName } from '../../actions'

/**
 * Value of the option starting without categories (other than the system ones) and rules.
 */
export const EMPTY_START = 'empty'

export const toTemplateStart = (templateId: string) => `template:${templateId}`

type GetCountsProps = {
  categories: ParentCategoryDef[]
  ruleCount: number
  t: TFunction
}

const getCounts = ({ categories, ruleCount, t }: GetCountsProps) => {
  return `${t('RULESETS_PAGE.CATEGORY_COUNT', { count: getCategoryCount(categories) })} · ${t('RULESETS_PAGE.RULE_COUNT', { count: ruleCount })}`
}

type GetStartGroupsProps = {
  templates: readonly CategoryTemplateDef[]
  rulesets: CategoryRuleset[]
  t: TFunction
}

/**
 * What a rule set can start with, grouped: the templates (and empty), or copies of the user's rule sets that differ
 * from the templates (unchanged ones would be the same as the template). Each with the name it suggests, and the number
 * of categories and rules to tell them apart.
 */
export const getStartGroups = ({ templates, rulesets, t }: GetStartGroupsProps) => {
  const groups: { title: string; options: RulesetStartOption[] }[] = [
    {
      title: t('RULESETS_PAGE.TEMPLATES_TITLE'),
      options: [
        ...templates.map((template) => {
          const name = t(`RULESETS_PAGE.TEMPLATES.${template.id}`)
          return {
            value: toTemplateStart(template.id),
            label: name,
            description: t(`RULESETS_PAGE.TEMPLATE_DESCRIPTIONS.${template.id}`),
            counts: getCounts({
              categories: toTemplateCategories(template),
              ruleCount: toTemplateRules(template).length,
              t,
            }),
            name: getCopyName({ name, rulesets, t }),
          }
        }),
        {
          value: EMPTY_START,
          label: t('RULESETS_PAGE.EMPTY'),
          description: t('RULESETS_PAGE.EMPTY_DESCRIPTION'),
          counts: getCounts({ categories: [], ruleCount: 0, t }),
          name: '',
        },
      ],
    },
    {
      title: t('RULESETS_PAGE.COPIES_TITLE'),
      options: rulesets
        .filter((ruleset) => !isUnchangedTemplate(ruleset))
        .map((ruleset) => ({
          value: `copy:${ruleset.id}`,
          label: ruleset.name,
          counts: getCounts({ categories: ruleset.categories, ruleCount: ruleset.rules.length, t }),
          name: getCopyName({ name: ruleset.name, rulesets, t }),
        })),
    },
  ]
  return groups.filter((group) => group.options.length)
}

/**
 * The template or rule set an option starts with, none for empty.
 */
export const parseStart = (value: string) => {
  const [type, id] = value.split(':')
  return type === 'template' ? { templateId: id } : type === 'copy' ? { copyOfId: id } : {}
}
