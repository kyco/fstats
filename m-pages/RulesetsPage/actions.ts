import type { TFunction } from 'i18next'

import type { CategoryRuleset } from '@/types'

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
