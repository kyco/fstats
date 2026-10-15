import type { MouseEvent, SyntheticEvent } from 'react'

import type { ConnectorEnd, ConnectorPoint } from '@/types'

export const toAnchorId = ({ side, key }: ConnectorEnd) => `${side}:${key}`

export const isSameEnd = (a: ConnectorEnd | null, b: ConnectorEnd) => a?.side === b.side && a.key === b.key

/**
 * Horizontal S-curve from a field to a column.
 */
export const getCurve = (start: ConnectorPoint, end: ConnectorPoint) => {
  const offset = Math.max(Math.abs(end.x - start.x) / 2, 24)

  return `M ${start.x} ${start.y} C ${start.x + offset} ${start.y}, ${end.x - offset} ${end.y}, ${end.x} ${end.y}`
}

/**
 * The field and column of two ends on different sides.
 */
export const toConnection = (a: ConnectorEnd, b: ConnectorEnd) => {
  return a.side === 'field' ? { field: a.key, column: b.key } : { field: b.key, column: a.key }
}

// Clicked rows aren't focused, the focus ring would show on any key press (e.g. Shift). Rows are still focused by Tab.
export const preventFocus = (event: MouseEvent) => event.preventDefault()

// Events of controls in a row aren't events of the row
export const stopPropagation = (event: SyntheticEvent) => event.stopPropagation()
