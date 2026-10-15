import type { TFunction } from 'i18next'

import type { CategoryRuleset } from '@/types'
import { getBuiltInRuleset, MY_RULES_ID } from '@/utils/Category'

type GetRulesetNameProps = {
  id: string
  rulesets: CategoryRuleset[]
  t: TFunction
}

/**
 * Translated for built-in rule sets, as named by the user otherwise.
 */
export const getRulesetName = ({ id, rulesets, t }: GetRulesetNameProps) => {
  if (id === MY_RULES_ID) {
    return t('STATS_PAGE.CATEGORY_RULES.MY_RULES')
  }

  if (getBuiltInRuleset(id)) {
    return t(`STATS_PAGE.CATEGORY_RULES.RULESETS.${id}`)
  }

  return rulesets.find((ruleset) => ruleset.id === id)?.name ?? id
}

type GetRulesetsLabelProps = {
  ids: string[]
  rulesets: CategoryRuleset[]
  t: TFunction
}

/**
 * The first checked rule set and how many more, e.g. "Standard +2", or "No rule set".
 */
export const getRulesetsLabel = ({ ids, rulesets, t }: GetRulesetsLabelProps) => {
  if (!ids.length) {
    return t('STATS_PAGE.CATEGORY_RULES.NONE')
  }

  const name = getRulesetName({ id: ids[0], rulesets, t })
  return ids.length > 1 ? `${name} +${ids.length - 1}` : name
}
