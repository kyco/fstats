'use client'

import { ArrowDropDown, DeleteOutlined, FilterAltOutlined } from '@mui/icons-material'
import { Box, Button, Checkbox, IconButton, Tooltip } from '@mui/material'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { DropdownMenu, DropdownMenuItem, DropdownMenuSubheader } from '@/components'
import {
  getCustomRulesets,
  useCategoryRulesets,
  useCheckedRulesets,
  useMutateRemoveCategoryRuleset,
} from '@/m-category/service'
import { MY_RULES_ID, RULESETS } from '@/utils/Category'
import { useTranslation } from '@/lib/i18n'

import { getRulesetName, getRulesetsLabel } from './actions'
import { ui } from './styled'

/**
 * Checks the rule sets that categorise the transactions, combined: "My rules", built-in ones and the user's. Categories
 * set for single transactions always apply.
 */
const Component = () => {
  const sx = ui()
  const { t } = useTranslation()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const { rulesetIds, toggleRuleset } = useCheckedRulesets()
  const { data: rulesets = [] } = useCategoryRulesets()
  const { mutate: removeRuleset } = useMutateRemoveCategoryRuleset()
  const customRulesets = getCustomRulesets(rulesets)
  const title = t('STATS_PAGE.CATEGORY_RULES.TITLE')

  const remove = (id: string, name: string) => {
    if (confirm(t('STATS_PAGE.CATEGORY_RULES.CONFIRM_DELETE_RULESET', { name }))) {
      removeRuleset(id)
    }
  }

  const renderItem = (id: string, label: string, end?: ReactNode) => {
    const isChecked = rulesetIds.includes(id)

    return (
      <DropdownMenuItem
        key={id}
        // The menu stays open, so rule sets can be combined
        onClick={() => toggleRuleset(id)}
        role="menuitemcheckbox"
        aria-checked={isChecked}
        start={<Checkbox size="small" checked={isChecked} tabIndex={-1} sx={sx.checkbox} />}
        label={
          <Box component="span" sx={sx.option}>
            <Box component="span" sx={sx.name}>
              {label}
            </Box>
            {end}
          </Box>
        }
      />
    )
  }

  return (
    <>
      <Tooltip title={title}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<FilterAltOutlined />}
          endIcon={<ArrowDropDown />}
          onClick={(event) => setAnchor(event.currentTarget)}
          aria-label={title}
          aria-haspopup="menu"
          aria-expanded={anchor ? true : undefined}
          sx={sx.button}
        >
          <Box component="span" sx={sx.buttonLabel}>
            {getRulesetsLabel({ ids: rulesetIds, rulesets, t })}
          </Box>
        </Button>
      </Tooltip>
      <DropdownMenu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        <DropdownMenuSubheader>{t('STATS_PAGE.CATEGORY_RULES.BUILT_IN')}</DropdownMenuSubheader>
        {RULESETS.map((ruleset) => renderItem(ruleset.id, getRulesetName({ id: ruleset.id, rulesets, t })))}
        <DropdownMenuSubheader>{t('STATS_PAGE.CATEGORY_RULES.CUSTOM')}</DropdownMenuSubheader>
        {/* Applied before the rule sets */}
        {renderItem(MY_RULES_ID, t('STATS_PAGE.CATEGORY_RULES.MY_RULES'))}
        {customRulesets.map((ruleset) =>
          renderItem(
            ruleset.id,
            ruleset.name,
            <Tooltip title={t('STATS_PAGE.CATEGORY_RULES.DELETE_RULESET')}>
              <IconButton
                size="small"
                aria-label={t('STATS_PAGE.CATEGORY_RULES.DELETE_RULESET')}
                onClick={(event) => {
                  event.stopPropagation()
                  remove(ruleset.id, ruleset.name)
                }}
                sx={sx.deleteButton}
              >
                <DeleteOutlined sx={sx.deleteIcon} />
              </IconButton>
            </Tooltip>,
          ),
        )}
      </DropdownMenu>
    </>
  )
}

export default Component
