'use client'

import { Add, DeleteOutlined, EditOutlined } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import { pick } from 'lodash'
import { Fragment, useState } from 'react'

import type {
  CategoryDialogState,
  CategoryDialogValues,
  CategoryRule,
  CategoryRuleset,
  CategoryTree,
  RuleDialogState,
  RuleDialogValues,
} from '@/types'
import type { CategoryDirection } from '@/types-enums'
import { CategoryRuleDirection, CategoryRuleField, CategoryRuleMatch } from '@/types-enums'
import { DropdownMenu, DropdownMenuDivider, DropdownMenuItem } from '@/components'
import type { RulesetUpdate } from '@/m-category/service'
import {
  addCategory,
  addParentCategory,
  addRule,
  createCategoryCode,
  getCategoryLabel,
  getCategoryRules,
  getDirectionParents,
  getRuleRef,
  moveCategory,
  removeCategory,
  removeRule,
  updateCategory,
  updateRule,
} from '@/m-category/service'
import { toggleKeys } from '@/utils/Set'
import { useTranslation } from '@/lib/i18n'

import { getNextColor, getTemplateLabel } from '../../actions'
import CategoryDialog from './components/CategoryDialog'
import CategoryRow from './components/CategoryRow'
import CategoryRules from './components/CategoryRules'
import RuleDialog from './components/RuleDialog'
import { ui } from './styled'

type CategorySectionProps = {
  ruleset: CategoryRuleset
  /**
   * For the references of the rules, e.g. "R1-003".
   */
  rulesets: CategoryRuleset[]
  tree: CategoryTree
  direction: CategoryDirection
  title: string
  onUpdate: (update: RulesetUpdate) => void
}

/**
 * The parent categories of a direction with their subcategories, the system ones last and fixed. Added and edited in a
 * dialog, subcategories expand to their rules (added, edited and deleted in the menus).
 */
const Component = ({ ruleset, rulesets, tree, direction, title, onUpdate }: CategorySectionProps) => {
  const sx = ui()
  const { t, i18n } = useTranslation()
  const [dialog, setDialog] = useState<CategoryDialogState | null>(null)
  // Parent categories showing their subcategories, and subcategories showing their rules, all collapsed at first
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const toggle = (code: string) => setExpanded((prev) => toggleKeys(prev, [code]))
  const expand = (code: string) => setExpanded((prev) => new Set([...prev, code]))
  // One menu for all categories, and one for all rules
  const [menu, setMenu] = useState<{ anchor: HTMLElement; code: string } | null>(null)
  const [ruleMenu, setRuleMenu] = useState<{ anchor: HTMLElement; rule: CategoryRule } | null>(null)
  const [ruleDialog, setRuleDialog] = useState<RuleDialogState | null>(null)
  const parents = getDirectionParents(tree, direction)
  const ownParents = parents.filter((parent) => !parent.isSystem)

  const remove = (code: string) => {
    const name = getCategoryLabel({ code, tree, t })
    const ruleCount = getCategoryRules(ruleset, code).length
    const text = [
      t('RULESETS_PAGE.CONFIRM_DELETE_CATEGORY', { name }),
      ...(ruleCount ? [t('RULESETS_PAGE.CONFIRM_DELETE_CATEGORY_RULES', { count: ruleCount })] : []),
    ].join(' ')

    if (confirm(text)) {
      onUpdate(removeCategory(code))
    }
  }

  const removeRuleWithConfirm = (rule: CategoryRule) => {
    const ref = getRuleRef({ rulesetId: ruleset.id, number: rule.number, rulesets })
    if (confirm(t('STATS_PAGE.CATEGORY_RULES.CONFIRM_DELETE_RULE', { rule: ref, keyword: rule.keyword }))) {
      onUpdate(removeRule(rule.id))
    }
  }

  const openAddRule = (code: string) => {
    setRuleDialog({ type: 'add', code })
  }

  const saveRule = (values: RuleDialogValues) => {
    if (!ruleDialog) {
      return
    }

    if (ruleDialog.type === 'add') {
      onUpdate(addRule({ ...values, field: CategoryRuleField.DESCRIPTION, category: ruleDialog.code }))
      // Shows it below its category
      expand(ruleDialog.code)
    } else {
      onUpdate(updateRule({ ruleId: ruleDialog.rule.id, rule: values }))
    }

    setRuleDialog(null)
  }

  const getRowProps = (code: string, index: number, count: number) => ({
    label: getCategoryLabel({ code, tree, t }),
    ruleCount: getCategoryRules(ruleset, code).length,
    onMove: (step: -1 | 1) => onUpdate(moveCategory({ code, step })),
    canMoveUp: index > 0,
    canMoveDown: index < count - 1,
    onMenu: (anchor: HTMLElement) => setMenu({ anchor, code }),
  })

  const save = (values: CategoryDialogValues) => {
    if (!dialog) {
      return
    }

    if (dialog.type === 'addParent') {
      // Shown with its first subcategory
      const code = createCategoryCode()
      onUpdate(
        addParentCategory({ label: values.label, direction, color: values.color ?? getNextColor(ruleset), code }),
      )
      expand(code)
    } else if (dialog.type === 'addChild') {
      onUpdate(addCategory({ parentCode: dialog.parentCode, label: values.label, isTransfer: values.isTransfer }))
      expand(dialog.parentCode)
    } else {
      // The translated name of a template's category isn't stored
      const defaultLabel = getTemplateLabel({ code: dialog.code, i18n, t })
      const label = values.label === defaultLabel ? '' : values.label
      onUpdate(updateCategory({ code: dialog.code, label, color: values.color, isTransfer: values.isTransfer }))
    }

    setDialog(null)
  }

  // Of the dialog: what it starts with, whose fields are shown (see `CategoryDialog`)
  const getDialogProps = (state: CategoryDialogState) => {
    if (state.type === 'addParent') {
      return {
        title: t('RULESETS_PAGE.ADD_CATEGORY'),
        initial: { label: '', color: getNextColor(ruleset) },
      }
    }

    if (state.type === 'addChild') {
      return {
        title: t('RULESETS_PAGE.ADD_SUBCATEGORY_TO', {
          name: getCategoryLabel({ code: state.parentCode, tree, t }),
        }),
        initial: { label: '', isTransfer: false },
      }
    }

    const parent = tree.parentsByCode.get(state.code)
    const child = tree.categoriesByCode.get(state.code)
    const defaultLabel = getTemplateLabel({ code: state.code, i18n, t })

    return {
      title: t('RULESETS_PAGE.EDIT_CATEGORY'),
      initial: {
        label: (parent ?? child)?.label ?? defaultLabel ?? '',
        ...(parent ? { color: parent.color } : { isTransfer: !!child?.isTransfer }),
      },
    }
  }

  return (
    <Box component="section">
      <Typography component="h3" sx={sx.title}>
        {title}
      </Typography>

      {parents.map((parent) => (
        <Box key={parent.code} sx={sx.parent}>
          <CategoryRow
            {...getRowProps(parent.code, ownParents.indexOf(parent), ownParents.length)}
            isParent
            isFixed={parent.isSystem}
            color={parent.color}
            // "Uncategorised" has a single, fixed subcategory of the same name
            {...(parent.isSystem ? {} : { isExpanded: expanded.has(parent.code), onToggle: () => toggle(parent.code) })}
          />
          {(parent.isSystem || !expanded.has(parent.code) ? [] : parent.children).map((child, index) => (
            <Fragment key={child.code}>
              <CategoryRow
                {...getRowProps(child.code, index, parent.children.length)}
                isTransfer={child.isTransfer}
                isExpanded={expanded.has(child.code)}
                onToggle={() => toggle(child.code)}
              />
              {expanded.has(child.code) ? (
                <CategoryRules
                  ruleset={ruleset}
                  rulesets={rulesets}
                  code={child.code}
                  onMenu={(anchor, rule) => setRuleMenu({ anchor, rule })}
                  onAdd={() => openAddRule(child.code)}
                />
              ) : null}
            </Fragment>
          ))}
          {parent.isSystem || !expanded.has(parent.code) ? null : (
            <Button
              size="small"
              startIcon={<Add />}
              onClick={() => setDialog({ type: 'addChild', parentCode: parent.code })}
              sx={sx.addChild}
            >
              {t('RULESETS_PAGE.ADD_SUBCATEGORY')}
            </Button>
          )}
        </Box>
      ))}

      <Button size="small" startIcon={<Add />} onClick={() => setDialog({ type: 'addParent' })} sx={sx.add}>
        {t('RULESETS_PAGE.ADD_CATEGORY')}
      </Button>

      <DropdownMenu anchorEl={menu?.anchor} open={!!menu} onClose={() => setMenu(null)}>
        {/* Rules assign subcategories */}
        {menu && tree.categoriesByCode.has(menu.code) ? (
          <DropdownMenuItem
            onClick={() => {
              openAddRule(menu.code)
              setMenu(null)
            }}
            start={<Add sx={sx.menuIcon} />}
            label={t('RULESETS_PAGE.ADD_RULE')}
          />
        ) : null}
        <DropdownMenuItem
          onClick={() => {
            setDialog(menu ? { type: 'edit', code: menu.code } : null)
            setMenu(null)
          }}
          start={<EditOutlined sx={sx.menuIcon} />}
          label={t('RULESETS_PAGE.EDIT')}
        />
        <DropdownMenuDivider />
        <DropdownMenuItem
          onClick={() => {
            if (menu) {
              remove(menu.code)
            }
            setMenu(null)
          }}
          start={<DeleteOutlined sx={{ ...sx.menuIcon, ...sx.delete }} />}
          label={t('RULESETS_PAGE.DELETE')}
          sx={sx.delete}
        />
      </DropdownMenu>

      <DropdownMenu anchorEl={ruleMenu?.anchor} open={!!ruleMenu} onClose={() => setRuleMenu(null)}>
        <DropdownMenuItem
          onClick={() => {
            setRuleDialog(ruleMenu ? { type: 'edit', rule: ruleMenu.rule } : null)
            setRuleMenu(null)
          }}
          start={<EditOutlined sx={sx.menuIcon} />}
          label={t('RULESETS_PAGE.EDIT')}
        />
        <DropdownMenuDivider />
        <DropdownMenuItem
          onClick={() => {
            if (ruleMenu) {
              removeRuleWithConfirm(ruleMenu.rule)
            }
            setRuleMenu(null)
          }}
          start={<DeleteOutlined sx={{ ...sx.menuIcon, ...sx.delete }} />}
          label={t('RULESETS_PAGE.DELETE')}
          sx={sx.delete}
        />
      </DropdownMenu>

      {ruleDialog ? (
        <RuleDialog
          title={
            ruleDialog.type === 'add'
              ? t('RULESETS_PAGE.ADD_RULE_TO', { name: getCategoryLabel({ code: ruleDialog.code, tree, t }) })
              : t('RULESETS_PAGE.EDIT_RULE')
          }
          initial={
            ruleDialog.type === 'add'
              ? {
                  match: CategoryRuleMatch.CONTAINS,
                  keyword: '',
                  ignoreCase: true,
                  direction: CategoryRuleDirection.ANY,
                }
              : pick(ruleDialog.rule, ['match', 'keyword', 'ignoreCase', 'direction'])
          }
          onSave={saveRule}
          onClose={() => setRuleDialog(null)}
        />
      ) : null}

      {dialog ? <CategoryDialog {...getDialogProps(dialog)} onSave={save} onClose={() => setDialog(null)} /> : null}
    </Box>
  )
}

export default Component
