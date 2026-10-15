'use client'

import { Box, ButtonBase } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { MouseEvent, ReactNode } from 'react'

import type { CategoryCode } from '@/types'
import { PARENT_CATEGORY_COLORS } from '@/common'
import { getParentCategoryCode, isUncategorisedCode } from '@/utils/Category'
import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type CategoryCellProps = {
  category: CategoryCode | null
  label: ReactNode
  /**
   * Opens the category editor menu, a plain chip without (e.g. in demo mode).
   */
  onClick?: (anchor: HTMLElement) => void
}

/**
 * Category of a transaction as a chip, with a dot in the colour of its parent category. Uncategorised ones are dashed
 * without a dot, inviting to set one. Clicking it changes the category, without selecting the row.
 */
const Component = ({ category, label, onClick }: CategoryCellProps) => {
  const theme = useTheme()
  const sx = ui(theme)
  const { t } = useTranslation()
  const color = category ? PARENT_CATEGORY_COLORS[getParentCategoryCode(category)] : undefined
  const isUncategorised = isUncategorisedCode(category)
  const content = (
    <>
      {isUncategorised ? null : <Box component="span" sx={sx.dot(color)} />}
      <Box component="span" sx={sx.label}>
        {label}
      </Box>
    </>
  )

  if (!onClick) {
    return (
      <Box component="span" sx={sx.chip(isUncategorised)}>
        {content}
      </Box>
    )
  }

  return (
    <ButtonBase
      onClick={(event: MouseEvent<HTMLElement>) => {
        event.stopPropagation()
        onClick(event.currentTarget)
      }}
      title={t('STATS_PAGE.CATEGORY_RULES.CHANGE_CATEGORY')}
      aria-haspopup="dialog"
      sx={{ ...sx.chip(isUncategorised), ...sx.button }}
    >
      {content}
    </ButtonBase>
  )
}

export default Component
