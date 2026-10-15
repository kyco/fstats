'use client'

import { ChevronRight, ExpandMore } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useState } from 'react'

import type { DateRow } from '@/types'
import { OutlineCheckbox } from '@/components'
import { useUserPreferences } from '@/m-user/service'
import { getTransactionDay, toDisplayDate } from '@/utils/Date'
import { useTranslation } from '@/lib/i18n'

import { EMPTY_REASON_TITLE_KEYS, getEmptyReason } from '../../actions'
import { useStatsTransactions, useWorkspaceDayFilter, useWorkspaceFiles } from '../../context'
import DateSkeleton from '../DateSkeleton'
import {
  getCheckState,
  getDateTree,
  getDefaultExpanded,
  getDeselectedCounts,
  getRowHeight,
  getVisibleRows,
  OVERSCAN,
  ROW_INDENT,
  toggleDays,
  toggleExpanded,
} from './actions'
import { ui } from './styled'

/**
 * Years, months and days with transactions of the checked files, (de)selected to filter the transactions and stats views.
 */
const Component = () => {
  const sx = ui()
  const { t } = useTranslation()
  const { locale, dateFormat } = useUserPreferences()
  const { files, checkedFiles } = useWorkspaceFiles()
  const { all } = useStatsTransactions()
  const { deselectedDays, setDeselectedDays } = useWorkspaceDayFilter()
  // `null` until the user expands or collapses a row, so the default follows the files
  const [expandedKeys, setExpandedKeys] = useState<Set<string> | null>(null)
  // State rather than a ref, so the list re-renders once the scroll element exists
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null)
  const tree = useMemo(() => getDateTree(all.map(getTransactionDay)), [all])
  // Memoized, the virtualizer re-renders on scroll
  const defaultExpanded = useMemo(() => getDefaultExpanded(tree), [tree])
  const expanded = expandedKeys ?? defaultExpanded
  const rows = useMemo(() => getVisibleRows(tree, expanded), [tree, expanded])
  const deselectedCounts = useMemo(() => getDeselectedCounts(tree, deselectedDays), [tree, deselectedDays])

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollElement,
    estimateSize: (index) => getRowHeight(rows[index]),
    getItemKey: (index) => rows[index].key,
    overscan: OVERSCAN,
  })

  const getLabel = (row: DateRow) => {
    switch (row.type) {
      case 'year':
        return row.key
      case 'month':
        return toDisplayDate({ date: `${row.key}-01`, locale, formatTo: 'MMMM' })
      default:
        return toDisplayDate({ date: row.key, locale, formatTo: dateFormat })
    }
  }

  const toggleRow = (row: DateRow) => {
    setDeselectedDays(toggleDays(row.days, deselectedDays))
  }

  const toggleRowExpanded = (row: DateRow) => {
    setExpandedKeys(toggleExpanded(row.key, expanded))
  }

  // Only an indicator, the whole row expands
  const renderExpandIcon = (row: DateRow, isExpanded: boolean) => {
    const Icon = row.type === 'year' ? ExpandMore : ChevronRight

    return (
      <Box component="span" sx={{ ...sx.expandIcon, ...(row.type === 'year' ? sx.expandIconEnd : null) }}>
        <Icon style={{ transform: isExpanded ? `rotate(${row.type === 'year' ? 180 : 90}deg)` : undefined }} />
      </Box>
    )
  }

  // The days are those of all transactions, deselected ones included
  const emptyReason = getEmptyReason({
    fileCount: files.length,
    checkedCount: checkedFiles.length,
    transactions: { all, shown: all },
  })

  if (emptyReason) {
    return <DateSkeleton title={t(EMPTY_REASON_TITLE_KEYS[emptyReason])} />
  }

  return (
    <Box ref={setScrollElement} sx={sx.scroll}>
      <Box sx={sx.rows} style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((item) => {
          const row = rows[item.index]
          const isExpandable = row.type !== 'day'
          const isExpanded = expanded.has(row.key)
          const checkState = getCheckState(row, deselectedCounts)
          const isDeselected = !checkState.checked && !checkState.indeterminate

          return (
            <Box
              key={row.key}
              // Years and months expand like a tree, days toggle like the file rows
              onClick={() => (isExpandable ? toggleRowExpanded(row) : toggleRow(row))}
              role="button"
              tabIndex={0}
              aria-expanded={isExpandable ? isExpanded : undefined}
              onKeyDown={(event) => {
                if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault()
                  event.currentTarget.click()
                }
              }}
              sx={sx.row}
              style={sx.rowPosition(item.start, item.size, ROW_INDENT[row.type])}
            >
              {row.type === 'month' ? renderExpandIcon(row, isExpanded) : null}
              {row.type === 'day' ? <Box sx={sx.expandSpacer} /> : null}
              <OutlineCheckbox
                {...checkState}
                onClick={(event) => event.stopPropagation()}
                onChange={() => toggleRow(row)}
              />
              <Typography
                sx={sx.label(row.type === 'year', isDeselected)}
                // Deselected months aren't emphasized, like deselected files
                style={{ fontWeight: row.type === 'month' && !isDeselected ? 600 : 400 }}
              >
                {getLabel(row)}
              </Typography>
              {row.type === 'day' ? (
                <Box component="span" sx={{ ...sx.weekday, ...(checkState.checked ? null : sx.weekdayDeselected) }}>
                  {toDisplayDate({ date: row.key, locale, formatTo: 'EEE' })}
                </Box>
              ) : null}
              {/* Years expand on the right, like a section header */}
              {row.type === 'year' ? renderExpandIcon(row, isExpanded) : null}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default Component
