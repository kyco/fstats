import type { DateRow } from '@/types'

// A year, an expanded month with some of its days and two collapsed months, label widths in px
export const ROWS: { type: DateRow['type']; width: number; isExpanded?: boolean }[] = [
  { type: 'year', width: 36, isExpanded: true },
  { type: 'month', width: 48, isExpanded: true },
  { type: 'day', width: 68 },
  { type: 'day', width: 68 },
  { type: 'day', width: 68 },
  { type: 'month', width: 56 },
  { type: 'month', width: 44 },
]
