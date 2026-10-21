'use client'

import { Box } from '@mui/material'

import type { LibraryKeyword, MenuSelectOption } from '@/types'
import { LibraryRef, MenuSelect } from '@/components'
import { useTranslation } from '@/lib/i18n'

import { EXCLUDED, NO_MAPPING } from '../../actions'
import { ui } from './styled'

type KeywordRowProps = {
  libraryKeyword: LibraryKeyword
  /**
   * Indented like the hints it's listed under.
   */
  depth: number
  /**
   * The category it's mapped to itself, `NO_MAPPING` to use its hints, or `EXCLUDED`.
   */
  value: string
  /**
   * Of the category its hints map it to, `null` when they don't.
   */
  hintCategoryLabel: string | null
  /**
   * E.g. while searching, where it isn't listed under its hint.
   */
  hintLabel?: string
  options: MenuSelectOption[]
  onChange: (value: string) => void
  /**
   * Adds a category of that name and maps to it.
   */
  onCreate: (name: string) => void
}

/**
 * A library keyword with its keywords, mapped like its hints, to a category of its own, or left uncategorised.
 */
const Component = ({
  libraryKeyword,
  depth,
  value,
  hintCategoryLabel,
  hintLabel,
  options,
  onChange,
  onCreate,
}: KeywordRowProps) => {
  const sx = ui()
  const { t } = useTranslation()

  return (
    <Box sx={sx.row(depth)}>
      <Box sx={sx.main}>
        <Box sx={sx.title}>
          <LibraryRef type="keyword" />
          <Box component="span" sx={sx.name}>
            {libraryKeyword.name}
          </Box>
          <Box component="span" title={libraryKeyword.id} sx={sx.pack}>
            {libraryKeyword.packId}
          </Box>
          {hintLabel ? (
            <Box component="span" sx={sx.hint}>
              {hintLabel}
            </Box>
          ) : null}
        </Box>
        <Box component="span" title={libraryKeyword.keywords.join(', ')} sx={sx.keywords}>
          {libraryKeyword.keywords.join(' · ')}
        </Box>
      </Box>

      <Box sx={sx.select}>
        <MenuSelect
          title={t('RULESETS_PAGE.LIBRARY.CATEGORY_OF', { name: libraryKeyword.name })}
          value={value}
          options={[
            {
              value: NO_MAPPING,
              label: t('RULESETS_PAGE.LIBRARY.LIKE_HINT', {
                category: hintCategoryLabel ?? t('RULESETS_PAGE.LIBRARY.NOT_MAPPED'),
              }),
            },
            { value: EXCLUDED, label: t('RULESETS_PAGE.LIBRARY.EXCLUDED') },
            ...options,
          ]}
          onChange={onChange}
          search={{
            placeholder: t('STATS_PAGE.CATEGORY_RULES.SEARCH_CATEGORIES'),
            noMatches: t('STATS_PAGE.CATEGORY_RULES.NO_MATCHING_CATEGORIES'),
          }}
          create={{ getLabel: (name) => t('STATS_PAGE.CATEGORY_RULES.CREATE_CATEGORY', { name }), onCreate }}
        />
      </Box>
    </Box>
  )
}

export default Component
