'use client'

import { CheckCircle } from '@mui/icons-material'
import { Box, ButtonBase, Typography } from '@mui/material'
import { Fragment } from 'react'

import { MISC } from '@/common'
import { useTranslation } from '@/lib/i18n'

import { isChanged, toPercent } from '../../actions'
import { ui } from './styled'

type LayoutPreviewProps = {
  title: string
  columnWidths: number[]
  explorerSplit: number
  isSelected: boolean
  onSelect: () => void
  /**
   * Values that differ from these are shown in bold.
   */
  compareTo?: { columnWidths: number[]; explorerSplit: number }
}

const Component = ({ title, columnWidths, explorerSplit, isSelected, onSelect, compareTo }: LayoutPreviewProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const [leftWidth, ...otherWidths] = columnWidths
  const isSplitChanged = isChanged(explorerSplit, compareTo?.explorerSplit)

  return (
    <ButtonBase onClick={onSelect} aria-pressed={isSelected} sx={sx.tile(isSelected)}>
      {isSelected ? <CheckCircle color="primary" sx={sx.check} /> : null}
      <Typography variant="caption" component="p" sx={sx.tileTitle}>
        {title}
      </Typography>
      <Box sx={sx.diagram}>
        <Box sx={sx.leftColumn(leftWidth)}>
          <Box sx={sx.splitBlock(explorerSplit, isSplitChanged)}>{toPercent(explorerSplit)}</Box>
          <Box sx={sx.splitBlock(100 - explorerSplit, isSplitChanged)}>{toPercent(100 - explorerSplit)}</Box>
        </Box>
        {otherWidths.map((width, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Box key={index} sx={sx.block(width)} />
        ))}
      </Box>
      <Typography variant="caption" component="p" sx={sx.tileCaption}>
        {t('SETTINGS_PAGE.LAYOUT.COLUMNS')}{' '}
        {columnWidths.map((width, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={index}>
            {index > 0 ? ` ${MISC.CENTER_DOT} ` : null}
            <Box component="span" sx={sx.changed(isChanged(width, compareTo?.columnWidths[index]))}>
              {toPercent(width)}
            </Box>
          </Fragment>
        ))}
      </Typography>
    </ButtonBase>
  )
}

export default Component
