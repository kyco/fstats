'use client'

import { Box, ButtonBase } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { MouseEvent, ReactNode } from 'react'

import type { CategoryCode } from '@/types'
import { getCategoryColor, getCategoryLabel } from '@/m-category/service'
import { isUncategorisedCode } from '@/utils/Category'
import { useTranslation } from '@/lib/i18n'

import { useWorkspaceCategories } from '../../../../context'
import { ui } from './styled'

type CategoryCellProps = {
  category: CategoryCode | null
  label: ReactNode
  /**
   * Opens the category editor menu, a plain chip without (e.g. in demo mode).
   */
  onClick?: (anchor: HTMLElement) => void
  /**
   * Of the rule being created: the category it gives the transaction (shown instead), and the title, e.g. the current
   * category or why it's kept.
   */
  preview?: { category?: CategoryCode; title: string } | null
}

/**
 * Category of a transaction as a chip, with a dot in the colour of its parent category. Uncategorised ones are dashed
 * without a dot, inviting to set one. Clicking it changes the category, without selecting the row.
 */
const Component = ({ category: currentCategory, label, onClick, preview }: CategoryCellProps) => {
  const theme = useTheme()
  const sx = ui(theme)
  const { t } = useTranslation()
  const { tree } = useWorkspaceCategories()
  const category = preview?.category ?? currentCategory
  const color = getCategoryColor(tree, category)
  const isUncategorised = isUncategorisedCode(category)
  const chipSx = { ...sx.chip(isUncategorised), ...(preview?.category ? sx.preview : null) }
  const content = (
    <>
      {isUncategorised ? null : <Box component="span" sx={sx.dot(color)} />}
      <Box component="span" sx={sx.label}>
        {preview?.category ? getCategoryLabel({ code: preview.category, tree, t }) : label}
      </Box>
    </>
  )

  if (!onClick) {
    return (
      <Box component="span" title={preview?.title} sx={chipSx}>
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
      title={preview?.title ?? t('STATS_PAGE.CATEGORY_RULES.CHANGE_CATEGORY')}
      aria-haspopup="dialog"
      sx={{ ...chipSx, ...sx.button }}
    >
      {content}
    </ButtonBase>
  )
}

export default Component
