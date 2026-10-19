export type Size = {
  width?: number
  height?: number
}

/**
 * Start (inclusive) and end (exclusive) index of a part of a text, e.g. a match to highlight.
 */
export type TextRange = [start: number, end: number]

export type SortingPref = 'asc' | 'desc' | 'totalAsc' | 'totalDesc'
