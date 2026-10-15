'use client'

import { EventNoteOutlined, ExpandMore } from '@mui/icons-material'
import { Box, Collapse, ListItem, ListItemButton, Tooltip, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useState } from 'react'

import type { Transaction, TransactionCounts } from '@/types'
import type { Currency } from '@/types-enums'
import { TextChip } from '@/components'
import { useUserPreferences } from '@/m-user/service'
import { toFixedLocaleCurrency } from '@/utils/Number'
import { getStats } from '@/utils/Stats'
import { useTranslation } from '@/lib/i18n'

import { getAmountColor } from '../../actions'
import StatsList from '../StatsList'
import { ui } from './styled'

type StatsRowProps = {
  title: string
  titleColor?: string
  /**
   * Bold, for the totals of all files.
   */
  isTotal?: boolean
  /**
   * `null` for files without transactions, e.g. unsupported ones.
   */
  stats: { transactions: Transaction[]; currency: Currency } | null
  /**
   * Small label next to the title, e.g. the currency.
   */
  chip?: string
  /**
   * Shown above the stats, those excluded by date are also indicated next to the balance.
   */
  counts?: TransactionCounts
  defaultExpanded?: boolean
  /**
   * Shown above the stats when expanded.
   */
  children?: ReactNode
}

/**
 * One row with the balance, expands to show the details. Styled like the file rows of the left column.
 */
const Component = ({
  title,
  titleColor = 'text.primary',
  isTotal = false,
  stats,
  chip,
  counts,
  defaultExpanded = false,
  children,
}: StatsRowProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const { locale } = useUserPreferences()
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const profit = stats ? getStats(stats.transactions).profit : null

  return (
    <ListItem disablePadding divider sx={sx.item}>
      <ListItemButton onClick={() => setIsExpanded((prev) => !prev)} aria-expanded={isExpanded} sx={sx.row}>
        <Typography sx={sx.title(!!chip, titleColor, isTotal || isExpanded)} title={title}>
          {title}
        </Typography>
        {chip ? <TextChip sx={sx.chip}>{chip}</TextChip> : null}
        {counts?.dateExcludedCount ? (
          <Tooltip title={t('STATS_PAGE.SIDEBAR.DATE_FILTERED')}>
            <EventNoteOutlined sx={sx.dateFiltered} aria-label={t('STATS_PAGE.SIDEBAR.DATE_FILTERED')} />
          </Tooltip>
        ) : null}
        {/* The expanded details show it as their total */}
        {stats && profit !== null && !isExpanded ? (
          <Typography sx={{ ...sx.balance, color: getAmountColor(profit) }}>
            {toFixedLocaleCurrency({ value: profit, currency: stats.currency, locale })}
          </Typography>
        ) : null}
        <ExpandMore sx={{ ...sx.chevron, transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
      </ListItemButton>
      <Collapse in={isExpanded} unmountOnExit sx={sx.collapse}>
        <Box className="details" sx={sx.details}>
          {children}
          {stats ? <StatsList transactions={stats.transactions} currency={stats.currency} counts={counts} /> : null}
        </Box>
      </Collapse>
    </ListItem>
  )
}

export default Component
