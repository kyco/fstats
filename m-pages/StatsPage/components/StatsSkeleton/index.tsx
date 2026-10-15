'use client'

import { Box, ListItem, Skeleton } from '@mui/material'

import StatsCard from '../StatsCard'
import { ui } from './styled'

type StatsSkeletonProps = {
  /**
   * Why the summary isn't shown, in place of its title.
   */
  title: string
}

/**
 * Static placeholder of the expanded "All transactions" row, shown when no file is checked or in the CSV view.
 */
const Component = ({ title }: StatsSkeletonProps) => {
  const sx = ui()

  return (
    <StatsCard>
      <ListItem disablePadding divider sx={sx.item}>
        <Box sx={sx.row}>
          <Box component="span" sx={sx.title}>
            {title}
          </Box>
        </Box>
        <Box className="details" sx={sx.details} aria-hidden>
          <Skeleton animation={false} width={90} sx={sx.count} />
          {[64, 72].map((width) => (
            <Box key={width} sx={sx.listRow}>
              <Skeleton animation={false} width={width} sx={sx.label} />
              <Skeleton animation={false} width={80} sx={sx.value} />
            </Box>
          ))}
          <Box sx={sx.totalRow}>
            <Skeleton animation={false} width={48} sx={sx.totalLabel} />
            <Skeleton animation={false} width={96} sx={sx.totalValue} />
          </Box>
        </Box>
      </ListItem>
    </StatsCard>
  )
}

export default Component
