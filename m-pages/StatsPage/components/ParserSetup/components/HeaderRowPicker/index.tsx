'use client'

import { Box, Radio } from '@mui/material'
import { useEffect, useLayoutEffect, useState } from 'react'

import type { HeaderRowFrame, RowData, VirtualTableColumn } from '@/types'
import { useTranslation } from '@/lib/i18n'

import { getColumnCount, getMinColumnWidth } from '../../../CsvPreview/actions'
import VirtualTable from '../../../VirtualTable'
import { ROW_HEIGHT } from '../../../VirtualTable/actions'
import { RADIO_COLUMN_WIDTH } from './actions'
import { ui } from './styled'

type HeaderRowPickerProps = {
  rows: RowData[]
  /**
   * Of the rows of the file to offer, e.g. the possible header rows only.
   */
  indices: number[]
  headerIndex: number
  onChange: (headerIndex: number) => void
}

/**
 * Rows of the file as is (like the CSV view), one is picked as the row with the column names.
 */
const Component = ({ rows, indices, headerIndex, onChange }: HeaderRowPickerProps) => {
  const sx = ui()
  const { t } = useTranslation()
  // Its own scroll container, so many rows don't push the steps down. State, so the table renders once it exists.
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null)

  const shownRows = indices.map((index) => rows[index] ?? [])
  // Position of the selected row among the shown ones, -1 if it isn't shown
  const selected = indices.indexOf(headerIndex)

  // The selected row in view, e.g. far down after detection
  useEffect(() => {
    if (scrollElement) {
      scrollElement.scrollTo({ top: Math.max(selected - 2, 0) * ROW_HEIGHT })
    }
    // Only initially, not when picking a row
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollElement])
  // Around the selected row, positioned from the rendered rows (rows are virtualized, a table row can't hold it)
  const [frame, setFrame] = useState<HeaderRowFrame | null>(null)

  useLayoutEffect(() => {
    if (!scrollElement || selected < 0) {
      return
    }

    const measure = () => {
      const row = scrollElement.querySelector<HTMLElement>('tbody tr[data-index]')

      if (!row) {
        return
      }

      const box = scrollElement.getBoundingClientRect()
      const rect = row.getBoundingClientRect()
      const firstTop = rect.top - box.top + scrollElement.scrollTop - Number(row.dataset.index) * rect.height
      const next = { top: firstTop + selected * rect.height, height: rect.height }
      setFrame((prev) => (prev?.top === next.top && prev.height === next.height ? prev : next))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(scrollElement.firstElementChild ?? scrollElement)
    return () => observer.disconnect()
  }, [scrollElement, selected, shownRows.length])
  const columnCount = getColumnCount(null, shownRows)
  const columns: VirtualTableColumn[] = [
    {
      label: '',
      fixedWidth: RADIO_COLUMN_WIDTH,
      renderCell: (_, rowIndex) => (
        <Radio
          size="small"
          checked={rowIndex === selected}
          slotProps={{
            input: { 'aria-label': t('STATS_PAGE.PARSER_SETUP.HEADER_ROW_OPTION', { row: indices[rowIndex] + 1 }) },
          }}
          sx={sx.radio}
        />
      ),
    },
    ...Array.from({ length: columnCount }, () => ({ label: '' })),
  ]

  return (
    <Box ref={setScrollElement} sx={sx.scroll}>
      <VirtualTable
        columns={columns}
        hideHeader
        columnCount={columns.length}
        minColumnWidth={getMinColumnWidth(columnCount)}
        rowCount={shownRows.length}
        // Short rows (e.g. a title) are filled up, so the whole row can be clicked
        getCells={(index) => [
          '',
          ...shownRows[index],
          ...Array<string>(columnCount - shownRows[index].length).fill(''),
        ]}
        getRowStyle={(index) => (index === selected ? { fontWeight: 600 } : undefined)}
        onRowClick={(index) => onChange(indices[index])}
        scrollElement={scrollElement}
      />
      {frame && selected >= 0 ? <Box sx={sx.frame(frame)} /> : null}
    </Box>
  )
}

export default Component
