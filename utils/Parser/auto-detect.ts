import { isValid, parse } from 'date-fns'
import { maxBy, meanBy, minBy, uniqBy } from 'lodash'

import type { CustomParserMapping, RowData } from '@/types'
import { Currency } from '@/types-enums'

import { normalizeHeader } from './create-parser'
import { createMappingParser } from './custom'

/**
 * Date formats offered for custom parsers, the first one matching all dates of a column is detected. Day first before
 * month first, so ambiguous dates (all days <= 12) are read the European way.
 */
export const DATE_FORMATS = [
  'dd.MM.yyyy',
  'dd.MM.yy',
  'dd/MM/yyyy',
  'MM/dd/yyyy',
  'dd/MM/yy',
  'MM/dd/yy',
  'yyyy-MM-dd',
  'dd-MM-yyyy',
  'yyyy/MM/dd',
  'yyyyMMdd',
  'd MMM yyyy',
  'dd MMM yyyy',
  'yyyy-MM-dd HH:mm:ss',
  'yyyy-MM-dd HH:mm',
  'dd.MM.yyyy HH:mm',
  'dd/MM/yyyy HH:mm',
] as const

export type NumberFormat = CustomParserMapping['numberFormat']

export type DetectedMapping = {
  /**
   * Index of the header row in the file.
   */
  headerIndex: number
  dateFormat: string | null
  numberFormat: NumberFormat | null
  currency: Currency | null
  columns: {
    date: string | null
    description: string | null
    amount: CustomParserMapping['columns']['amount'] | null
  }
  extraColumns: { [K in keyof CustomParserMapping['extraColumns']]: string | null }
}

// Header names are compared normalized (see `normalizeHeader`), most specific first
const toSynonyms = (names: string[]) => names.map(normalizeHeader)

const DATE_SYNONYMS = toSynonyms([
  'Buchungstag',
  'Buchungsdatum',
  'Buchung',
  'Transaction Date',
  'Booking Date',
  'Posting Date',
  'Date',
  'Datum',
  'Valuta',
  'Value Date',
  'Wertstellung',
])
const AMOUNT_SYNONYMS = toSynonyms(['Amount', 'Betrag', 'Umsatz', 'Value', 'Wert', 'Bedrag', 'Montant', 'Importe'])
const IN_SYNONYMS = toSynonyms(['Money In', 'Paid In', 'Credit', 'Haben', 'Eingang', 'Gutschrift', 'Deposit'])
const OUT_SYNONYMS = toSynonyms(['Money Out', 'Paid Out', 'Debit', 'Soll', 'Ausgang', 'Lastschrift', 'Withdrawal'])
const BALANCE_SYNONYMS = toSynonyms(['Balance', 'Saldo', 'Kontostand'])
const DESCRIPTION_SYNONYMS = toSynonyms([
  'Description',
  'Beschreibung',
  'Verwendungszweck',
  'Buchungstext',
  'Details',
  'Narrative',
  'Particulars',
  'Payee',
  'Empfänger',
  'Auftraggeber',
  'Merchant',
  'Memo',
  'Name',
  'Text',
])
const REFERENCE_SYNONYMS = toSynonyms(['Reference', 'Referenz', 'Mandatsreferenz', 'Kundenreferenz', 'Ref'])
const TYPE_SYNONYMS = toSynonyms(['Transaction Type', 'Type', 'Buchungsart', 'Umsatzart', 'Vorgang', 'Art'])
const PARENT_CATEGORY_SYNONYMS = toSynonyms(['Parent Category', 'Hauptkategorie', 'Oberkategorie'])
const CATEGORY_SYNONYMS = toSynonyms(['Category', 'Kategorie', 'Umsatzkategorie'])

const CURRENCY_SYMBOLS: Record<string, Currency> = { '€': Currency.EUR, '£': Currency.GBP }

const NUMBER = /^-?(\d+|\d{1,3}([.,' ]\d{3})+)([.,]\d+)?$/

const MIN_DATE_SHARE = 0.5

const MIN_YEAR = 1970
const MAX_YEAR = 2100

// Enough to detect a format, without parsing large files completely
const MAX_HEADER_INDEX = 30
const HEADER_SAMPLE_SIZE = 10
const COLUMN_SAMPLE_SIZE = 200

const isNumberLike = (value: string) => NUMBER.test(value)

const isDate = (value: string, format: string) => {
  const date = parse(value, format, new Date())
  return isValid(date) && date.getFullYear() >= MIN_YEAR && date.getFullYear() <= MAX_YEAR
}

const isDateLike = (value: string) => /\d/.test(value) && DATE_FORMATS.some((format) => isDate(value, format))

const hasDate = (row: RowData) => row.some((cell) => isDateLike(cell.trim()))

// The formats all of the dates can be read with
const getDateFormats = (dates: string[]) =>
  DATE_FORMATS.filter((format) => dates.every((value) => isDate(value, format)))

/**
 * The formats all dates of a column can be read with. Values that aren't dates in any format (e.g. a "Total" footer)
 * are ignored, a column without dates matches none.
 */
export const getMatchingDateFormats = (values: string[]): string[] => {
  const dates = values.map((value) => value.trim()).filter(isDateLike)
  return dates.length ? getDateFormats(dates) : []
}

type GetDataRowsProps = {
  rows: RowData[]
  headerIndex: number
  limit?: number
}

/**
 * Rows after the header row with as many cells, like the transaction rows `createParser` reads.
 */
export const getDataRows = ({ rows, headerIndex, limit = Infinity }: GetDataRowsProps): RowData[] => {
  const header = rows[headerIndex]
  const dataRows: RowData[] = []

  if (!header) {
    return dataRows
  }

  for (let index = headerIndex + 1; index < rows.length && dataRows.length < limit; index += 1) {
    if (rows[index].length === header.length) {
      dataRows.push(rows[index])
    }
  }

  return dataRows
}

type GetTransactionRowsProps = {
  rows: RowData[]
  headerIndex: number
  limit?: number
}

/**
 * The data rows (see `getDataRows`) with a date, i.e. transactions. Other rows with as many cells (e.g. a repeated
 * header row or totals) would make columns look like text. Without any dates, all data rows.
 */
export const getTransactionRows = ({ rows, headerIndex, limit = Infinity }: GetTransactionRowsProps): RowData[] => {
  const header = rows[headerIndex]
  const dataRows: RowData[] = []
  const transactionRows: RowData[] = []

  // Stops at the limit, checking every cell for a date is slow for large files
  for (let index = headerIndex + 1; header && index < rows.length && transactionRows.length < limit; index += 1) {
    const row = rows[index]

    if (row.length === header.length) {
      dataRows.push(row)

      if (hasDate(row)) {
        transactionRows.push(row)
      }
    }
  }

  return transactionRows.length ? transactionRows : dataRows.slice(0, limit)
}

/**
 * The non-empty header names of a row, each once (the first of equal names is read, see `createParser`).
 */
export const getHeaderNames = (row: RowData): string[] => {
  return uniqBy(row.map((cell) => cell.trim()).filter(Boolean), normalizeHeader)
}

/**
 * The row could hold column names: some text, no dates and mostly no numbers (e.g. not a transaction).
 */
export const looksLikeHeader = (row: RowData) => {
  const cells = row.map((cell) => cell.trim()).filter(Boolean)
  return cells.length >= 2 && !cells.some(isDateLike) && cells.filter(isNumberLike).length <= cells.length / 2
}

/**
 * Rows that could hold the column names (see `looksLikeHeader`) with rows with dates below, in file order. The score is
 * the number of such rows (of a sample), so the rows of transactions.
 */
export const getHeaderCandidates = (rows: RowData[]): { index: number; score: number }[] => {
  return rows
    .slice(0, MAX_HEADER_INDEX)
    .map((row, index) => ({
      index,
      score: looksLikeHeader(row)
        ? getDataRows({ rows, headerIndex: index, limit: HEADER_SAMPLE_SIZE }).filter(hasDate).length
        : 0,
    }))
    .filter(({ score }) => score > 0)
}

/**
 * The row followed by the most rows with a date, among the first rows that look like a header (text, no dates).
 */
export const detectHeaderIndex = (rows: RowData[]): number => {
  return maxBy(getHeaderCandidates(rows), 'score')?.index ?? 0
}

type Column = {
  name: string
  key: string
  values: string[]
  dateFormats: string[]
  /**
   * All values are numbers, true for empty columns (e.g. "Money In" without income).
   */
  isAmountLike: boolean
  isNumeric: boolean
  isText: boolean
}

const toColumns = (header: RowData, dataRows: RowData[]): Column[] => {
  const columns = header.map((cell, index) => {
    const name = cell.trim()
    const values = dataRows.map((row) => row[index]?.trim() ?? '').filter(Boolean)
    // Footer rows (e.g. totals) can have as many cells, so most values being dates is enough
    const dates = values.filter(isDateLike)
    const dateFormats = dates.length && dates.length > values.length * MIN_DATE_SHARE ? getDateFormats(dates) : []
    const isAmountLike = values.every(isNumberLike)

    return {
      name,
      key: normalizeHeader(name),
      values,
      dateFormats,
      isAmountLike,
      isNumeric: isAmountLike && values.length > 0,
      isText: values.length > 0 && !isAmountLike && !dateFormats.length,
    }
  })

  return uniqBy(
    columns.filter((column) => column.name),
    (column) => column.key,
  )
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Position of the first synonym the header is or contains as a word, -1 if none. Lower is a better match.
 */
const getSynonymRank = (key: string, synonyms: string[]) => {
  // "?" stands for non-ASCII letters, see `normalizeHeader`
  return synonyms.findIndex(
    (synonym) => key === synonym || new RegExp(`(^|[^a-z?])${escapeRegExp(synonym)}($|[^a-z?])`).test(key),
  )
}

type PickColumnProps = {
  columns: Column[]
  synonyms: string[]
  isCandidate: (column: Column) => boolean
  used: Set<string>
}

/**
 * The unused column best matching the synonyms, the first one on equal rank.
 */
const pickColumn = ({ columns, synonyms, isCandidate, used }: PickColumnProps) => {
  const ranked = columns
    .filter((column) => !used.has(column.name) && isCandidate(column))
    .map((column) => ({ column, rank: getSynonymRank(column.key, synonyms) }))
    .filter(({ rank }) => rank >= 0)

  return minBy(ranked, 'rank')?.column ?? null
}

/**
 * The number format of amounts, `null` if they don't tell (e.g. only "1,234" or "12").
 */
export const detectNumberFormat = (values: string[]): NumberFormat | null => {
  let en = 0
  let de = 0

  values.forEach((value) => {
    const dots = value.split('.').length - 1
    const commas = value.split(',').length - 1
    const decimals = value.split(/[.,]/).at(-1)?.length ?? 0

    if (dots && commas) {
      // The last separator is the decimal one
      if (value.lastIndexOf(',') > value.lastIndexOf('.')) de += 1
      else en += 1
    } else if (commas) {
      // "1,50" or "1.234.567" vs "1,234"
      if (commas === 1 && decimals !== 3) de += 1
      else if (commas > 1) en += 1
    } else if (dots) {
      if (dots === 1 && decimals !== 3) en += 1
      else if (dots > 1) de += 1
    }
  })

  return en === de ? null : en > de ? 'en' : 'de'
}

/**
 * The number formats the amounts can be read with: the detected one, both if they don't tell (e.g. only "1,234" or
 * "3"), none if they aren't numbers.
 */
export const getMatchingNumberFormats = (values: string[]): NumberFormat[] => {
  const amounts = values.map((value) => value.trim()).filter(Boolean)

  if (!amounts.length || !amounts.every(isNumberLike)) {
    return []
  }

  const detected = detectNumberFormat(amounts)
  return detected ? [detected] : ['en', 'de']
}

/**
 * The currency mentioned most in the header and the first rows (codes like "EUR" or symbols like "€").
 */
const detectCurrency = (rows: RowData[]): Currency | null => {
  const codes = new Set<string>(Object.values(Currency))
  const counts = new Map<Currency, number>()
  const count = (currency: Currency) => counts.set(currency, (counts.get(currency) ?? 0) + 1)

  rows.flat().forEach((cell) => {
    cell
      .toUpperCase()
      .match(/\b[A-Z]{3}\b/g)
      ?.filter((code) => codes.has(code))
      .forEach((code) => count(code as Currency))
    Object.entries(CURRENCY_SYMBOLS)
      .filter(([symbol]) => cell.includes(symbol))
      .forEach(([, currency]) => count(currency))
  })

  return maxBy([...counts.entries()], ([, total]) => total)?.[0] ?? null
}

/**
 * Best guess of how to read a file of an unknown format, from its header names and values. Fields that couldn't be
 * detected are `null`.
 */
export const detectMapping = (rows: RowData[], headerIndex = detectHeaderIndex(rows)): DetectedMapping => {
  const header = rows[headerIndex] ?? []
  const dataRows = getTransactionRows({ rows, headerIndex, limit: COLUMN_SAMPLE_SIZE })
  const columns = toColumns(header, dataRows)
  const used = new Set<string>()
  const claim = (column: Column | null) => {
    if (column) used.add(column.name)
    return column
  }

  const date = claim(
    pickColumn({ columns, synonyms: DATE_SYNONYMS, isCandidate: (column) => column.dateFormats.length > 0, used }) ??
      columns.find((column) => column.dateFormats.length) ??
      null,
  )

  const isAmountColumn = (column: Column) => column.isAmountLike
  // Both or neither, a single one is no amount
  const moneyIn = pickColumn({ columns, synonyms: IN_SYNONYMS, isCandidate: isAmountColumn, used })
  const moneyOut = pickColumn({ columns, synonyms: OUT_SYNONYMS, isCandidate: isAmountColumn, used })
  const inOut = moneyIn && moneyOut ? { moneyIn: claim(moneyIn)!, moneyOut: claim(moneyOut)! } : null
  const signed = inOut
    ? null
    : claim(pickColumn({ columns, synonyms: AMOUNT_SYNONYMS, isCandidate: (column) => column.isNumeric, used }))

  const balance = claim(pickColumn({ columns, synonyms: BALANCE_SYNONYMS, isCandidate: isAmountColumn, used }))
  // Without known names, the first numeric column, preferring one with negative values
  const numeric = columns.filter((column) => column.isNumeric && !used.has(column.name))
  const fallback = inOut
    ? null
    : (signed ?? claim(numeric.find((column) => column.values.some((value) => value.startsWith('-'))) ?? numeric[0]))

  // Before the description, which could otherwise be a category column. The parent first, "Category" matches it too.
  const parentCategory = claim(
    pickColumn({ columns, synonyms: PARENT_CATEGORY_SYNONYMS, isCandidate: (column) => !column.isNumeric, used }),
  )
  const category = claim(
    pickColumn({ columns, synonyms: CATEGORY_SYNONYMS, isCandidate: (column) => !column.isNumeric, used }),
  )

  const description = claim(
    pickColumn({ columns, synonyms: DESCRIPTION_SYNONYMS, isCandidate: (column) => column.isText, used }) ??
      maxBy(
        columns.filter((column) => column.isText && !used.has(column.name)),
        (column) => meanBy(column.values, 'length'),
      ) ??
      null,
  )
  const reference = claim(pickColumn({ columns, synonyms: REFERENCE_SYNONYMS, isCandidate: () => true, used }))
  const transactionType = claim(
    pickColumn({ columns, synonyms: TYPE_SYNONYMS, isCandidate: (column) => !column.isNumeric, used }),
  )

  const amount: DetectedMapping['columns']['amount'] = inOut
    ? { type: 'inOut', in: inOut.moneyIn.name, out: inOut.moneyOut.name }
    : fallback
      ? { type: 'signed', header: fallback.name }
      : null
  const amountValues = [moneyIn, moneyOut, fallback, balance].flatMap((column) => column?.values ?? [])

  return {
    headerIndex,
    dateFormat: date?.dateFormats[0] ?? null,
    numberFormat: detectNumberFormat(amountValues),
    currency: detectCurrency([header, ...dataRows.slice(0, HEADER_SAMPLE_SIZE)]),
    columns: { date: date?.name ?? null, description: description?.name ?? null, amount },
    extraColumns: {
      balance: balance?.name ?? null,
      reference: reference?.name ?? null,
      transactionType: transactionType?.name ?? null,
      category: category?.name ?? null,
      parentCategory: parentCategory?.name ?? null,
    },
  }
}

/**
 * Whether a file of an unknown format can be read with the detected mapping, i.e. it has transactions. Such files can
 * be set up as a custom parser.
 */
export const canConvert = (rows: RowData[]): boolean => {
  const { headerIndex, dateFormat, numberFormat, columns, extraColumns } = detectMapping(rows)
  const { date, description, amount } = columns

  if (!dateFormat || !date || !description || !amount) {
    return false
  }

  const parser = createMappingParser('detected', {
    // Only the columns and formats matter here
    bankName: '-',
    accountName: '-',
    currency: Currency.EUR,
    dateFormat,
    numberFormat: numberFormat ?? 'en',
    headers: getHeaderNames(rows[headerIndex] ?? []),
    columns: { date, description, amount },
    extraColumns,
  })

  try {
    return parser.parse(rows.slice(headerIndex)).length > 0
  } catch {
    return false
  }
}
