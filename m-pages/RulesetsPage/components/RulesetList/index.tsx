'use client'

import {
  Add,
  CheckCircleOutlined,
  ContentCopyOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreHoriz,
} from '@mui/icons-material'
import { Box, Button, ButtonBase, Card, Chip, IconButton, Typography } from '@mui/material'
import { useState } from 'react'

import type { CategoryRuleset } from '@/types'
import { DropdownMenu, DropdownMenuDivider, DropdownMenuItem } from '@/components'
import {
  getMappingCount,
  getRuleCount,
  renameRuleset,
  useMutateAddRuleset,
  useMutateRemoveRuleset,
  useMutateUpdateRuleset,
} from '@/m-category/service'
import { useTranslation } from '@/lib/i18n'

import { getCopyName, getRulesetCounts } from '../../actions'
import RenameDialog from './components/RenameDialog'
import { ui } from './styled'

type RulesetListProps = {
  rulesets: CategoryRuleset[]
  activeId?: string
  selectedId?: string
  /**
   * Shows it in the editor, e.g. a created copy. `null` after deleting it.
   */
  onSelect: (id: string | null) => void
  onActivate: (id: string) => void
  onCreate: () => void
}

/**
 * The user's rule sets, the active one with a badge. Selecting one shows it in the editor, its menu makes it active,
 * renames, duplicates or deletes it.
 */
const Component = ({ rulesets, activeId, selectedId, onSelect, onActivate, onCreate }: RulesetListProps) => {
  const sx = ui()
  const { t } = useTranslation()
  // One menu for all rule sets
  const [menu, setMenu] = useState<{ anchor: HTMLElement; ruleset: CategoryRuleset } | null>(null)
  const { mutateAsync: addRuleset } = useMutateAddRuleset()
  const { mutateAsync: removeRuleset } = useMutateRemoveRuleset()
  const { mutate: updateRuleset } = useMutateUpdateRuleset()
  const [renaming, setRenaming] = useState<CategoryRuleset | null>(null)

  const duplicate = async (ruleset: CategoryRuleset) => {
    const copy = await addRuleset({ name: getCopyName({ name: ruleset.name, rulesets, t }), copyOfId: ruleset.id })
    onSelect(copy.id)
  }

  const remove = async (ruleset: CategoryRuleset) => {
    const text = [
      t('RULESETS_PAGE.CONFIRM_DELETE_RULESET', { name: ruleset.name }),
      ...(rulesets.length === 1 ? [t('RULESETS_PAGE.CONFIRM_DELETE_LAST')] : []),
    ].join(' ')

    if (confirm(text)) {
      await removeRuleset(ruleset.id)
      onSelect(null)
    }
  }

  // Closes the menu first
  const runMenuAction = (action: (ruleset: CategoryRuleset) => unknown) => {
    if (menu) {
      action(menu.ruleset)
    }
    setMenu(null)
  }

  return (
    <Card sx={sx.card}>
      <Typography variant="caption" component="p" sx={sx.title}>
        {t('RULESETS_PAGE.RULESETS')}
      </Typography>

      <Box sx={sx.list}>
        {rulesets.map((ruleset) => (
          // The whole tile is the button, the menu button lies on top of it (not inside it)
          <Box key={ruleset.id} sx={sx.item}>
            <ButtonBase
              onClick={() => onSelect(ruleset.id)}
              aria-current={ruleset.id === selectedId ? 'true' : undefined}
              sx={sx.itemButton(ruleset.id === selectedId, ruleset.id === activeId)}
            >
              <Box component="span" sx={sx.name}>
                {ruleset.name}
              </Box>
              <Box component="span" sx={sx.meta}>
                {getRulesetCounts({
                  categories: ruleset.categories,
                  ruleCount: getRuleCount(ruleset),
                  mappingCount: getMappingCount(ruleset.mappings),
                  t,
                })}
              </Box>
              {/* Absolute, so the tiles are equally high */}
              {ruleset.id === activeId ? (
                <Chip
                  // Inside the button
                  component="span"
                  size="small"
                  color="success"
                  label={t('RULESETS_PAGE.ACTIVE')}
                  sx={sx.badge}
                />
              ) : null}
            </ButtonBase>
            <IconButton
              size="small"
              title={t('RULESETS_PAGE.ACTIONS')}
              aria-label={t('RULESETS_PAGE.ACTIONS_NAMED', { name: ruleset.name })}
              aria-haspopup="menu"
              onClick={(event) => setMenu({ anchor: event.currentTarget, ruleset })}
              sx={sx.menuButton}
            >
              <MoreHoriz fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>

      <Button size="small" startIcon={<Add />} onClick={onCreate} sx={sx.create}>
        {t('RULESETS_PAGE.NEW_RULESET')}
      </Button>

      <DropdownMenu anchorEl={menu?.anchor} open={!!menu} onClose={() => setMenu(null)}>
        <DropdownMenuItem
          onClick={() => runMenuAction((ruleset) => onActivate(ruleset.id))}
          disabled={menu?.ruleset.id === activeId}
          start={<CheckCircleOutlined sx={sx.menuIcon} />}
          label={t('RULESETS_PAGE.ACTIVATE')}
        />
        <DropdownMenuDivider />
        <DropdownMenuItem
          onClick={() => runMenuAction(setRenaming)}
          start={<EditOutlined sx={sx.menuIcon} />}
          label={t('RULESETS_PAGE.RENAME')}
        />
        <DropdownMenuItem
          onClick={() => runMenuAction(duplicate)}
          start={<ContentCopyOutlined sx={sx.menuIcon} />}
          label={t('RULESETS_PAGE.DUPLICATE')}
        />
        <DropdownMenuItem
          onClick={() => runMenuAction(remove)}
          start={<DeleteOutlined sx={{ ...sx.menuIcon, ...sx.deleteIcon }} />}
          label={t('RULESETS_PAGE.DELETE')}
          sx={sx.delete}
        />
      </DropdownMenu>

      {renaming ? (
        <RenameDialog
          name={renaming.name}
          onSave={(name) => {
            updateRuleset({ rulesetId: renaming.id, update: renameRuleset(name) })
            setRenaming(null)
          }}
          onClose={() => setRenaming(null)}
        />
      ) : null}
    </Card>
  )
}

export default Component
