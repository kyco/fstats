'use client'

import { CloseOutlined, ErrorOutlined } from '@mui/icons-material'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import type { ConnectorAnchor, ConnectorColumn, ConnectorEnd, ConnectorField, ConnectorLayout } from '@/types'
import { useTranslation } from '@/lib/i18n'

import { getCurve, isSameEnd, preventFocus, stopPropagation, toAnchorId, toConnection } from './actions'
import { ui } from './styled'

type ColumnConnectorProps = {
  fields: ConnectorField[]
  columns: ConnectorColumn[]
  /**
   * Column names per field key, a field can have several.
   */
  connections: Record<string, string[]>
  onConnect: (field: string, column: string) => void
  /**
   * Removes all lines of the column.
   */
  onDisconnect: (column: string) => void
}

/**
 * Fields on the left, columns of the file on the right, connected by lines. A click on a row selects it, a click on a
 * row of the other side connects them.
 */
const Component = ({ fields, columns, connections, onConnect, onDisconnect }: ColumnConnectorProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const fieldsRef = useRef<HTMLDivElement>(null)
  const columnsRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef(new Map<string, HTMLElement>())
  const [layout, setLayout] = useState<ConnectorLayout | null>(null)
  // The selected row, to connect to a row of the other side
  const [pending, setPending] = useState<ConnectorEnd | null>(null)
  const connectedColumns = new Set(Object.values(connections).flat())

  // Anchors relative to the container, the centers of the dots. Columns scrolled out of view end at the list's edge.
  const measure = useCallback(() => {
    const container = containerRef.current?.getBoundingClientRect()
    const list = columnsRef.current?.getBoundingClientRect()

    if (!container || !list) {
      return
    }

    const anchors: Record<string, ConnectorAnchor> = {}
    rowRefs.current.forEach((row, id) => {
      const dot = (row.querySelector('[data-dot]') ?? row).getBoundingClientRect()
      const isField = id.startsWith('field:')
      const center = dot.top + dot.height / 2
      const y = isField ? center : Math.min(Math.max(center, list.top), list.bottom)

      anchors[id] = {
        x: dot.left + dot.width / 2 - container.left,
        y: y - container.top,
        isOutOfView: !isField && y !== center,
      }
    })

    setLayout({ anchors, fieldsHeight: fieldsRef.current?.offsetHeight ?? 0 })
  }, [])

  useLayoutEffect(() => {
    measure()
  }, [measure, fields, columns, connections])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [measure])

  // A click anywhere else or Escape cancels the selection. On the document, clicked rows aren't focused.
  useEffect(() => {
    if (!pending) {
      return
    }

    const cancelOnClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setPending(null)
      }
    }

    const cancelOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPending(null)
      }
    }

    document.addEventListener('click', cancelOnClick)
    document.addEventListener('keydown', cancelOnEscape)
    return () => {
      document.removeEventListener('click', cancelOnClick)
      document.removeEventListener('keydown', cancelOnEscape)
    }
  }, [pending])

  const setRowRef = (end: ConnectorEnd) => (element: HTMLElement | null) => {
    if (element) {
      rowRefs.current.set(toAnchorId(end), element)
    } else {
      rowRefs.current.delete(toAnchorId(end))
    }
  }

  // Click mode: the first click starts a line, a click on the other side ends it
  const select = (end: ConnectorEnd) => {
    if (pending && pending.side !== end.side) {
      const { field, column } = toConnection(pending, end)
      onConnect(field, column)
      setPending(null)
    } else {
      setPending(isSameEnd(pending, end) ? null : end)
    }
  }

  const onRowKeyDown = (end: ConnectorEnd) => (event: ReactKeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      select(end)
    } else if (event.key === 'Escape') {
      setPending(null)
    }
  }

  const getRowSx = (end: ConnectorEnd) => ({
    ...sx.row,
    // The others of the same side are greyed out, the other side can be clicked
    ...(isSameEnd(pending, end) ? sx.selectedRow : pending?.side === end.side ? sx.inactiveRow : null),
  })

  // Same for fields and columns
  const getRowProps = (end: ConnectorEnd) => ({
    ref: setRowRef(end),
    'data-side': end.side,
    'data-key': end.key,
    role: 'button',
    tabIndex: 0,
    'aria-pressed': isSameEnd(pending, end),
    onClick: () => select(end),
    onMouseDown: preventFocus,
    onKeyDown: onRowKeyDown(end),
  })

  // The list a selected row can be connected to
  const isTarget = (side: ConnectorEnd['side']) => !!pending && pending.side !== side

  const getListSx = (side: ConnectorEnd['side']) => ({
    ...sx.list,
    ...(isTarget(side) ? sx.targetList : null),
  })

  // On the list's top edge, like the average on the transactions chart
  const renderTargetChip = (side: ConnectorEnd['side']) =>
    isTarget(side) ? (
      <Box component="span" sx={sx.targetChip}>
        {t(
          side === 'column'
            ? 'STATS_PAGE.PARSER_SETUP.CONNECTOR.PICK_COLUMN'
            : 'STATS_PAGE.PARSER_SETUP.CONNECTOR.PICK_FIELD',
        )}
      </Box>
    ) : null

  const renderFieldRow = (field: ConnectorField) => {
    const end: ConnectorEnd = { side: 'field', key: field.key }
    const isConnected = connections[field.key].length > 0
    const isMissing = field.isRequired && !isConnected

    return (
      <Box
        key={field.key}
        {...getRowProps(end)}
        sx={{ ...getRowSx(end), ...(field.isRequired ? null : { ...sx.compactRow, ...sx.optionalRow }) }}
      >
        <Box component="span" sx={sx.fieldText}>
          <Box component="span" data-label sx={{ ...sx.label, ...(isMissing ? sx.missingLabel : null) }}>
            {field.label}
            {field.isRequired ? ' *' : null}
          </Box>
          {field.note ? (
            <Box component="span" sx={sx.note}>
              {field.note}
            </Box>
          ) : null}
        </Box>
        {field.action ? (
          <Box
            component="span"
            onClick={stopPropagation}
            onMouseDown={stopPropagation}
            onKeyDown={stopPropagation}
            sx={sx.action}
          >
            {field.action}
          </Box>
        ) : null}
        {field.error ? (
          <Box component="span" role="alert" sx={sx.errorChip}>
            {field.error}
          </Box>
        ) : null}
        {isMissing ? (
          <Tooltip title={t('STATS_PAGE.PARSER_SETUP.CONNECTOR.MISSING')}>
            <ErrorOutlined color="error" sx={sx.missingIcon} />
          </Tooltip>
        ) : null}
        <Box
          component="span"
          data-dot
          sx={{ ...sx.dot, ...(isConnected ? sx.connectedDot : isMissing ? sx.missingDot : null) }}
        />
      </Box>
    )
  }

  return (
    <Box ref={containerRef} sx={sx.container}>
      <Box sx={sx.fields}>
        <Typography component="div" sx={sx.listTitle}>
          {t('STATS_PAGE.PARSER_SETUP.CONNECTOR.REQUIRED')}
        </Typography>
        {/* Both cards, the columns are as tall */}
        <Box ref={fieldsRef} sx={sx.fieldGroups}>
          <Box sx={sx.listFrame}>
            {renderTargetChip('field')}
            <Box sx={getListSx('field')}>{fields.filter((field) => field.isRequired).map(renderFieldRow)}</Box>
          </Box>
          <Typography component="div" sx={{ ...sx.listTitle, ...sx.optionalTitle }}>
            {t('STATS_PAGE.PARSER_SETUP.CONNECTOR.OPTIONAL')}
          </Typography>
          <Box sx={getListSx('field')}>{fields.filter((field) => !field.isRequired).map(renderFieldRow)}</Box>
        </Box>
      </Box>

      {/* Lines between the lists, above them so they reach the dots */}
      <Box component="svg" sx={sx.lines} aria-hidden>
        {layout
          ? Object.entries(connections).flatMap(([field, fieldColumns]) =>
              fieldColumns.map((column) => {
                const start = layout.anchors[toAnchorId({ side: 'field', key: field })]
                const end = layout.anchors[toAnchorId({ side: 'column', key: column })]

                return start && end ? (
                  <path
                    key={`${field}:${column}`}
                    d={getCurve(start, end)}
                    className={end.isOutOfView ? 'outOfView' : undefined}
                  />
                ) : null
              }),
            )
          : null}
      </Box>

      <Box sx={sx.columns}>
        <Typography component="div" sx={sx.listTitle}>
          {t('STATS_PAGE.PARSER_SETUP.CONNECTOR.COLUMNS')}
        </Typography>
        <Box sx={sx.listFrame}>
          {renderTargetChip('column')}
          <Box
            ref={columnsRef}
            onScroll={measure}
            sx={{ ...getListSx('column'), ...(layout ? sx.scrollList(layout.fieldsHeight) : null) }}
          >
            {columns.map((column) => {
              const end: ConnectorEnd = { side: 'column', key: column.name }

              return (
                <Box key={column.name} {...getRowProps(end)} sx={{ ...getRowSx(end), ...sx.compactRow }}>
                  <Box
                    component="span"
                    data-dot
                    sx={{ ...sx.dot, ...(connectedColumns.has(column.name) ? sx.connectedDot : null) }}
                  />
                  <Box component="span" sx={sx.columnText}>
                    <Box component="span" data-label sx={{ ...sx.label, ...sx.columnName }} title={column.name}>
                      {column.name}
                    </Box>
                    {column.sample ? (
                      <Box component="span" sx={sx.sample} title={column.sample}>
                        {column.sample}
                      </Box>
                    ) : null}
                  </Box>
                  {connectedColumns.has(column.name) ? (
                    <Tooltip title={t('STATS_PAGE.PARSER_SETUP.CONNECTOR.REMOVE')}>
                      <IconButton
                        size="small"
                        aria-label={t('STATS_PAGE.PARSER_SETUP.CONNECTOR.REMOVE')}
                        onClick={(event) => {
                          // Not a click on the row
                          event.stopPropagation()
                          onDisconnect(column.name)
                        }}
                        sx={sx.removeButton}
                      >
                        <CloseOutlined fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Component
