import { formatISO, isValid, parse, parseISO } from 'date-fns'

import type { BankDef, ExtraField, FormatDef, Parser, RowData, Transaction } from '@/types'
import { SortOrder } from '@/types-enums'
import { getCategoryCode } from '@/utils/Category'
import { getUniqueTimestamps, toDate } from '@/utils/Date'
import { cyrb53 } from '@/utils/Hash'
import { logger } from '@/utils/Logger'
import { parseGermanNumber } from '@/utils/Number'
import { Big } from '@/lib/w-big'

import { getFormatHeaders, toAccountId, toParserId } from './definition'
import type { BankAccountId, ParserId } from './registry'

const NUMERIC_EXTRA_FIELDS: ExtraField[] = ['balance']

/**
 * Bump when the parse output changes (e.g. how transaction IDs are generated or transactions are categorised), so
 * stored files are re-parsed.
 */
export const PARSER_VERSION = 5

type Row = {
  get: (header: string) => string
}

/**
 * Turns a declarative bank format into a parser. Parsers work on sections, i.e. rows starting at the header row up to
 * the next section (see `findSections`).
 */
export const createParser = (bank: Pick<BankDef, 'id' | 'name' | 'currency'>, format: FormatDef): Parser => {
  const { columns, extraColumns, dateFormat, numberFormat } = format
  const { amount } = columns
  const { headers, required } = getFormatHeaders(format)

  const descriptionHeaders = typeof columns.description === 'string' ? [columns.description] : columns.description

  // Thousands separators aren't valid in number strings, e.g. "1,234.56"
  const toNumber = (value: string) => (numberFormat === 'de' ? parseGermanNumber(value) : value.replace(/,/g, ''))

  const isValidDate = (value: string) => isValid(parse(value, dateFormat, new Date()))

  const getValue = (row: Row): string => {
    switch (amount.type) {
      case 'signed':
        return toNumber(row.get(amount.header))
      case 'inOut': {
        const moneyIn = row.get(amount.in)
        const moneyOut = row.get(amount.out)
        // Banks differ on whether "out" values are already negative
        return moneyIn ? toNumber(moneyIn) : moneyOut ? Big(toNumber(moneyOut)).abs().times(-1).toString() : ''
      }
      case 'firstOf':
        return toNumber(amount.headers.map(row.get).find(Boolean) ?? '')
      case 'sum': {
        const parts = [
          ...amount.signed.map((header) => ({ value: row.get(header), sign: 0 })),
          ...amount.in.map((header) => ({ value: row.get(header), sign: 1 })),
          ...amount.out.map((header) => ({ value: row.get(header), sign: -1 })),
        ].filter(({ value }) => value)

        return parts.length
          ? parts
              .reduce((total, { value, sign }) => {
                const number = Big(toNumber(value))
                return total.plus(sign ? number.abs().times(sign) : number)
              }, Big(0))
              .toString()
          : ''
      }
    }
  }

  const getDescription = (row: Row): string => descriptionHeaders.map(row.get).find(Boolean) ?? ''

  const getExtra = (row: Row): Transaction['extra'] => {
    const fields = (Object.entries(extraColumns) as [ExtraField, string | null][])
      .filter((entry): entry is [ExtraField, string] => !!entry[1])
      .map(([field, header]): [ExtraField, string] => {
        const value = row.get(header)
        return [field, value && NUMERIC_EXTRA_FIELDS.includes(field) ? toNumber(value) : value]
      })
      // Empty cells are omitted rather than stored as '' or '0'
      .filter(([, value]) => value)

    return fields.length ? Object.fromEntries(fields) : null
  }

  const normalizedRequired = required.map(normalizeHeader)

  const getMissingHeaders = (row: RowData) => {
    const rowHeaders = new Set(row.map(normalizeHeader))
    return required.filter((_, index) => !rowHeaders.has(normalizedRequired[index]))
  }

  const locateRows = ([header = [], ...body]: RowData[]) => {
    const normalizedHeader = header.map(normalizeHeader)
    const indexes = new Map(headers.map((name) => [name, normalizedHeader.indexOf(normalizeHeader(name))]))

    const toRow = (row: RowData): Row => ({
      get: (name) => row[indexes.get(name) ?? -1]?.trim() ?? '',
    })

    const rawRows = body
      // Rows with a different column count are footers or notes
      .filter((row) => row.length === header.length)
      .filter((row) => isValidDate(toRow(row).get(columns.date)))

    return { header, rawRows, rows: rawRows.map(toRow) }
  }

  return {
    id: toParserId(bank, format) as ParserId,
    bankAccountId: toAccountId(bank, format) as BankAccountId,
    bankName: bank.name,
    accountName: format.accountName,
    currency: bank.currency,

    requiredHeaders: required,
    getMissingHeaders,

    extractRows: (section) => {
      const { header, rawRows } = locateRows(section)
      return { header, rows: rawRows }
    },

    parse: (section) => {
      const [header = []] = section
      const missing = getMissingHeaders(header)

      if (missing.length) {
        throw new Error(`Missing columns: ${missing.map((name) => `"${name}"`).join(', ')}`)
      }

      // Unlisted headers still match, but the definition may need updating
      const knownHeaders = headers.map(normalizeHeader)
      const unexpectedHeaders = header
        .map((name) => name.trim())
        .filter((name) => name && !knownHeaders.includes(normalizeHeader(name)))

      if (unexpectedHeaders.length) {
        logger('warn', 'Parser', `Unexpected headers for ${toParserId(bank, format)}:`, unexpectedHeaders)
      }

      const parsedRows: Omit<Transaction, 'id'>[] = locateRows(section).rows.map((row) => ({
        date: formatISO(toDate(row.get(columns.date), { formatFrom: dateFormat })),
        description: getDescription(row),
        value: getValue(row) || '0',
        category: null,
        currency: bank.currency,
        extra: getExtra(row),
      }))

      const dates = parsedRows.map((row) => parseISO(row.date))
      const uniqueTimestamps = getUniqueTimestamps({ dates, dateFormat, sortOrder: getCsvSortOrder(dates) })
      const getId = createTransactionIdGenerator(toAccountId(bank, format))

      return parsedRows.map((row, index) => {
        // ID from the date as in the file, the unique timestamps depend on the other rows of the day
        const transaction: Transaction = { ...row, id: getId(row), date: formatISO(uniqueTimestamps[index]) }
        return { ...transaction, category: getCategoryCode(transaction) }
      })
    },
  }
}

/**
 * IDs are a hash of the account and transaction content (excluding the derived `category`), so they are stable across
 * re-parses and equal for the same transaction in overlapping statements. Identical transactions within a file (e.g.
 * two equal payments on the same day) get a counter suffix.
 */
const createTransactionIdGenerator = (accountId: string) => {
  const seen = new Map<string, number>()

  return ({ date, description, value, currency, extra }: Omit<Transaction, 'id' | 'category'>): string => {
    const sortedExtra = extra ? Object.entries(extra).sort(([a], [b]) => a.localeCompare(b)) : null
    const id = cyrb53(JSON.stringify([accountId, date, description, value, currency, sortedExtra]))
    const count = (seen.get(id) ?? 0) + 1
    seen.set(id, count)
    return count === 1 ? id : `${id}-${count}`
  }
}

/**
 * Makes header comparison tolerant to case, whitespace, BOM, quotes and encoding:
 * non-ASCII chars (incl. "�" from mis-decoded files) collapse to "?", so "Empfänger" === "Empf�nger".
 */
export const normalizeHeader = (value: string) => {
  return value
    .replace(/^﻿/, '')
    .replace(/"/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\x20-\x7E]/g, '?')
}

const getCsvSortOrder = (dates: Date[]): SortOrder => {
  let asc = 0
  let desc = 0

  for (let index = 1; index < dates.length; index += 1) {
    const previous = dates[index - 1].getTime()
    const current = dates[index].getTime()

    if (current > previous) {
      asc += 1
      continue
    }

    if (current < previous) {
      desc += 1
    }
  }

  return desc > asc ? SortOrder.DESC : SortOrder.ASC
}
