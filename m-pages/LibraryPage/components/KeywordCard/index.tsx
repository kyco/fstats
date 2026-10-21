'use client'

import { Box } from '@mui/material'

import type { LibraryKeyword } from '@/types'
import { CategoryRuleDirection, CategoryRuleMatch } from '@/types-enums'
import { LibraryRef } from '@/components'
import { BANKS } from '@/utils/Parser'
import { useTranslation } from '@/lib/i18n'

import { toAnchorId } from '../../actions'
import { ui } from './styled'

type KeywordCardProps = {
  libraryKeyword: LibraryKeyword
  /**
   * Its hints, e.g. in search results, where it isn't listed under them.
   */
  showHint?: boolean
  /**
   * Linked, highlighted.
   */
  isTarget?: boolean
}

/**
 * What a library keyword recognises: its keywords (and how they match), limits and example descriptions.
 */
const Component = ({ libraryKeyword, showHint = false, isTarget = false }: KeywordCardProps) => {
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
      </Box>

      {showHint ? <Box sx={sx.meta}>{t(libraryKeyword.hint, { ns: 'hints' })}</Box> : null}
      {limits.length ? <Box sx={sx.meta}>{limits.join(' · ')}</Box> : null}

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
