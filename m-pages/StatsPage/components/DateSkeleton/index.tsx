'use client'

import { ChevronRight, ExpandMore } from '@mui/icons-material'
import { Box, Skeleton } from '@mui/material'

import { getRowHeight, ROW_INDENT } from '../DateExplorer/actions'
import { ROWS } from './actions'
import { ui } from './styled'

type DateSkeletonProps = {
  /**
   * Explains why the date explorer isn't shown, in place of the year.
   */
  title: string
}

/**
 * Static outline of the date explorer, same layout as its rows, shown when it doesn't apply (the CSV view) or has no
 * dates.
 */
const Component = ({ title }: DateSkeletonProps) => {
  const sx = ui()

  return (
    <Box sx={sx.skeleton}>
      {ROWS.map((row, index) => (
        <Box
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          sx={sx.row}
          style={{ height: getRowHeight(row), paddingLeft: ROW_INDENT[row.type] }}
        >
          {row.type === 'month' ? (
            <Box sx={sx.expandIcon}>
              <ChevronRight style={{ transform: row.isExpanded ? 'rotate(90deg)' : undefined }} />
            </Box>
          ) : row.type === 'day' ? (
            <Box sx={sx.expandSpacer} />
          ) : null}
          <Box sx={sx.checkbox}>
            <Skeleton variant="rounded" animation={false} width={13} height={13} sx={sx.checkboxBox} />
          </Box>
          {row.type === 'year' ? (
            <Box component="span" sx={sx.title}>
              {title}
            </Box>
          ) : (
            <Skeleton variant="text" animation={false} width={row.width} height={14} aria-hidden />
          )}
          {row.type === 'year' ? (
            <Box sx={{ ...sx.expandIcon, ...sx.expandIconEnd }}>
              <ExpandMore style={{ transform: row.isExpanded ? 'rotate(180deg)' : undefined }} />
            </Box>
          ) : null}
        </Box>
      ))}
    </Box>
  )
}

export default Component
