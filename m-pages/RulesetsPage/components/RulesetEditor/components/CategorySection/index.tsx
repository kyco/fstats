'use client'

import { Add, DeleteOutlined, EditOutlined, LibraryAddOutlined, LinkOff, MenuBookOutlined } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import { pick } from 'lodash'
import { useRouter } from 'next/navigation'
import { Fragment, useMemo, useState } from 'react'

import type {
  CategoryDialogState,
  CategoryDialogValues,
  CategoryId,
  CategoryMappingRef,
  CategoryRule,
  CategoryRuleset,
  CategoryTree,
  RuleDialogState,
  RuleDialogValues,
} from '@/types'
import type { CategoryDirection } from '@/types-enums'
import { CategoryRuleDirection, CategoryRuleField, CategoryRuleMatch } from '@/types-enums'
import { getLibraryHref } from '@/common'
import {
  DropdownMenu,
  DropdownMenuDivider,
  DropdownMenuItem,
  LibraryRef,
  MenuSelect,
  NewCategoryDialog,
  RuleDialog,
} from '@/components'
import type { RulesetUpdate } from '@/m-category/service'
import {
  addCategory,
  addNamedCategory,
  addParentCategory,
  createCategoryId,
  getCategoryLabel,
  getCategoryMappings,
  getCategoryOptions,
  getCategoryRules,
  getDirectionParents,
  getLibraryKeywords,
  getNextColor,
  getRuleRef,
  moveCategory,
  removeCategory,
  removeMapping,
  setKeywordMapping,
  setRuleMapping,
  setTagMapping,
  updateCategory,
  useCategoryRules,
  useMutateAddCategoryRule,
  useMutateRemoveCategoryRule,
  useMutateUpdateCategoryRule,
} from '@/m-category/service'
import { toggleKeys } from '@/utils/Set'
import { useTranslation } from '@/lib/i18n'

import { getTemplateLabel } from '../../actions'
import { getLibraryPickerOptions, toLibraryMapping, toLibraryRefProps } from './actions'
import CategoryDialog from './components/CategoryDialog'
import CategoryRow from './components/CategoryRow'
import CategoryRules from './components/CategoryRules'
import MappingCategoryDialog from './components/MappingCategoryDialog'
import { ui } from './styled'

type CategorySectionProps = {
  ruleset: CategoryRuleset
  /**
   * To tell where the user's rules are used too.
   */
  rulesets: CategoryRuleset[]
  tree: CategoryTree
  direction: CategoryDirection
  title: string
  onUpdate: (update: RulesetUpdate) => void
}

const NO_RULES: CategoryRule[] = []

/**
 * The parent categories of a direction with their subcategories, the system ones last and fixed. Added and edited in a
 * dialog, subcategories expand to what assigns them: library tags and library keywords, and the user's rules (added there,
 * changed in the menus).
 */
const Component = ({ ruleset, rulesets, tree, direction, title, onUpdate }: CategorySectionProps) => {
  const sx = ui()
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [dialog, setDialog] = useState<CategoryDialogState | null>(null)
  // Parent categories showing their subcategories, and subcategories showing their rules, all collapsed at first
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const toggle = (id: string) => setExpanded((prev) => toggleKeys(prev, [id]))
  const expand = (id: string) => setExpanded((prev) => new Set([...prev, id]))
  // One menu for all categories, and one for all rules
  const [menu, setMenu] = useState<{ anchor: HTMLElement; id: CategoryId } | null>(null)
  const [ruleMenu, setRuleMenu] = useState<{ anchor: HTMLElement; rule: CategoryRule } | null>(null)
  const [mappingMenu, setMappingMenu] = useState<{
    anchor: HTMLElement
    mapping: CategoryMappingRef
    name: string
  } | null>(null)
  const [ruleDialog, setRuleDialog] = useState<RuleDialogState | null>(null)
  // "Add rule or tag from library" in the menu of a subcategory, opened at its menu button
  const [libraryPicker, setLibraryPicker] = useState<{ anchor: HTMLElement; id: CategoryId } | null>(null)
  // Moving a tag or library keyword to another category, which can be created first
  const [mappingDialog, setMappingDialog] = useState<{ mapping: CategoryMappingRef; name: string } | null>(null)
  const [creating, setCreating] = useState<{ name: string; mapping: CategoryMappingRef } | null>(null)
  const parents = getDirectionParents(tree, direction)
  const { data: rules = NO_RULES } = useCategoryRules()
  const { mutateAsync: addRule } = useMutateAddCategoryRule()
  const { mutateAsync: updateRule } = useMutateUpdateCategoryRule()
  const { mutateAsync: deleteRule } = useMutateRemoveCategoryRule()
  const libraryKeywords = useMemo(() => getLibraryKeywords(), [])
  const getRules = (id: CategoryId) => getCategoryRules({ ruleset, rules, id })
  // Categorised like their tag or library keyword in this rule set
  const linkedRules = rules.filter((rule) => rule.library && !(rule.id in ruleset.rules))

  const remove = (id: CategoryId) => {
    const name = getCategoryLabel({ id, tree, t })
    const ruleCount = getRules(id).length
    const mappingCount = getCategoryMappings(ruleset, id).length
    const text = [
      t('RULESETS_PAGE.CONFIRM_DELETE_CATEGORY', { name }),
      ...(ruleCount ? [t('RULESETS_PAGE.CONFIRM_DELETE_CATEGORY_RULES', { count: ruleCount })] : []),
      ...(mappingCount ? [t('RULESETS_PAGE.CONFIRM_DELETE_CATEGORY_MAPPINGS', { count: mappingCount })] : []),
    ].join(' ')

    if (confirm(text)) {
      onUpdate(removeCategory(id))
    }
  }

  // From this rule set, it stays in the user's library
  const removeRuleWithConfirm = (rule: CategoryRule) => {
    const values = { rule: getRuleRef(rule.number), keyword: rule.keyword, name: ruleset.name }
    if (confirm(t('STATS_PAGE.CATEGORY_RULES.CONFIRM_REMOVE_RULE', values))) {
      onUpdate(setRuleMapping({ ruleId: rule.id, category: undefined }))
    }
  }

  // From the user's library and all rule sets
  const deleteRuleWithConfirm = (rule: CategoryRule) => {
    const values = { rule: getRuleRef(rule.number), keyword: rule.keyword }
    if (confirm(t('STATS_PAGE.CATEGORY_RULES.CONFIRM_DELETE_RULE', values))) {
      deleteRule(rule.id)
    }
  }

  // Other rule sets using the rule, which an edit changes too
  const getOtherUses = (rule: CategoryRule) =>
    rulesets.filter((other) => other.id !== ruleset.id && rule.id in other.rules).length

  const openAddRule = (id: CategoryId) => {
    setRuleDialog({ type: 'add', id })
  }

  const saveRule = (values: RuleDialogValues) => {
    if (!ruleDialog) {
      return
    }

    if (ruleDialog.type === 'add') {
      addRule({
        rule: { ...values, field: CategoryRuleField.DESCRIPTION },
        rulesetId: ruleset.id,
        category: ruleDialog.id,
      })
      // Shows it below its category
      expand(ruleDialog.id)
    } else {
      updateRule({ rule: { ...ruleDialog.rule, ...values } })
    }

    setRuleDialog(null)
  }

  const toMappingUpdate = ({ type, key, direction: mappingDirection }: CategoryMappingRef, category: CategoryId) =>
    (type === 'tag' ? setTagMapping : setKeywordMapping)({ direction: mappingDirection, key, category })

  // Where it's mapped now, it's only shown under a category
  const getMappedCategory = ({ type, key, direction: mappingDirection }: CategoryMappingRef) => {
    const mappings = ruleset.mappings[mappingDirection]
    return (type === 'tag' ? mappings.tags[key] : mappings.keywords[key]) as CategoryId
  }

  const createAndMap = ({ label, parentId }: { label: string; parentId: CategoryId | null }) => {
    if (creating) {
      const { id, update } = addNamedCategory({ ruleset, label, parentId, direction: creating.mapping.direction })
      onUpdate((current) => toMappingUpdate(creating.mapping, id)(update(current)))
    }
    setCreating(null)
  }

  const getLibraryOptions = (id: CategoryId) =>
    getLibraryPickerOptions({ ruleset, rules, libraryKeywords, id, direction, tree, t }).map((option) => ({
      ...option,
      start: <LibraryRef {...toLibraryRefProps(option.value, rules)} />,
    }))

  const getRowProps = (id: CategoryId, index: number, count: number) => ({
    label: getCategoryLabel({ id, tree, t }),
    ruleCount: getRules(id).length,
    mappingCount: getCategoryMappings(ruleset, id).length,
    onMove: (step: -1 | 1) => onUpdate(moveCategory({ id, step })),
    canMoveUp: index > 0,
    canMoveDown: index < count - 1,
    onMenu: (anchor: HTMLElement) => setMenu({ anchor, id }),
  })

  const save = (values: CategoryDialogValues) => {
    if (!dialog) {
      return
    }

    if (dialog.type === 'addParent') {
      // Shown with its first subcategory
      const id = createCategoryId()
      onUpdate(addParentCategory({ label: values.label, direction, color: values.color ?? getNextColor(ruleset), id }))
      expand(id)
    } else if (dialog.type === 'addChild') {
      onUpdate(addCategory({ parentId: dialog.parentId, label: values.label, isTransfer: values.isTransfer }))
      expand(dialog.parentId)
    } else {
      // The translated name of a template's category isn't stored
      const defaultLabel = getTemplateLabel({ id: dialog.id, i18n, t })
      const label = values.label === defaultLabel ? '' : values.label
      onUpdate(updateCategory({ id: dialog.id, label, color: values.color, isTransfer: values.isTransfer }))
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
          name: getCategoryLabel({ id: state.parentId, tree, t }),
        }),
        initial: { label: '', isTransfer: false },
      }
    }

    const parent = tree.parentsById.get(state.id)
    const child = tree.categoriesById.get(state.id)
    const defaultLabel = getTemplateLabel({ id: state.id, i18n, t })

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
        <Box key={parent.id} sx={sx.parent}>
          <CategoryRow
            {...getRowProps(parent.id, parents.indexOf(parent), parents.length)}
            isParent
            color={parent.color}
            isExpanded={expanded.has(parent.id)}
            onToggle={() => toggle(parent.id)}
          />
          {(expanded.has(parent.id) ? parent.children : []).map((child, index) => (
            <Fragment key={child.id}>
              <CategoryRow
                {...getRowProps(child.id, index, parent.children.length)}
                isTransfer={child.isTransfer}
                isExpanded={expanded.has(child.id)}
                onToggle={() => toggle(child.id)}
              />
              {expanded.has(child.id) ? (
                <CategoryRules
                  ruleset={ruleset}
                  rules={getRules(child.id)}
                  libraryKeywords={libraryKeywords}
                  linkedRules={linkedRules}
                  id={child.id}
                  direction={direction}
                  onMenu={(anchor, rule) => setRuleMenu({ anchor, rule })}
                  onAdd={() => openAddRule(child.id)}
                  onMappingMenu={(anchor, mapping, name) => setMappingMenu({ anchor, mapping, name })}
                  libraryOptions={getLibraryOptions(child.id)}
                  onAddFromLibrary={(value) => onUpdate(toLibraryMapping({ value, id: child.id, direction }))}
                />
              ) : null}
            </Fragment>
          ))}
          {!expanded.has(parent.id) ? null : (
            <Button
              size="small"
              startIcon={<Add />}
              onClick={() => setDialog({ type: 'addChild', parentId: parent.id })}
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
        {menu && tree.categoriesById.has(menu.id) ? (
          <DropdownMenuItem
            onClick={() => {
              openAddRule(menu.id)
              setMenu(null)
            }}
            start={<Add sx={sx.menuIcon} />}
            label={t('RULESETS_PAGE.CREATE_RULE')}
          />
        ) : null}
        {menu && tree.categoriesById.has(menu.id) ? (
          <DropdownMenuItem
            onClick={() => {
              setLibraryPicker(menu)
              setMenu(null)
            }}
            start={<LibraryAddOutlined sx={sx.menuIcon} />}
            label={t('RULESETS_PAGE.LIBRARY.ADD_FROM_LIBRARY')}
          />
        ) : null}
        <DropdownMenuItem
          onClick={() => {
            setDialog(menu ? { type: 'edit', id: menu.id } : null)
            setMenu(null)
          }}
          start={<EditOutlined sx={sx.menuIcon} />}
          label={t('RULESETS_PAGE.EDIT')}
        />
        <DropdownMenuDivider />
        <DropdownMenuItem
          onClick={() => {
            if (menu) {
              remove(menu.id)
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
        <DropdownMenuItem
          onClick={() => {
            if (ruleMenu) {
              router.push(getLibraryHref({ rule: ruleMenu.rule.id }))
            }
            setRuleMenu(null)
          }}
          start={<MenuBookOutlined sx={sx.menuIcon} />}
          label={t('RULESETS_PAGE.LIBRARY.SHOW_IN_LIBRARY')}
        />
        <DropdownMenuDivider />
        <DropdownMenuItem
          onClick={() => {
            if (ruleMenu) {
              removeRuleWithConfirm(ruleMenu.rule)
            }
            setRuleMenu(null)
          }}
          start={<LinkOff sx={{ ...sx.menuIcon, ...sx.delete }} />}
          label={t('RULESETS_PAGE.LIBRARY.REMOVE_MAPPING')}
          sx={sx.delete}
        />
        <DropdownMenuItem
          onClick={() => {
            if (ruleMenu) {
              deleteRuleWithConfirm(ruleMenu.rule)
            }
            setRuleMenu(null)
          }}
          start={<DeleteOutlined sx={{ ...sx.menuIcon, ...sx.delete }} />}
          label={t('RULESETS_PAGE.DELETE_RULE_EVERYWHERE')}
          sx={sx.delete}
        />
      </DropdownMenu>

      <DropdownMenu anchorEl={mappingMenu?.anchor} open={!!mappingMenu} onClose={() => setMappingMenu(null)}>
        <DropdownMenuItem
          onClick={() => {
            if (mappingMenu) {
              const { type, key } = mappingMenu.mapping
              router.push(getLibraryHref(type === 'tag' ? { tag: key } : { keyword: key }))
            }
            setMappingMenu(null)
          }}
          start={<MenuBookOutlined sx={sx.menuIcon} />}
          label={t('RULESETS_PAGE.LIBRARY.SHOW_IN_LIBRARY')}
        />
        <DropdownMenuItem
          onClick={() => {
            setMappingDialog(mappingMenu ? pick(mappingMenu, ['mapping', 'name']) : null)
            setMappingMenu(null)
          }}
          start={<EditOutlined sx={sx.menuIcon} />}
          label={t('RULESETS_PAGE.CHANGE_CATEGORY')}
        />
        <DropdownMenuDivider />
        <DropdownMenuItem
          onClick={() => {
            if (mappingMenu && confirm(t('RULESETS_PAGE.LIBRARY.CONFIRM_REMOVE_MAPPING', { name: mappingMenu.name }))) {
              onUpdate(removeMapping(mappingMenu.mapping))
            }
            setMappingMenu(null)
          }}
          start={<LinkOff sx={{ ...sx.menuIcon, ...sx.delete }} />}
          label={t('RULESETS_PAGE.LIBRARY.REMOVE_MAPPING')}
          sx={sx.delete}
        />
      </DropdownMenu>

      {ruleDialog ? (
        <RuleDialog
          title={
            ruleDialog.type === 'add'
              ? t('RULESETS_PAGE.ADD_RULE_TO', { name: getCategoryLabel({ id: ruleDialog.id, tree, t }) })
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
          note={
            ruleDialog.type === 'edit' && getOtherUses(ruleDialog.rule)
              ? t('RULESETS_PAGE.EDIT_RULE_SHARED', { count: getOtherUses(ruleDialog.rule) })
              : undefined
          }
          onSave={saveRule}
          onClose={() => setRuleDialog(null)}
        />
      ) : null}

      {libraryPicker ? (
        <MenuSelect
          title={t('RULESETS_PAGE.LIBRARY.ADD_FROM_LIBRARY')}
          value=""
          options={getLibraryOptions(libraryPicker.id)}
          onChange={(value) => {
            onUpdate(toLibraryMapping({ value, id: libraryPicker.id, direction }))
            // Shows what was added below the subcategory
            expand(libraryPicker.id)
          }}
          search={{
            placeholder: t('RULESETS_PAGE.LIBRARY.SEARCH_ALL'),
            noMatches: t('RULESETS_PAGE.LIBRARY.NO_MATCHES'),
          }}
          menuWidth={380}
          anchorEl={libraryPicker.anchor}
          onClose={() => setLibraryPicker(null)}
        />
      ) : null}

      {mappingDialog ? (
        <MappingCategoryDialog
          name={mappingDialog.name}
          note={t(`RULESETS_PAGE.DIRECTIONS_ONLY.${mappingDialog.mapping.direction}`)}
          initial={getMappedCategory(mappingDialog.mapping)}
          options={getCategoryOptions({ tree, direction: mappingDialog.mapping.direction, t })}
          onSave={(category) => {
            onUpdate(toMappingUpdate(mappingDialog.mapping, category))
            setMappingDialog(null)
          }}
          onCreate={(name) => {
            setCreating({ name, mapping: mappingDialog.mapping })
            setMappingDialog(null)
          }}
          onClose={() => setMappingDialog(null)}
        />
      ) : null}

      {creating ? (
        <NewCategoryDialog
          name={creating.name}
          tree={tree}
          direction={creating.mapping.direction}
          onSave={createAndMap}
          onClose={() => setCreating(null)}
        />
      ) : null}

      {dialog ? <CategoryDialog {...getDialogProps(dialog)} onSave={save} onClose={() => setDialog(null)} /> : null}
    </Box>
  )
}

export default Component
