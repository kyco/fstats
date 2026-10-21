import type { TFunction } from 'i18next'

import type { CategoryRuleset, ParentCategoryDef } from '@/types'
import { getCategoryCount } from '@/m-category/service'

type GetCopyNameProps = {
  /**
   * Of the template or rule set it's created from.
   */
  name: string
  rulesets: CategoryRuleset[]
  t: TFunction
}

/**
 * Name of a rule set created from a template or another rule set, e.g. "Standard (copy)", or "Standard (copy 2)" when
 * that's taken.
 */
export const getCopyName = ({ name, rulesets, t }: GetCopyNameProps) => {
  const names = new Set(rulesets.map((ruleset) => ruleset.name))
  let number = 1
  let copyName = t('RULESETS_PAGE.COPY_NAME', { name })

  while (names.has(copyName)) {
    number += 1
    copyName = t('RULESETS_PAGE.COPY_NAME_NUMBER', { name, number })
  }

  return copyName
}

type GetRulesetCountsProps = {
  categories: ParentCategoryDef[]
  ruleCount: number
  mappingCount: number
  t: TFunction
}

/**
 * E.g. "12 categories · 3 rules · 40 library mappings", without rules or mappings when there are none.
 */
export const getRulesetCounts = ({ categories, ruleCount, mappingCount, t }: GetRulesetCountsProps) => {
  return [
    t('RULESETS_PAGE.CATEGORY_COUNT', { count: getCategoryCount(categories) }),
    ...(ruleCount ? [t('RULESETS_PAGE.RULE_COUNT', { count: ruleCount })] : []),
    ...(mappingCount ? [t('RULESETS_PAGE.MAPPING_COUNT', { count: mappingCount })] : []),
  ].join(' · ')
}
