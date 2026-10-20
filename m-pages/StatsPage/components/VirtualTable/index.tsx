'use client'

import { Box } from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { CSSProperties } from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import type { VirtualTableColumn } from '@/types'
import { highlightMatches } from '@/utils/Search'

import { getColWidths, OVERSCAN, ROW_HEIGHT } from './actions'
import { ui } from './styled'

type VirtualTableProps = {
  /**
   * `null` renders no header row.
   */
  columns: VirtualTableColumn[] | null
  columnCount: number
  rowCount: number
  /**
   * Only called for rendered rows, so the cell values can be computed lazily.
   */
  getCells: (index: number) => string[]
  /**
   * `--row-accent` draws a bar of that colour at the start of the row, `--row-ring` a 4px ring inside it.
   */
  getRowStyle?: (index: number) => CSSProperties | undefined
  /**
   * Makes the rows clickable, e.g. to pick one.
   */
  onRowClick?: (index: number) => void
  /**
   * The columns are only used for the cells (e.g. their widths), e.g. for rows of a file without a header.
   */
  hideHeader?: boolean
  /**
   * Keeps the header row at this offset (px) from the top of the scroll element's content while scrolling.
   */
  stickyHeaderTop?: number
  /**
   * Minimum width in px of each column. If the columns don't fit, the table scrolls horizontally. Not compatible with
   * `stickyHeaderTop`, the horizontal scroll container would break the sticky header.
   */
  minColumnWidth?: number
  /**
   * The scrolling ancestor, can be shared by multiple tables.
   */
  scrollElement: HTMLElement | null
  /**
   * Search query, highlighted in the cells (case-insensitive). Not in cells with `renderCell`.
   */
  highlight?: string
  /**
   * Row to scroll to (centred), again whenever the key changes.
   */
  scrollTo?: { index: number; key: number } | null
}

const Component = ({
  columns,
  columnCount,
  rowCount,
  getCells,
  getRowStyle,
  onRowClick,
  hideHeader = false,
  stickyHeaderTop,
  minColumnWidth,
  scrollElement,
  highlight = '',
  scrollTo,
}: VirtualTableProps) => {
  const sx = ui()
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)
  const colWidths = getColWidths(columns, columnCount)

  // Offset of the rows within the scroll element, changes when content above (e.g. other tables) resizes
  useLayoutEffect(() => {
    const tbody = tbodyRef.current

    if (!tbody || !scrollElement) {
      return
    }

    const update = () => {
      const margin =
        tbody.getBoundingClientRect().top - scrollElement.getBoundingClientRect().top + scrollElement.scrollTop
      setScrollMargin((prev) => (prev === margin ? prev : margin))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(scrollElement.firstElementChild ?? scrollElement)
    return () => observer.disconnect()
  }, [scrollElement, rowCount])

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollElement,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
    scrollMargin,
  })

  const scrollIndex = scrollTo?.index
  const scrollKey = scrollTo?.key

  useEffect(() => {
    if (scrollIndex !== undefined) {
      virtualizer.scrollToIndex(scrollIndex, { align: 'center' })
    }
    // Only when asked to, not when the rows change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollKey])

  const items = virtualizer.getVirtualItems()
  const paddingTop = items.length ? items[0].start - scrollMargin : 0
  const paddingBottom = items.length ? virtualizer.getTotalSize() - (items[items.length - 1].end - scrollMargin) : 0

  return (
    <Box sx={sx.wrapper(Boolean(columns && !hideHeader), minColumnWidth !== undefined)}>
      <Box
        component="table"
        sx={sx.table}
        style={minColumnWidth === undefined ? undefined : { minWidth: columnCount * minColumnWidth }}
      >
        <colgroup>
          {colWidths.map((width, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        {columns && !hideHeader ? (
          <thead>
            <tr>
              {/* Index keys, CSV headers aren't necessarily unique */}
              {columns.map((column, index) => (
                <th
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  title={column.label}
                  // Sticks only with a `top`
                  style={{ textAlign: column.align, top: stickyHeaderTop }}
                >
                  {column.hideLabel ? null : column.label}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody ref={tbodyRef}>
          {paddingTop > 0 ? (
            <tr className="spacer" style={{ height: paddingTop }}>
              <td colSpan={columnCount} />
            </tr>
          ) : null}
          {items.map((item) => (
            <tr
              key={item.key}
              data-index={item.index}
              ref={virtualizer.measureElement}
              style={onRowClick ? { cursor: 'pointer', ...getRowStyle?.(item.index) } : getRowStyle?.(item.index)}
              onClick={onRowClick ? () => onRowClick(item.index) : undefined}
            >
              {getCells(item.index).map((cell, cellIndex) => {
                const column = columns?.[cellIndex]

                return (
                  <td
                    // eslint-disable-next-line react/no-array-index-key
                    key={cellIndex}
                    title={column?.renderCell ? undefined : cell}
                    style={{ textAlign: column?.align, ...column?.getStyle?.(cell) }}
                  >
                    {column?.renderCell
                      ? column.renderCell(cell, item.index)
                      : highlightMatches(cell, highlight, column?.getHighlights?.(item.index))}
                  </td>
                )
              })}
            </tr>
          ))}
          {paddingBottom > 0 ? (
            <tr className="spacer" style={{ height: paddingBottom }}>
              <td colSpan={columnCount} />
            </tr>
          ) : null}
        </tbody>
      </Box>
    </Box>
  )
}

export default Component
