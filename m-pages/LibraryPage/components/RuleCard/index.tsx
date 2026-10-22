'use client'

import { DeleteOutlined, EditOutlined, LightbulbOutlined, MoreHoriz } from '@mui/icons-material'
import { Box, IconButton } from '@mui/material'
import { useState } from 'react'

import type { CategoryRule } from '@/types'
import { CategoryRuleDirection, CategoryRuleField } from '@/types-enums'
import { DropdownMenu, DropdownMenuDivider, DropdownMenuItem, LibraryRef } from '@/components'
import { useTranslation } from '@/lib/i18n'

import { getLibraryRefName, toAnchorId } from '../../actions'
import { ui } from './styled'

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
  /**
   * The ID linking to it, off where it's listed a second time (below its tag).
   */
  hasAnchor?: boolean
  onEdit: () => void
  onDelete: () => void
  /**
   * Opens a GitHub issue suggesting it for the library.
   */
  onSuggest: () => void
}

/**
 * One of the user's rules: what it matches, what it belongs to in the library and which categories the rule sets map it
 * to, edited, suggested for the library and deleted in its menu.
 */
const Component = ({ rule, uses, isTarget = false, hasAnchor = true, onEdit, onDelete, onSuggest }: RuleCardProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const condition = [
    ...(rule.field === CategoryRuleField.DESCRIPTION ? [] : [t(`STATS_PAGE.CATEGORY_RULES.FIELDS.${rule.field}`)]),
    t(`STATS_PAGE.CATEGORY_RULES.MATCH_TYPES.${rule.match}`),
    ...(rule.ignoreCase ? [] : [t('STATS_PAGE.CATEGORY_RULES.MATCH_CASE')]),
    ...(rule.direction === CategoryRuleDirection.ANY ? [] : [t(`RULESETS_PAGE.DIRECTIONS_ONLY.${rule.direction}`)]),
  ]

  return (
    <Box id={hasAnchor ? toAnchorId('rule', rule.id) : undefined} sx={sx.card(isTarget)}>
      <Box sx={sx.title}>
        <LibraryRef type="rule" number={rule.number} />
        <Box component="span" sx={sx.name}>
          {rule.keyword}
        </Box>
        <IconButton
          size="small"
          title={t('RULESETS_PAGE.ACTIONS')}
          aria-label={t('RULESETS_PAGE.ACTIONS_NAMED', { name: rule.keyword })}
          aria-haspopup="menu"
          onClick={(event) => setMenuAnchor(event.currentTarget)}
          sx={sx.menuButton}
        >
          <MoreHoriz fontSize="inherit" />
        </IconButton>
      </Box>
      <Box sx={sx.meta}>{condition.join(' · ')}</Box>
      {rule.library ? (
        <Box sx={sx.belongsTo}>
          <LibraryRef type={rule.library.type} />
          {t('LIBRARY_PAGE.BELONGS_TO_NAME', { name: getLibraryRefName(rule.library, t) })}
        </Box>
      ) : null}
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

      <DropdownMenu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        <DropdownMenuItem
          onClick={() => {
            setMenuAnchor(null)
            onEdit()
          }}
          start={<EditOutlined sx={sx.menuIcon} />}
          label={t('RULESETS_PAGE.EDIT')}
        />
        <DropdownMenuItem
          onClick={() => {
            setMenuAnchor(null)
            onSuggest()
          }}
          start={<LightbulbOutlined sx={sx.menuIcon} />}
          label={t('LIBRARY_PAGE.SUGGEST')}
        />
        <DropdownMenuDivider />
        <DropdownMenuItem
          onClick={() => {
            setMenuAnchor(null)
            onDelete()
          }}
          start={<DeleteOutlined sx={{ ...sx.menuIcon, ...sx.delete }} />}
          label={t('RULESETS_PAGE.DELETE_RULE_EVERYWHERE')}
          sx={sx.delete}
        />
      </DropdownMenu>
    </Box>
  )
}

export default Component
