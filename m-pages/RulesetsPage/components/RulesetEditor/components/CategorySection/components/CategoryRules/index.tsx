'use client'

import { Add, MoreHoriz } from '@mui/icons-material'
import { Box, Button, ButtonBase, IconButton, Typography } from '@mui/material'
import { useMemo, useState } from 'react'

import type {
  CategoryId,
  CategoryMappingRef,
  CategoryRule,
  CategoryRuleset,
  LibraryKeyword,
  LibraryRef as LibraryRefValue,
  MenuSelectOption,
} from '@/types'
import type { CategoryDirection } from '@/types-enums'
import { CategoryRuleDirection, CategoryRuleField } from '@/types-enums'
import { LibraryRef, MenuSelect } from '@/components'
import { getCategoryMappings } from '@/m-category/service'
import { toggleKeys } from '@/utils/Set'
import { useTranslation } from '@/lib/i18n'

import { getMappedKeywords } from '../../actions'
import KeywordDetails from './components/KeywordDetails'
import { ui } from './styled'

type CategoryRulesProps = {
  ruleset: CategoryRuleset
  /**
   * The user's rules the rule set maps to the category, newest first.
   */
  rules: CategoryRule[]
  /**
   * Of the built-in library, for the names of the mapped ones.
   */
  libraryKeywords: LibraryKeyword[]
  /**
   * The user's rules belonging to a tag or library keyword that the rule set doesn't map itself, listed with it.
   */
  linkedRules: CategoryRule[]
  id: CategoryId
  /**
   * Of its parent category, money in or out.
   */
  direction: CategoryDirection
  /**
   * Opens the menu to edit or delete the rule.
   */
  onMenu: (anchor: HTMLElement, rule: CategoryRule) => void
  /**
   * Opens the dialog adding a rule (also in the menu of the category).
   */
  onAdd: () => void
  /**
   * Opens the menu of a library tag or library keyword mapped to the category (show in the library, remove), `name` as shown.
   */
  onMappingMenu: (anchor: HTMLElement, mapping: CategoryMappingRef, name: string) => void
  /**
   * Tags, library keywords and the user's rules that can be added, see `getLibraryPickerOptions`.
   */
  libraryOptions: MenuSelectOption[]
  onAddFromLibrary: (value: string) => void
}

/**
 * What assigns a category: the library tags and library keywords mapped to it, then the user's rules, newest first. A new rule
 * or something from the library is added with the buttons below them.
 */
const Component = ({
  ruleset,
  rules,
  libraryKeywords,
  linkedRules,
  id,
  direction,
  onMenu,
  onAdd,
  onMappingMenu,
  libraryOptions,
  onAddFromLibrary,
}: CategoryRulesProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const mappings = getCategoryMappings(ruleset, id)
  const keywordsById = useMemo(
    () => new Map(libraryKeywords.map((libraryKeyword) => [libraryKeyword.id, libraryKeyword])),
    [libraryKeywords],
  )
  const getMappingName = ({ type, key }: CategoryMappingRef) =>
    type === 'tag' ? t(key, { ns: 'tags' }) : (keywordsById.get(key)?.name ?? key)
  const getLinkedRules = (type: LibraryRefValue['type'], key: string) =>
    linkedRules.filter((rule) => rule.library?.type === type && rule.library.key === key)
  // Mappings showing the library keywords they categorise, collapsed at first
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  return (
    <Box sx={sx.wrapper}>
      {rules.length || mappings.length ? null : (
        <Typography component="p" sx={sx.empty}>
          {t('RULESETS_PAGE.NO_RULES')}
        </Typography>
      )}
      {mappings.map((mapping) => {
        const name = getMappingName(mapping)
        const rowId = `${mapping.direction}:${mapping.type}:${mapping.key}`
        const isExpanded = expanded.has(rowId)
        const mapped = isExpanded ? getMappedKeywords({ mapping, ruleset, libraryKeywords }) : []

        return (
          <Box key={rowId}>
            <Box sx={sx.row}>
              <Box component="span" sx={sx.ref}>
                <LibraryRef type={mapping.type} />
              </Box>
              {/* Like rules: how a library keyword matches */}
              <Box component="span" sx={sx.condition}>
                {mapping.type === 'tag'
                  ? t('RULESETS_PAGE.LIBRARY.TAG')
                  : t(
                      `STATS_PAGE.CATEGORY_RULES.MATCH_TYPES.${keywordsById.get(mapping.key)?.match ?? 'containsWord'}`,
                    )}
              </Box>
              {/* Expands to what the tag or library keyword is made up of */}
              <ButtonBase
                onClick={() => setExpanded((prev) => toggleKeys(prev, [rowId]))}
                aria-expanded={isExpanded}
                sx={sx.toggle}
              >
                <Box component="span" sx={sx.toggleName}>
                  {name}
                </Box>
              </ButtonBase>
              {/* Only when unusual for the category, e.g. refunds (money in) mapped to an expense category */}
              {mapping.direction === direction ? null : (
                <Box component="span" sx={sx.direction}>
                  {t(`RULESETS_PAGE.DIRECTIONS_ONLY.${mapping.direction}`)}
                </Box>
              )}
              <IconButton
                size="small"
                title={t('RULESETS_PAGE.ACTIONS')}
                aria-label={t('RULESETS_PAGE.ACTIONS_NAMED', { name })}
                aria-haspopup="menu"
                onClick={(event) => onMappingMenu(event.currentTarget, mapping, name)}
                className="row-menu"
                sx={sx.menuButton}
              >
                <MoreHoriz fontSize="inherit" />
              </IconButton>
            </Box>
            {/* A tag lists its library keywords, each expanding to what it matches */}
            {isExpanded && mapping.type === 'keyword' && keywordsById.get(mapping.key) ? (
              <Box sx={sx.expanded}>
                <KeywordDetails
                  libraryKeyword={keywordsById.get(mapping.key)!}
                  rules={getLinkedRules('keyword', mapping.key)}
                />
              </Box>
            ) : null}
            {isExpanded && mapping.type === 'tag' ? (
              <Box sx={sx.expanded}>
                {/* The user's rules belonging to the tag, like its library keywords */}
                {getLinkedRules('tag', mapping.key).map((rule) => (
                  <Box key={rule.id} sx={sx.expandedKeyword}>
                    <LibraryRef type="rule" number={rule.number} />
                    <Box component="span" sx={sx.condition}>
                      {t(`STATS_PAGE.CATEGORY_RULES.MATCH_TYPES.${rule.match}`)}
                    </Box>
                    <Box component="span" sx={sx.keyword}>
                      {rule.keyword}
                    </Box>
                  </Box>
                ))}
                {mapped.length ? (
                  mapped.map((libraryKeyword) => {
                    const keywordId = `${rowId}>${libraryKeyword.id}`
                    const isKeywordExpanded = expanded.has(keywordId)

                    return (
                      <Box key={libraryKeyword.id}>
                        <Box sx={sx.expandedKeyword}>
                          <LibraryRef type="keyword" />
                          <ButtonBase
                            onClick={() => setExpanded((prev) => toggleKeys(prev, [keywordId]))}
                            aria-expanded={isKeywordExpanded}
                            sx={sx.toggle}
                          >
                            <Box component="span" sx={sx.expandedName}>
                              {libraryKeyword.name}
                            </Box>
                          </ButtonBase>
                        </Box>
                        {isKeywordExpanded ? (
                          <KeywordDetails
                            libraryKeyword={libraryKeyword}
                            rules={getLinkedRules('keyword', libraryKeyword.id)}
                          />
                        ) : null}
                      </Box>
                    )
                  })
                ) : (
                  <Typography component="p" sx={sx.empty}>
                    {t('RULESETS_PAGE.LIBRARY.NO_KEYWORDS')}
                  </Typography>
                )}
              </Box>
            ) : null}
          </Box>
        )
      })}
      {rules.map((rule) => (
        <Box key={rule.id} sx={sx.row}>
          <Box component="span" sx={sx.ref}>
            <LibraryRef type="rule" number={rule.number} />
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
          {/* Only when limited to the opposite of the category's direction, e.g. refunds of an expense category */}
          {rule.direction === CategoryRuleDirection.ANY || rule.direction === direction ? null : (
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
      {/* Like "Add subcategory" below the subcategories */}
      <Box sx={sx.adds}>
        <Button size="small" startIcon={<Add />} onClick={onAdd} sx={sx.add}>
          {t('RULESETS_PAGE.CREATE_RULE')}
        </Button>
        <MenuSelect
          title={t('RULESETS_PAGE.LIBRARY.ADD_FROM_LIBRARY')}
          value=""
          options={libraryOptions}
          onChange={onAddFromLibrary}
          search={{
            placeholder: t('RULESETS_PAGE.LIBRARY.SEARCH_ALL'),
            noMatches: t('RULESETS_PAGE.LIBRARY.NO_MATCHES'),
          }}
          menuWidth={380}
          renderButton={({ onClick, isOpen }) => (
            <Button
              size="small"
              startIcon={<Add />}
              onClick={onClick}
              aria-haspopup="menu"
              aria-expanded={isOpen || undefined}
              sx={sx.add}
            >
              {t('RULESETS_PAGE.LIBRARY.ADD_FROM_LIBRARY')}
            </Button>
          )}
        />
      </Box>
    </Box>
  )
}

export default Component
