'use client'

import { Box } from '@mui/material'
import { format } from 'date-fns'
import { useMemo } from 'react'

import type { ColumnField, RowData, SetupDraft } from '@/types'
import { DATE_FORMATS, getHeaderNames, getMatchingDateFormats } from '@/utils/Parser'
import { useTranslation } from '@/lib/i18n'

import { COLUMN_FIELDS, disconnectColumn, getColumnValues, getConnectChanges, getSampleValue } from '../../actions'
import FormatSelect from '../FormatSelect'
import { EXAMPLE_DATE, FIELD_LABEL_KEYS } from './actions'
import { ColumnConnector } from './components'
import { ui } from './styled'

type ColumnMappingProps = {
  rows: RowData[]
  draft: SetupDraft
  onChange: (changes: Partial<SetupDraft>) => void
}

/**
 * Which column of the file is which transaction field, and how dates and numbers are written.
 */
const Component = ({ rows, draft, onChange }: ColumnMappingProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const headerNames = useMemo(() => getHeaderNames(rows[draft.headerIndex] ?? []), [rows, draft.headerIndex])
  const [dateColumn] = draft.columns.date
  const matchingDateFormats = useMemo(
    () =>
      dateColumn
        ? getMatchingDateFormats(getColumnValues({ rows, headerIndex: draft.headerIndex, header: dateColumn }))
        : [],
    [rows, draft.headerIndex, dateColumn],
  )
  // Only with a column, without one there's nothing to match
  const isDateMismatch = !!dateColumn && !matchingDateFormats.includes(draft.dateFormat)
  // The format is picked when connecting the column, so there's only a choice if several match (e.g. day or month
  // first) or none
  const hasDateChoice =
    !!dateColumn && !(matchingDateFormats.length === 1 && matchingDateFormats[0] === draft.dateFormat)

  const getFieldControls = (field: ColumnField) => {
    if (field === 'date') {
      return {
        action: hasDateChoice ? (
          <FormatSelect
            title={t('STATS_PAGE.PARSER_SETUP.DATE_FORMAT')}
            value={draft.dateFormat}
            options={DATE_FORMATS.map((dateFormat) => ({
              value: dateFormat,
              label: format(EXAMPLE_DATE, dateFormat),
              isMatch: matchingDateFormats.includes(dateFormat),
            }))}
            isError={isDateMismatch}
            onChange={(dateFormat) => onChange({ dateFormat })}
          />
        ) : undefined,
        error: isDateMismatch ? t('STATS_PAGE.PARSER_SETUP.CONNECTOR.DATE_MISMATCH') : undefined,
      }
    }

    return null
  }

  return (
    <Box sx={sx.container}>
      <ColumnConnector
        fields={COLUMN_FIELDS.map(({ field, isRequired }) => ({
          key: field,
          label: t(FIELD_LABEL_KEYS[field]),
          isRequired,
          note:
            field === 'moneyIn'
              ? t('STATS_PAGE.PARSER_SETUP.CONNECTOR.MULTIPLE_IN')
              : field === 'moneyOut'
                ? t('STATS_PAGE.PARSER_SETUP.CONNECTOR.MULTIPLE_OUT')
                : undefined,
          ...getFieldControls(field),
        }))}
        columns={headerNames.map((name) => ({
          name,
          sample: getSampleValue({ rows, headerIndex: draft.headerIndex, header: name }),
        }))}
        connections={draft.columns}
        onConnect={(field, column) => onChange(getConnectChanges({ rows, draft, field: field as ColumnField, column }))}
        onDisconnect={(column) => onChange({ columns: disconnectColumn(draft.columns, column) })}
      />
    </Box>
  )
}

export default Component
