'use client'

import { ChevronRight } from '@mui/icons-material'
import { Box, ButtonBase } from '@mui/material'

import type { LibraryKeyword } from '@/types'
import { LibraryRef } from '@/components'
import { useTranslation } from '@/lib/i18n'

import { toAnchorId } from '../../actions'
import KeywordCard from '../KeywordCard'
import { ui } from './styled'

type HintSectionProps = {
  hint: string
  /**
   * Of the hint.
   */
  libraryKeywords: LibraryKeyword[]
  isExpanded: boolean
  onToggle: () => void
  /**
   * Of the linked hint or library keyword, highlighted.
   */
  targetId: string | null
}

/**
 * A hint expanding to its library keywords.
 */
const Component = ({ hint, libraryKeywords, isExpanded, onToggle, targetId }: HintSectionProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const id = toAnchorId('hint', hint)

  return (
    <Box id={id} sx={sx.section}>
      <ButtonBase onClick={onToggle} aria-expanded={isExpanded} sx={sx.header(id === targetId)}>
        <ChevronRight sx={sx.chevron(isExpanded)} />
        <LibraryRef type="hint" />
        <Box component="span" sx={sx.label}>
          {t(hint, { ns: 'hints' })}
        </Box>
        <Box component="span" sx={sx.id}>
          {hint}
        </Box>
        <Box component="span" sx={sx.count}>
          {t('RULESETS_PAGE.LIBRARY.KEYWORD_COUNT', { count: libraryKeywords.length })}
        </Box>
      </ButtonBase>

      {isExpanded ? (
        <Box sx={sx.body}>
          {libraryKeywords.map((libraryKeyword) => (
            <KeywordCard
              key={libraryKeyword.id}
              libraryKeyword={libraryKeyword}
              isTarget={toAnchorId('keyword', libraryKeyword.id) === targetId}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  )
}

export default Component
