import type { VirtualTableColumn } from '@/types'

// Of the header and each row, including the border. Also the estimate of the virtualizer, which measures rows
export const ROW_HEIGHT = 28 // px

// Relative, columns without a width get an equal share
const DEFAULT_COLUMN_WIDTH = 100

export const OVERSCAN = 20

/**
 * CSS widths of the columns. Relative widths become percentages. With fixed px columns, the percentages would add up
 * to more than the table width, so the widest relative column is left `auto` to take the remaining space instead.
 */
export const getColWidths = (columns: VirtualTableColumn[] | null, columnCount: number) => {
  const relativeWidths = Array.from({ length: columnCount }, (_, index) =>
    columns?.[index]?.fixedWidth === undefined ? (columns?.[index]?.width ?? DEFAULT_COLUMN_WIDTH) : 0,
  )
  const totalWidth = relativeWidths.reduce((sum, width) => sum + width, 0)
  const hasFixed = columns?.some((column) => column.fixedWidth !== undefined) ?? false
  const autoIndex = hasFixed ? relativeWidths.indexOf(Math.max(...relativeWidths)) : -1

  return relativeWidths.map((width, index) => {
    const fixedWidth = columns?.[index]?.fixedWidth

    if (fixedWidth !== undefined) {
      return `${fixedWidth}px`
    }

    return index === autoIndex ? 'auto' : `${(width / totalWidth) * 100}%`
  })
}
