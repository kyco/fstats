'use client'

import { ChevronRight } from '@mui/icons-material'
import { Box, ButtonBase } from '@mui/material'

import type { MenuSelectOption } from '@/types'
import { LibraryRef, MenuSelect } from '@/components'
import { useTranslation } from '@/lib/i18n'

import { NO_MAPPING } from '../../actions'
import { ui } from './styled'

type HintRowProps = {
  label: string
  keywordCount: number
  isExpanded: boolean
  onToggle: () => void
  /**
   * The category it's mapped to, `NO_MAPPING` when not mapped itself.
   */
  value: string
  options: MenuSelectOption[]
  onChange: (value: string) => void
  /**
   * Adds a category of that name and maps to it.
   */
  onCreate: (name: string) => void
}

/**
 * A hint with the category it's mapped to, expanding to its library keywords.
 */
const Component = ({ label, keywordCount, isExpanded, onToggle, value, options, onChange, onCreate }: HintRowProps) => {
  const sx = ui()
  const { t } = useTranslation()

  return (
    <Box sx={sx.row}>
      <ButtonBase onClick={onToggle} aria-expanded={isExpanded} sx={sx.main}>
        <ChevronRight sx={sx.chevron(isExpanded)} />
        <LibraryRef type="hint" />
        <Box component="span" sx={sx.label}>
          {label}
        </Box>
        <Box component="span" sx={sx.count}>
          {t('RULESETS_PAGE.LIBRARY.KEYWORD_COUNT', { count: keywordCount })}
        </Box>
      </ButtonBase>

      <Box sx={sx.select}>
        <MenuSelect
          title={t('RULESETS_PAGE.LIBRARY.CATEGORY_OF', { name: label })}
          value={value}
          options={[{ value: NO_MAPPING, label: t('RULESETS_PAGE.LIBRARY.NOT_MAPPED') }, ...options]}
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
