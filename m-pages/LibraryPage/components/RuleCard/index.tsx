'use client'

import { Box } from '@mui/material'

import type { CategoryRule } from '@/types'
import { CategoryRuleDirection, CategoryRuleField } from '@/types-enums'
import { LibraryRef } from '@/components'
import { useTranslation } from '@/lib/i18n'

import { toAnchorId } from '../../actions'
import { ui } from '../KeywordCard/styled'

type RuleCardProps = {
  rule: CategoryRule
  /**
   * Where it's used, e.g. "Standard → Groceries".
   */
  uses: string[]
  /**
   * Linked, highlighted.
   */
  isTarget?: boolean
}

/**
 * One of the user's rules: what it matches and which categories the rule sets map it to.
 */
const Component = ({ rule, uses, isTarget = false }: RuleCardProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const condition = [
    ...(rule.field === CategoryRuleField.DESCRIPTION ? [] : [t(`STATS_PAGE.CATEGORY_RULES.FIELDS.${rule.field}`)]),
    t(`STATS_PAGE.CATEGORY_RULES.MATCH_TYPES.${rule.match}`),
    ...(rule.ignoreCase ? [] : [t('STATS_PAGE.CATEGORY_RULES.MATCH_CASE')]),
    ...(rule.direction === CategoryRuleDirection.ANY ? [] : [t(`RULESETS_PAGE.DIRECTIONS_ONLY.${rule.direction}`)]),
  ]

  return (
    <Box id={toAnchorId('rule', rule.id)} sx={sx.card(isTarget)}>
      <Box sx={sx.title}>
        <LibraryRef type="rule" number={rule.number} />
        <Box component="span" sx={sx.name}>
          {rule.keyword}
        </Box>
      </Box>
      <Box sx={sx.meta}>{condition.join(' · ')}</Box>
      <Box sx={sx.examplesTitle}>{t('LIBRARY_PAGE.USED_IN')}</Box>
      {uses.length ? (
        uses.map((use) => (
          <Box key={use} sx={sx.meta}>
            {use}
          </Box>
        ))
      ) : (
        <Box sx={sx.meta}>{t('LIBRARY_PAGE.NOT_USED')}</Box>
      )}
    </Box>
  )
}

export default Component
