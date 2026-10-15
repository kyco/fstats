import { uniq } from 'lodash'

import type { DateRow, DateYear } from '@/types'
import { groupInOrder } from '@/utils/Array'

export const ROW_HEIGHT = 30 // px

/**
 * Years are taller (with bigger text), as the larger grouping.
 */
const YEAR_ROW_HEIGHT = 38 // px

export const getRowHeight = (row: Pick<DateRow, 'type'>) => {
  return row.type === 'year' ? YEAR_ROW_HEIGHT : ROW_HEIGHT
}

export const OVERSCAN = 10

/**
 * Left padding (px) of the rows: the months' expand buttons are centered below the year's checkbox, the days'
 * checkboxes start where the month labels start.
 */
export const ROW_INDENT: Record<DateRow['type'], number> = { year: 4, month: 6, day: 28 }

/**
 * Years, months and days (`yyyy-MM-dd`) with transactions, newest first.
 */
export const getDateTree = (days: string[]): DateYear[] => {
  const sortedDays = uniq(days).sort().reverse()

  return groupByPrefix(sortedDays, 4).map(([year, yearDays]) => ({
    key: year,
    days: yearDays,
    months: groupByPrefix(yearDays, 7).map(([month, monthDays]) => ({ key: month, days: monthDays })),
  }))
}

const groupByPrefix = (days: string[], length: number) => {
  return [...groupInOrder(days, (day) => day.slice(0, length)).entries()]
}

/**
 * Only the latest year is expanded.
 */
export const getDefaultExpanded = (tree: DateYear[]) => {
  return new Set(tree.slice(0, 1).map((year) => year.key))
}

/**
 * Rows of the expanded years and months, flattened for the virtual list.
 */
export const getVisibleRows = (tree: DateYear[], expanded: Set<string>): DateRow[] => {
  return tree.flatMap((year): DateRow[] => [
    { type: 'year', key: year.key, days: year.days },
    ...(expanded.has(year.key)
      ? year.months.flatMap((month): DateRow[] => [
          { type: 'month', key: month.key, days: month.days },
          ...(expanded.has(month.key)
            ? month.days.map((day): DateRow => ({ type: 'day', key: day, days: [day] }))
            : []),
        ])
      : []),
  ])
}

/**
 * Deselected days per year, month and day key of the tree, so the check state of a row is a lookup.
 */
export const getDeselectedCounts = (tree: DateYear[], deselectedDays: Set<string>) => {
  const counts = new Map<string, number>()

  tree.forEach((year) => {
    year.days
      .filter((day) => deselectedDays.has(day))
      .forEach((day) => {
        ;[year.key, day.slice(0, 7), day].forEach((key) => counts.set(key, (counts.get(key) ?? 0) + 1))
      })
  })

  return counts
}

/**
 * Checked if none of the days are deselected, indeterminate if some are.
 */
export const getCheckState = (row: DateRow, deselectedCounts: Map<string, number>) => {
  const deselectedCount = deselectedCounts.get(row.key) ?? 0
  return { checked: deselectedCount === 0, indeterminate: deselectedCount > 0 && deselectedCount < row.days.length }
}

/**
 * Deselects all days if all are selected, otherwise selects all.
 */
export const toggleDays = (days: string[], deselectedDays: Set<string>) => {
  const next = new Set(deselectedDays)
  const isAllSelected = !days.some((day) => deselectedDays.has(day))
  days.forEach((day) => (isAllSelected ? next.add(day) : next.delete(day)))
  return next
}

export const toggleExpanded = (key: string, expanded: Set<string>) => {
  const next = new Set(expanded)

  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }

  return next
}
