'use client'

import { EditOutlined } from '@mui/icons-material'
import { Box, IconButton } from '@mui/material'

import type { LibraryKeyword } from '@/types'
import { CategoryRuleDirection, CategoryRuleMatch } from '@/types-enums'
import { LibraryRef } from '@/components'
import { BANKS } from '@/utils/Parser'
import { useTranslation } from '@/lib/i18n'

import { toAnchorId, toRulesetMapping } from '../../actions'
import { ui } from './styled'

type KeywordCardProps = {
  libraryKeyword: LibraryKeyword
  /**
   * Its tags, e.g. in search results, where it isn't listed under them.
   */
  showTag?: boolean
  /**
   * Linked, highlighted.
   */
  isTarget?: boolean
  /**
   * Where the active rule set puts it, when mapped on its own, see `getMappingSummary`.
   */
  mapping: string | null
  /**
   * Of the active rule set, which `mapping` is of.
   */
  rulesetName: string | null
  /**
   * Opens the dialog choosing its categories in the rule sets.
   */
  onEditMapping: () => void
}

/**
 * What a library keyword recognises: its keywords (and how they match), limits and example descriptions, and where the
 * active rule set puts it when not where its tag goes.
 */
const Component = ({
  libraryKeyword,
  showTag = false,
  isTarget = false,
  mapping,
  rulesetName,
  onEditMapping,
}: KeywordCardProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const bankName = libraryKeyword.bank
    ? (BANKS.find((bank) => bank.id === libraryKeyword.bank)?.name ?? libraryKeyword.bank)
    : null
  const limits = [
    ...(bankName ? [t('LIBRARY_PAGE.ONLY_BANK', { bank: bankName })] : []),
    ...(libraryKeyword.countries
      ? [
          t('LIBRARY_PAGE.ONLY_COUNTRIES', {
            countries: libraryKeyword.countries.map((country) => t(`COUNTRY.${country}`)).join(', '),
          }),
        ]
      : []),
    ...(libraryKeyword.direction === CategoryRuleDirection.ANY
      ? []
      : [t(`RULESETS_PAGE.DIRECTIONS_ONLY.${libraryKeyword.direction}`)]),
    ...(libraryKeyword.match === CategoryRuleMatch.CONTAINS_WORD
      ? []
      : [t(`STATS_PAGE.CATEGORY_RULES.MATCH_TYPES.${libraryKeyword.match}`)]),
  ]

  return (
    <Box id={toAnchorId('keyword', libraryKeyword.id)} sx={sx.card(isTarget)}>
      <Box sx={sx.title}>
        <LibraryRef type="keyword" />
        <Box component="span" sx={sx.name}>
          {libraryKeyword.name}
        </Box>
        <Box component="span" sx={sx.id}>
          {libraryKeyword.id}
        </Box>
        <IconButton
          size="small"
          title={t('LIBRARY_PAGE.CHANGE_CATEGORIES')}
          aria-label={t('LIBRARY_PAGE.MAPPING_TITLE', { name: libraryKeyword.name })}
          onClick={onEditMapping}
          sx={sx.editButton}
        >
          <EditOutlined fontSize="inherit" />
        </IconButton>
      </Box>

      {showTag ? <Box sx={sx.meta}>{t(libraryKeyword.tag, { ns: 'tags' })}</Box> : null}
      {limits.length ? <Box sx={sx.meta}>{limits.join(' · ')}</Box> : null}
      {mapping ? <Box sx={sx.meta}>{toRulesetMapping({ name: rulesetName, mapping, t })}</Box> : null}

      <Box sx={sx.keywords} aria-label={t('LIBRARY_PAGE.KEYWORDS')}>
        {libraryKeyword.keywords.map((keyword) => (
          <Box key={keyword} component="span" sx={sx.keyword}>
            {keyword}
          </Box>
        ))}
      </Box>

      <Box sx={sx.examplesTitle}>{t('LIBRARY_PAGE.EXAMPLES')}</Box>
      {libraryKeyword.examples.map((example) => (
        <Box key={example} sx={sx.example}>
          {example}
        </Box>
      ))}
    </Box>
  )
}

export default Component
