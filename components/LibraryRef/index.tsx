'use client'

import { Box, Tooltip } from '@mui/material'

import { getRuleRef } from '@/m-category/service'
import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type LibraryRefProps = {
  type: 'tag' | 'keyword' | 'rule'
  /**
   * Of the user's rules, e.g. "R-003". Without, a rule of a library keyword (one of its texts).
   */
  number?: number
}

const LETTERS = { tag: 'T', keyword: 'K', rule: 'R' }

/**
 * What something of the library is: a tag (T, a tag in the code), a library keyword (K), a rule of a library keyword (R) or one of the
 * user's rules (e.g. R-003), named on hover.
 */
const Component = ({ type, number }: LibraryRefProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const label = type === 'rule' && number ? getRuleRef(number) : LETTERS[type]
  const name =
    type === 'tag'
      ? t('RULESETS_PAGE.LIBRARY.TAG')
      : type === 'keyword'
        ? t('RULESETS_PAGE.LIBRARY.KEYWORD')
        : number
          ? t('RULESETS_PAGE.LIBRARY.RULE')
          : t('RULESETS_PAGE.LIBRARY.BUILT_IN_RULE')

  return (
    <Tooltip title={name} placement="top">
      <Box component="span" sx={sx.ref}>
        {label}
      </Box>
    </Tooltip>
  )
}

export default Component
