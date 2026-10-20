'use client'

import { MoreHoriz } from '@mui/icons-material'
import { Box, IconButton, Link, Typography } from '@mui/material'

import type { CategoryCode, CategoryRule, CategoryRuleset } from '@/types'
import { CategoryRuleDirection, CategoryRuleField } from '@/types-enums'
import { getCategoryRules, getRuleRef } from '@/m-category/service'
import { Trans, useTranslation } from '@/lib/i18n'

import { getSortedRules } from '../../../../actions'
import { ui } from './styled'

type CategoryRulesProps = {
  ruleset: CategoryRuleset
  rulesets: CategoryRuleset[]
  code: CategoryCode
  /**
   * Opens the menu to edit or delete the rule.
   */
  onMenu: (anchor: HTMLElement, rule: CategoryRule) => void
  /**
   * Opens the dialog adding a rule, linked when there are none (also in the menu of the category).
   */
  onAdd: () => void
}

/**
 * The keyword rules assigning a category, newest first. Added in the menu of the category, or with the link when there
 * are none.
 */
const Component = ({ ruleset, rulesets, code, onMenu, onAdd }: CategoryRulesProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const rules = getSortedRules(getCategoryRules(ruleset, code))

  if (!rules.length) {
    return (
      <Box sx={sx.wrapper}>
        <Typography component="p" sx={sx.empty}>
          <Trans
            i18nKey="RULESETS_PAGE.NO_RULES"
            components={{ add: <Link component="button" type="button" onClick={onAdd} sx={sx.addLink} /> }}
          />
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.wrapper}>
      {rules.map((rule) => (
        <Box key={rule.id} sx={sx.row}>
          <Box component="span" sx={sx.ref}>
            {getRuleRef({ rulesetId: ruleset.id, number: rule.number, rulesets })}
          </Box>
          <Box component="span" sx={sx.condition}>
            {rule.field === CategoryRuleField.DESCRIPTION
              ? null
              : `${t(`STATS_PAGE.CATEGORY_RULES.FIELDS.${rule.field}`)} · `}
            {t(`STATS_PAGE.CATEGORY_RULES.MATCH_TYPES.${rule.match}`)}
          </Box>
          <Box component="span" sx={sx.keyword}>
            {rule.keyword}
          </Box>
          {/* Only when limited, both is the default */}
          {rule.direction === CategoryRuleDirection.ANY ? null : (
            <Box component="span" sx={sx.direction}>
              {t(`RULESETS_PAGE.DIRECTIONS_ONLY.${rule.direction}`)}
            </Box>
          )}
          <IconButton
            size="small"
            title={t('RULESETS_PAGE.ACTIONS')}
            aria-label={t('RULESETS_PAGE.ACTIONS_NAMED', { name: rule.keyword })}
            aria-haspopup="menu"
            onClick={(event) => onMenu(event.currentTarget, rule)}
            className="row-menu"
            sx={sx.menuButton}
          >
            <MoreHoriz fontSize="inherit" />
          </IconButton>
        </Box>
      ))}
    </Box>
  )
}

export default Component
