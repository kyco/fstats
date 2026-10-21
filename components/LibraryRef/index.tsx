'use client'

import { Box } from '@mui/material'

import { getRuleRef } from '@/m-category/service'
import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type LibraryRefProps = {
  type: 'hint' | 'keyword' | 'rule'
  /**
   * Of the user's rules, e.g. "R-003".
   */
  number?: number
}

const LETTERS = { hint: 'H', keyword: 'L', rule: 'R' }

const TITLE_KEYS = {
  hint: 'RULESETS_PAGE.LIBRARY.HINT',
  keyword: 'RULESETS_PAGE.LIBRARY.KEYWORD',
  rule: 'RULESETS_PAGE.LIBRARY.RULE',
}

/**
 * What something of the library is: a hint (H), a library keyword (L) or one of the user's rules (e.g. R-003).
 */
const Component = ({ type, number }: LibraryRefProps) => {
  const sx = ui()
  const { t } = useTranslation()

  return (
    <Box component="span" title={t(TITLE_KEYS[type])} sx={sx.ref}>
      {type === 'rule' && number ? getRuleRef(number) : LETTERS[type]}
    </Box>
  )
}

export default Component
