'use client'

import { Box } from '@mui/material'

import type { CategoryRule, LibraryKeyword } from '@/types'
import { LibraryRef } from '@/components'
import { BANKS } from '@/utils/Parser'
import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type KeywordDetailsProps = {
  libraryKeyword: LibraryKeyword
  /**
   * The user's rules belonging to it (and not mapped by the rule set themselves), after its own.
   */
  rules?: CategoryRule[]
}

/**
 * What a library keyword (K) matches: one row per text, shown like the user's rules (R), then its bank or country limits.
 * Money in or out and examples are on the library page.
 */
const Component = ({ libraryKeyword, rules = [] }: KeywordDetailsProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const { match, keywords, bank, countries } = libraryKeyword
  const bankName = bank ? (BANKS.find((other) => other.id === bank)?.name ?? bank) : null
  const limits = [
    ...(bankName ? [t('LIBRARY_PAGE.ONLY_BANK', { bank: bankName })] : []),
    ...(countries
      ? [
          t('LIBRARY_PAGE.ONLY_COUNTRIES', {
            countries: countries.map((country) => t(`COUNTRY.${country}`)).join(', '),
          }),
        ]
      : []),
  ]

  return (
    <Box sx={sx.details}>
      {keywords.map((keyword) => (
        <Box key={keyword} sx={sx.row}>
          {/* Each text works like one of the user's rules */}
          <LibraryRef type="rule" />
          <Box component="span" sx={sx.condition}>
            {t(`STATS_PAGE.CATEGORY_RULES.MATCH_TYPES.${match}`)}
          </Box>
          <Box component="span" sx={sx.keyword}>
            {keyword}
          </Box>
        </Box>
      ))}
      {rules.map((rule) => (
        <Box key={rule.id} sx={sx.row}>
          <LibraryRef type="rule" number={rule.number} />
          <Box component="span" sx={sx.condition}>
            {t(`STATS_PAGE.CATEGORY_RULES.MATCH_TYPES.${rule.match}`)}
          </Box>
          <Box component="span" sx={sx.keyword}>
            {rule.keyword}
          </Box>
        </Box>
      ))}
      {limits.length ? <Box sx={sx.footer}>{limits.join(' · ')}</Box> : null}
    </Box>
  )
}

export default Component
