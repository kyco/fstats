'use client'

import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

import type { StatsFile } from '@/types'
import { TextChip } from '@/components'
import { useTranslation } from '@/lib/i18n'

import { getFileNameColor } from '../../actions'
import { ui } from './styled'

type PreviewSectionProps = {
  title: string
  /**
   * The file shown, its status is indicated by the title color.
   */
  file?: StatsFile
  /**
   * Small label next to the title, e.g. the currency.
   */
  chip?: string
  /**
   * Next to the title, e.g. the row count.
   */
  caption?: string
  isLoading?: boolean
  error?: string | null
  /**
   * The title stays at the top while scrolling. Only for the first section of the scroll container.
   */
  isSticky?: boolean
  /**
   * Above the header, e.g. a divider from the previous section.
   */
  before?: ReactNode
  children?: ReactNode
}

const Component = ({
  title,
  file,
  chip,
  caption,
  isLoading = false,
  error = null,
  isSticky = false,
  before,
  children,
}: PreviewSectionProps) => {
  const sx = ui()
  const { t } = useTranslation()

  return (
    <Box component="section" sx={sx.section}>
      {before}
      <Box sx={isSticky ? { ...sx.header, ...sx.stickyHeader } : sx.header}>
        <Typography variant="body2" sx={file ? { ...sx.title, color: getFileNameColor(file) } : sx.title}>
          {title}
          {chip ? <TextChip sx={sx.chip}>{chip}</TextChip> : null}
          {caption ? (
            <Box component="span" sx={sx.rowCount}>
              {caption}
            </Box>
          ) : null}
        </Typography>
      </Box>
      {isLoading ? (
        <Typography variant="body2" color="text.secondary">
          {t('MISC.LOADING')}
        </Typography>
      ) : error ? (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      ) : (
        children
      )}
    </Box>
  )
}

export default Component
