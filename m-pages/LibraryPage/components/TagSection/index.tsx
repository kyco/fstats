'use client'

import { Add, ChevronRight, EditOutlined } from '@mui/icons-material'
import { Box, Button, ButtonBase, IconButton } from '@mui/material'
import type { ReactNode } from 'react'

import type { LibraryKeyword } from '@/types'
import { LibraryRef } from '@/components'
import { useTranslation } from '@/lib/i18n'

import { toAnchorId, toRulesetMapping } from '../../actions'
import KeywordCard from '../KeywordCard'
import { ui } from './styled'

type TagSectionProps = {
  tag: string
  /**
   * Of the tag.
   */
  libraryKeywords: LibraryKeyword[]
  isExpanded: boolean
  onToggle: () => void
  /**
   * Of the linked tag or library keyword, highlighted.
   */
  targetId: string | null
  /**
   * Where the active rule set puts it, see `getMappingSummary`.
   */
  mapping: string | null
  /**
   * Of the active rule set, which `mapping` is of.
   */
  rulesetName: string | null
  /**
   * Where the active rule set puts each of its library keywords mapped on their own.
   */
  getKeywordMapping: (libraryKeyword: LibraryKeyword) => string | null
  /**
   * Opens the dialog choosing its categories (or a library keyword's) in the rule sets.
   */
  onEditMapping: (libraryKeyword?: LibraryKeyword) => void
  /**
   * The user's rules belonging to it or its library keywords, listed first.
   */
  rules: ReactNode
  /**
   * Opens the dialog adding a rule belonging to it.
   */
  onAddRule: () => void
}

/**
 * A tag with where the active rule set puts it, expanding to the user's rules belonging to it and its library
 * keywords. A rule is added to it there, e.g. for another benefit.
 */
const Component = ({
  tag,
  libraryKeywords,
  isExpanded,
  onToggle,
  targetId,
  mapping,
  rulesetName,
  getKeywordMapping,
  onEditMapping,
  rules,
  onAddRule,
}: TagSectionProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const id = toAnchorId('tag', tag)

  return (
    <Box id={id} sx={sx.section}>
      <Box sx={sx.row(id === targetId)}>
        <ButtonBase onClick={onToggle} aria-expanded={isExpanded} sx={sx.header}>
          <ChevronRight sx={sx.chevron(isExpanded)} />
          <LibraryRef type="tag" />
          <Box component="span" sx={sx.label}>
            {t(tag, { ns: 'tags' })}
          </Box>
          <Box component="span" sx={sx.id}>
            {tag}
          </Box>
          <Box component="span" sx={sx.mapping(!mapping)}>
            {toRulesetMapping({ name: rulesetName, mapping: mapping ?? t('RULESETS_PAGE.LIBRARY.NOT_MAPPED'), t })}
          </Box>
          <Box component="span" sx={sx.count}>
            {t('RULESETS_PAGE.LIBRARY.KEYWORD_COUNT', { count: libraryKeywords.length })}
          </Box>
        </ButtonBase>
        <IconButton
          size="small"
          title={t('LIBRARY_PAGE.CHANGE_CATEGORIES')}
          aria-label={t('LIBRARY_PAGE.MAPPING_TITLE', { name: t(tag, { ns: 'tags' }) })}
          onClick={() => onEditMapping()}
          sx={sx.editButton}
        >
          <EditOutlined fontSize="inherit" />
        </IconButton>
      </Box>

      {isExpanded ? (
        <Box sx={sx.body}>
          {rules}
          {libraryKeywords.map((libraryKeyword) => (
            <KeywordCard
              key={libraryKeyword.id}
              libraryKeyword={libraryKeyword}
              isTarget={toAnchorId('keyword', libraryKeyword.id) === targetId}
              mapping={getKeywordMapping(libraryKeyword)}
              rulesetName={rulesetName}
              onEditMapping={() => onEditMapping(libraryKeyword)}
            />
          ))}
          <Button size="small" startIcon={<Add />} onClick={onAddRule} sx={sx.addRule}>
            {t('LIBRARY_PAGE.ADD_RULE_TO_TAG')}
          </Button>
        </Box>
      ) : null}
    </Box>
  )
}

export default Component
