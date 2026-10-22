import type { TFunction } from 'i18next'

import type { CategoryRule, CategoryRuleset, CategoryTemplateDef, RulesetStartOption } from '@/types'
import { getUsedRuleCount, isUnchangedTemplate, toTemplateCategories } from '@/m-category/service'

import { getCopyName, getRulesetCounts } from '../../actions'

/**
 * Value of the option starting without categories (other than the system ones) and rules.
 */
export const EMPTY_START = 'empty'

export const toTemplateStart = (templateId: string) => `template:${templateId}`

type GetStartGroupsProps = {
  templates: readonly CategoryTemplateDef[]
  rulesets: CategoryRuleset[]
  /**
   * The user's rules, to count those the rule sets use.
   */
  rules: CategoryRule[]
  t: TFunction
}

/**
 * What a rule set can start with, grouped: the templates (and empty), or copies of the user's rule sets that differ
 * from the templates (unchanged ones would be the same as the template). Each with the name it suggests, and the number
 * of categories and rules to tell them apart.
 */
export const getStartGroups = ({ templates, rulesets, rules, t }: GetStartGroupsProps) => {
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
            counts: getRulesetCounts({ categories: toTemplateCategories(template), t }),
            name: getCopyName({ name, rulesets, t }),
          }
        }),
        {
          value: EMPTY_START,
          label: t('RULESETS_PAGE.EMPTY'),
          description: t('RULESETS_PAGE.EMPTY_DESCRIPTION'),
          counts: getRulesetCounts({ categories: [], t }),
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
          counts: getRulesetCounts({
            categories: ruleset.categories,
            ruleCount: getUsedRuleCount({ ruleset, rules }),
            t,
          }),
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
