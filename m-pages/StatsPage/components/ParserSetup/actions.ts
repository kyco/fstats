import type { TFunction } from 'i18next'
import { mapValues, pick, without, xor } from 'lodash'

import type { CustomParserMapping, RowData, Transaction } from '@/types'
import { Currency } from '@/types-enums'
import { CONFIG } from '@/common'
import type { DetectedMapping, NumberFormat } from '@/utils/Parser'
import {
  createMappingParser,
  detectNumberFormat,
  getDataRows,
  getHeaderNames,
  getMatchingDateFormats,
  getTransactionRows,
} from '@/utils/Parser'

/**
 * The preview is confirmed first, most files are detected correctly, otherwise the columns are fixed. The currency
 * and number format are next to the preview.
 */
export const SetupStep = {
  REVIEW: 'review',
  FIX: 'fix',
  NAME: 'name',
} as const

export type SetupStep = (typeof SetupStep)[keyof typeof SetupStep]

/**
 * In order, each step is reached from the previous one.
 */
export const SETUP_STEPS = Object.values(SetupStep)

export type ColumnField =
  | 'date'
  | 'description'
  | 'moneyIn'
  | 'moneyOut'
  | 'balance'
  | 'reference'
  | 'transactionType'
  | 'category'
  | 'parentCategory'

/**
 * Can have multiple columns (e.g. money out and a fee), and share a signed amount column, see `toMapping`.
 */
const AMOUNT_FIELDS: ColumnField[] = ['moneyIn', 'moneyOut']

export const isAmountField = (field: ColumnField) => AMOUNT_FIELDS.includes(field)

const EXTRA_FIELDS = ['balance', 'reference', 'transactionType', 'category', 'parentCategory'] as const

/**
 * The form state, the connected header names per field. At most one, except for the amount fields.
 */
export type SetupDraft = {
  headerIndex: number
  bankName: string
  accountName: string
  currency: Currency
  dateFormat: string
  numberFormat: NumberFormat
  columns: Record<ColumnField, string[]>
}

const toList = (header: string | null | undefined) => (header ? [header] : [])

const getAmountColumns = (amount: DetectedMapping['columns']['amount']) => {
  switch (amount?.type) {
    case 'signed':
      return { moneyIn: [amount.header], moneyOut: [amount.header] }
    case 'inOut':
      return { moneyIn: [amount.in], moneyOut: [amount.out] }
    case 'sum':
      return { moneyIn: [...amount.signed, ...amount.in], moneyOut: [...amount.signed, ...amount.out] }
    default:
      return { moneyIn: [], moneyOut: [] }
  }
}

export const toDraft = (
  detected: DetectedMapping,
  { bankName = '', accountName = '' }: { bankName?: string; accountName?: string } = {},
): SetupDraft => {
  return {
    headerIndex: detected.headerIndex,
    bankName,
    accountName,
    currency: detected.currency ?? Currency.EUR,
    dateFormat: detected.dateFormat ?? '',
    numberFormat: detected.numberFormat ?? 'en',
    columns: {
      date: toList(detected.columns.date),
      description: toList(detected.columns.description),
      ...getAmountColumns(detected.columns.amount),
      ...mapValues(detected.extraColumns, toList),
    },
  }
}

/**
 * The columns to map, required ones first.
 */
export const COLUMN_FIELDS: { field: ColumnField; isRequired: boolean }[] = [
  ...(['date', 'description', ...AMOUNT_FIELDS] as const).map((field) => ({ field, isRequired: true })),
  ...EXTRA_FIELDS.map((field) => ({ field, isRequired: false })),
]

/**
 * The columns after `column` was clicked for `field`. The amount fields toggle it (they can have several), other
 * fields have only it. A column is read as one field only, so it's removed from others, except the amount fields which
 * can share a signed amount column.
 */
export const connectColumn = (
  columns: SetupDraft['columns'],
  field: ColumnField,
  column: string,
): SetupDraft['columns'] => {
  const next = mapValues(columns, (headers, key) =>
    isAmountField(field) && isAmountField(key as ColumnField) ? headers : without(headers, column),
  )

  return { ...next, [field]: isAmountField(field) ? xor(columns[field], [column]) : [column] }
}

/**
 * The changes after `column` was clicked for `field`, see `connectColumn`. A new date column gets a matching date
 * format, unless the current one matches already.
 */
export const getConnectChanges = (
  rows: RowData[],
  draft: SetupDraft,
  field: ColumnField,
  column: string,
): Partial<SetupDraft> => {
  const columns = connectColumn(draft.columns, field, column)
  const [dateColumn] = columns.date

  if (field === 'date' && dateColumn) {
    const matching = getMatchingDateFormats(getColumnValues(rows, draft.headerIndex, dateColumn))
    return matching.length && !matching.includes(draft.dateFormat) ? { columns, dateFormat: matching[0] } : { columns }
  }

  // The number format of the amounts, if they tell
  if (isAmountField(field) || field === 'balance') {
    const numberFormat = detectNumberFormat(getAmountValues(rows, draft.headerIndex, columns))
    return numberFormat && numberFormat !== draft.numberFormat ? { columns, numberFormat } : { columns }
  }

  return { columns }
}

/**
 * The values of the money in, money out and balance columns, e.g. to detect their number format.
 */
export const getAmountValues = (rows: RowData[], headerIndex: number, columns: SetupDraft['columns']) => {
  const headers = new Set([...columns.moneyIn, ...columns.moneyOut, ...columns.balance])
  return [...headers].flatMap((header) => getColumnValues(rows, headerIndex, header)).filter(Boolean)
}

/**
 * The columns without `column`, from all fields.
 */
export const disconnectColumn = (columns: SetupDraft['columns'], column: string): SetupDraft['columns'] => {
  return mapValues(columns, (headers) => without(headers, column))
}

/**
 * Bank and account names are set.
 */
export const isNamed = (draft: SetupDraft) => {
  return !!draft.bankName.trim() && !!draft.accountName.trim()
}

/**
 * How the amount is read from the money in and out columns. A column of both is signed (money out is negative). The
 * simplest type that fits, so the common cases stay readable.
 */
const toAmount = (moneyIn: string[], moneyOut: string[]): CustomParserMapping['columns']['amount'] => {
  const signed = moneyIn.filter((header) => moneyOut.includes(header))
  const onlyIn = moneyIn.filter((header) => !signed.includes(header))
  const onlyOut = moneyOut.filter((header) => !signed.includes(header))

  if (signed.length === 1 && !onlyIn.length && !onlyOut.length) {
    return { type: 'signed', header: signed[0] }
  }

  if (!signed.length && onlyIn.length === 1 && onlyOut.length === 1) {
    return { type: 'inOut', in: onlyIn[0], out: onlyOut[0] }
  }

  return { type: 'sum', signed, in: onlyIn, out: onlyOut }
}

/**
 * The mapping to save, `null` while columns are missing. Names may be empty, e.g. for the preview.
 */
export const toMapping = (draft: SetupDraft, rows: RowData[]): CustomParserMapping | null => {
  const { columns } = draft
  const [date] = columns.date
  const [description] = columns.description

  if (!date || !description || !columns.moneyIn.length || !columns.moneyOut.length || !draft.dateFormat) {
    return null
  }

  return {
    bankName: draft.bankName.trim(),
    accountName: draft.accountName.trim(),
    currency: draft.currency,
    dateFormat: draft.dateFormat,
    numberFormat: draft.numberFormat,
    headers: getHeaderNames(rows[draft.headerIndex] ?? []),
    columns: { date, description, amount: toAmount(columns.moneyIn, columns.moneyOut) },
    extraColumns: mapValues(pick(columns, EXTRA_FIELDS), ([header]) => header ?? null),
  }
}

export type SetupPreview = {
  transactions: Transaction[]
  error: string | null
}

const PREVIEW_ID = 'preview'

/**
 * The file parsed with the mapping, like it will be once saved.
 */
export const getPreview = (rows: RowData[], draft: SetupDraft): SetupPreview | null => {
  const mapping = toMapping(draft, rows)

  if (!mapping) {
    return null
  }

  const parser = createMappingParser(PREVIEW_ID, mapping)

  // Rows without a valid date (e.g. footers) are skipped, like when the file is parsed
  try {
    return { transactions: parser.parse(rows.slice(draft.headerIndex)), error: null }
  } catch (err) {
    return { transactions: [], error: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Why the preview has no transactions, `null` if it has.
 */
export const getPreviewMessageKey = (preview: SetupPreview | null) => {
  if (!preview) {
    return 'STATS_PAGE.PARSER_SETUP.PREVIEW_MISSING'
  }

  if (preview.error) {
    return 'STATS_PAGE.PARSER_SETUP.PREVIEW_INVALID'
  }

  return preview.transactions.length ? null : 'STATS_PAGE.PARSER_SETUP.PREVIEW_EMPTY'
}

/**
 * The preview has transactions and no errors, so the mapping can be saved.
 */
export const isValidPreview = (preview: SetupPreview | null): preview is SetupPreview => {
  return !!preview && !preview.error && preview.transactions.length > 0
}

/**
 * The values of a column in the transactions below the header (a sample), e.g. to check the date or number format.
 */
export const getColumnValues = (rows: RowData[], headerIndex: number, header: string, limit = 200) => {
  const index = (rows[headerIndex] ?? []).findIndex((cell) => cell.trim() === header)
  return index < 0 ? [] : getTransactionRows(rows, headerIndex, limit).map((row) => row[index] ?? '')
}

export const HeaderRowProblem = {
  /**
   * Fewer than two, e.g. a title.
   */
  NAMES: 'names',
  /**
   * No row below it has as many cells.
   */
  COLUMN_COUNT: 'columnCount',
} as const

export type HeaderRowProblem = (typeof HeaderRowProblem)[keyof typeof HeaderRowProblem]

/**
 * Why the row can't be the header, `null` if it can: it needs column names and rows below with as many cells.
 */
export const getHeaderRowProblem = (rows: RowData[], headerIndex: number): HeaderRowProblem | null => {
  if (getHeaderNames(rows[headerIndex] ?? []).length < 2) {
    return HeaderRowProblem.NAMES
  }

  return getDataRows(rows, headerIndex, 1).length ? null : HeaderRowProblem.COLUMN_COUNT
}

/**
 * First non-empty value of a column below the header, as an example.
 */
export const getSampleValue = (rows: RowData[], headerIndex: number, header: string) => {
  return (
    getColumnValues(rows, headerIndex, header, 50)
      .map((value) => value.trim())
      .find(Boolean) ?? ''
  )
}

/**
 * Transactions shown in the preview, the setup steps are below it.
 */
export const PREVIEW_ROWS = 10

// The row with the column names is near the top
const HEADER_ROW_OPTIONS = 30

/**
 * Indices of the first rows of the file to pick the row with the column names from, a few below the current one.
 */
export const getHeaderRowIndices = (rows: RowData[], headerIndex: number) => {
  return Array.from(
    { length: Math.min(rows.length, Math.max(HEADER_ROW_OPTIONS, headerIndex + 3)) },
    (_, index) => index,
  )
}

/**
 * Rows shown in the CSV tab.
 */
const CSV_ROWS = 20

/**
 * The first rows of the file as is, independent of the row picked as the header.
 */
export const getCsvRows = (rows: RowData[]) => {
  return rows.slice(0, CSV_ROWS)
}

/**
 * Next to the title, the number of transactions or rows.
 */
export const getPreviewCaption = (
  { preview, isCsv, rows }: { preview: SetupPreview | null; isCsv: boolean; rows: RowData[] },
  t: TFunction,
) => {
  if (isCsv) {
    return t('STATS_PAGE.DATA_VIEW.ROW_COUNT', { count: rows.length })
  }

  return isValidPreview(preview)
    ? t('STATS_PAGE.PARSER_SETUP.PREVIEW_COUNT', { count: preview.transactions.length })
    : undefined
}

/**
 * GitHub issue form (`.github/ISSUE_TEMPLATE/new-format.yml`) prefilled with the format, so it can be added as a
 * built-in one. Only the column names and settings, no transactions, the user reviews it before submitting.
 */
export const getFormatIssueHref = (mapping: CustomParserMapping) => {
  const url = new URL(`${CONFIG.GITHUB_URL}/issues/new`)
  url.searchParams.set('template', 'new-format.yml')
  url.searchParams.set('title', `New format: ${mapping.bankName} – ${mapping.accountName}`)
  url.searchParams.set('bank', mapping.bankName)
  url.searchParams.set('format', JSON.stringify(mapping, null, 2))
  url.searchParams.set('version', CONFIG.APP_VERSION)
  return url.toString()
}
