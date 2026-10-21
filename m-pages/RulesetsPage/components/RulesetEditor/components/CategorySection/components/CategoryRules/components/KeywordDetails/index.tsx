'use client'

import { Box } from '@mui/material'

import type { LibraryKeyword } from '@/types'
import { CategoryRuleDirection } from '@/types-enums'
import { BANKS } from '@/utils/Parser'
import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type KeywordDetailsProps = {
  libraryKeyword: LibraryKeyword
}

/**
 * What a library keyword matches: how, its keywords, limits and example descriptions.
 */
const Component = ({ libraryKeyword }: KeywordDetailsProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const { match, keywords, bank, countries, direction, examples } = libraryKeyword
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
    ...(direction === CategoryRuleDirection.ANY ? [] : [t(`RULESETS_PAGE.DIRECTIONS_ONLY.${direction}`)]),
  ]

  return (
    <Box sx={sx.details}>
      <Box sx={sx.line}>
        <Box component="span" sx={sx.label}>
          {t(`STATS_PAGE.CATEGORY_RULES.MATCH_TYPES.${match}`)}
        </Box>
        {keywords.map((keyword) => (
          <Box key={keyword} component="span" sx={sx.keyword}>
            {keyword}
          </Box>
        ))}
      </Box>
      {limits.length ? <Box sx={sx.label}>{limits.join(' · ')}</Box> : null}
      <Box sx={sx.label}>{t('LIBRARY_PAGE.EXAMPLES')}</Box>
      {examples.map((example) => (
        <Box key={example} sx={sx.example}>
          {example}
        </Box>
      ))}
    </Box>
  )
}

export default Component
