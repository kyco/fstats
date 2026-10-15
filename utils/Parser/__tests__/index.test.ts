import { readFileSync } from 'node:fs'
import { parse } from 'papaparse'
import { describe, expect, expectTypeOf, it } from 'vitest'

import type { RowData } from '@/types'
import { AccountType, Country, Currency } from '@/types-enums'
import type { BuiltInBankAccountId, BuiltInParserId } from '@/utils/Parser'
import {
  AVAILABLE_PARSERS,
  BANKS,
  createParser,
  defineBank,
  extractFileRows,
  findSections,
  getFormatHeaders,
  getReferencedHeaders,
  normalizeHeader,
  PARSER_IDS,
  toParserId,
} from '@/utils/Parser'

describe('registry', () => {
  it('should derive literal ID types', () => {
    expectTypeOf<BuiltInParserId>().toEqualTypeOf<
      | 'capitec__savings'
      | 'capitec__savings_legacy'
      | 'comdirect__giro'
      | 'comdirect__visa'
      | 'fnb__credit_card'
      | 'ing__giro'
      | 'lloyds__current'
      | 'n26__current'
      | 'trade_republic__current'
    >()
    expectTypeOf<BuiltInBankAccountId>().toEqualTypeOf<
      | 'capitec__savings'
      | 'comdirect__current'
      | 'comdirect__credit_card'
      | 'fnb__credit_card'
      | 'ing__current'
      | 'lloyds__current'
      | 'n26__current'
      | 'trade_republic__current'
    >()
  })

  it('should have unique parser IDs', () => {
    expect(new Set(PARSER_IDS).size).toBe(PARSER_IDS.length)
  })

  it('should have unique format IDs in snake_case per bank', () => {
    BANKS.forEach((bank) => {
      const ids = bank.formats.map((format) => format.id)
      expect(
        ids.filter((id) => !/^[a-z0-9]+(_[a-z0-9]+)*$/.test(id)),
        bank.id,
      ).toEqual([])
      expect(
        ids.filter((id, index) => ids.indexOf(id) !== index),
        bank.id,
      ).toEqual([])
    })
  })

  it('should expose all parsers where parser ID matches the registry key', () => {
    Object.entries(AVAILABLE_PARSERS).forEach(([key, parser]) => {
      expect(parser.id).toBe(key)
    })
  })

  it('should not have formats which could match files of another format', () => {
    const formats = BANKS.flatMap((bank) =>
      bank.formats.map((format) => {
        const { headers, required } = getFormatHeaders(format)
        return {
          id: toParserId(bank, format),
          headers: headers.map(normalizeHeader),
          required: required.map(normalizeHeader),
        }
      }),
    )

    const overlaps = formats.flatMap((a) =>
      formats
        .filter((b) => a.id !== b.id && a.required.every((header) => b.headers.includes(header)))
        .map((b) => `${a.id} matches ${b.id} files`),
    )

    expect(overlaps).toEqual([])
  })

  it('should only read headers listed in the format headers', () => {
    const unlisted = BANKS.flatMap((bank) =>
      bank.formats.flatMap((format) => {
        const { headers } = getFormatHeaders(format)
        return getReferencedHeaders(format)
          .filter((header) => !headers.includes(header))
          .map((header) => `${toParserId(bank, format)}: "${header}"`)
      }),
    )

    expect(unlisted).toEqual([])
  })
})

describe('createParser', () => {
  const bank = defineBank({
    id: 'test',
    name: 'Test',
    url: 'https://www.example.com/',
    country: Country.DE,
    currency: Currency.EUR,
    formats: [
      {
        id: 'giro',
        accountType: AccountType.CURRENT,
        accountName: 'Giro',
        dateFormat: 'dd.MM.yyyy',
        numberFormat: 'de',
        headers: ['Datum', 'Text', 'Betrag', 'Saldo', 'Referenz'],
        columns: { date: 'Datum', description: 'Text', amount: { type: 'signed', header: 'Betrag' } },
        extraColumns: {
          balance: 'Saldo',
          reference: 'Referenz',
          transactionType: null,
          category: null,
          parentCategory: null,
        },
      },
    ],
  })
  const parser = createParser(bank, bank.formats[0])
  const header = ['Datum', 'Text', 'Betrag', 'Saldo', 'Referenz']

  it('should omit empty extra cells and use null when all are empty', () => {
    const transactions = parser.parse([
      header,
      ['01.01.2024', 'A', '-1,50', '1.234,56', 'Ref'],
      ['02.01.2024', 'B', '2,00', '', 'Ref'],
      ['03.01.2024', 'C', '3,00', '', ''],
    ])

    expect(transactions.map((transaction) => transaction.extra)).toEqual([
      { balance: '1234.56', reference: 'Ref' },
      { reference: 'Ref' },
      null,
    ])
  })
})

describe('Trade Republic', () => {
  const csv = readFileSync(new URL('../__fixtures__/trade_republic_fake.csv', import.meta.url), 'utf8')
  const rows = parse<RowData>(csv, { header: false, skipEmptyLines: 'greedy' }).data
  const parseCsv = () => {
    const [section] = findSections(rows).sections

    return section.parser.parse(section.rows)
  }

  it('should match only the Trade Republic parser', () => {
    expect(findSections(rows).sections.map(({ parser }) => parser.id)).toEqual(['trade_republic__current'])
  })

  it('should keep cash and trading transactions', () => {
    expect(parseCsv().map(({ description, value }) => [description, value])).toEqual([
      ['Interest payment for payout collection 6188b6bc-f7f6-41e4-9af6-45574bffc855', '1.350000'],
      ['Apple Inc.', '2.170000'],
      ['Alex Example', '1200.000000'],
      ['Core MSCI World USD (Acc)', '-1000.00'],
      ['Core MSCI EM IMI USD (Acc)', '-500.00'],
      ['Shell plc', '328.92'],
      ['Alex Example', '850.000000'],
    ])
  })

  it('should store the category and transaction type as extra', () => {
    const [interest, dividend, deposit, buy] = parseCsv()

    expect(interest.extra).toEqual({ category: 'CASH', transactionType: 'INTEREST_PAYMENT' })
    expect(dividend.extra).toEqual({ category: 'CASH', transactionType: 'DIVIDEND' })
    expect(deposit.extra).toEqual({ category: 'CASH', transactionType: 'CUSTOMER_INPAYMENT' })
    expect(buy.extra).toEqual({ category: 'TRADING', transactionType: 'BUY' })
  })
})

describe('transaction IDs', () => {
  const header = ['Datum', 'Text', 'Betrag']
  const defineTestBank = (id: string) =>
    defineBank({
      id,
      name: id,
      url: 'https://www.example.com/',
      country: Country.DE,
      currency: Currency.EUR,
      formats: [
        {
          id: 'giro',
          accountType: AccountType.CURRENT,
          accountName: 'Giro',
          dateFormat: 'dd.MM.yyyy',
          numberFormat: 'de',
          headers: header,
          columns: { date: 'Datum', description: 'Text', amount: { type: 'signed', header: 'Betrag' } },
          extraColumns: { balance: null, reference: null, transactionType: null, category: null, parentCategory: null },
        },
      ],
    })
  const bankA = defineTestBank('bank_a')
  const parser = createParser(bankA, bankA.formats[0])
  const rows = [
    ['01.01.2024', 'A', '-1,00'],
    ['01.01.2024', 'Coffee', '-3,50'],
    ['01.01.2024', 'Coffee', '-3,50'],
    ['02.01.2024', 'B', '2,00'],
  ]

  it('should match for overlapping statements, even when a day is only partially included', () => {
    const full = parser.parse([header, ...rows])
    const partial = parser.parse([header, ...rows.slice(1)])

    expect(partial.map(({ id }) => id)).toEqual(full.slice(1).map(({ id }) => id))
  })

  it('should keep identical transactions on the same day apart', () => {
    const [, first, second] = parser.parse([header, ...rows])

    expect(first.id).not.toBe(second.id)
  })

  it('should differ between accounts', () => {
    const bankB = defineTestBank('bank_b')
    const otherParser = createParser(bankB, bankB.formats[0])

    expect(otherParser.parse([header, rows[0]])[0].id).not.toBe(parser.parse([header, rows[0]])[0].id)
  })
})

describe('findSections', () => {
  const giroHeader = ['Buchungstag', 'Wertstellung (Valuta)', 'Vorgang', 'Buchungstext', 'Umsatz in EUR', '']
  const visaHeader = ['Buchungstag', 'Umsatztag', 'Vorgang', 'Referenz', 'Buchungstext', 'Umsatz in EUR', '']
  const giroRow = (day: number) => [
    '30.01.2026',
    `${String(day).padStart(2, '0')}.01.2026`,
    'Lastschrift',
    `G${day}`,
    '-1,00',
    '',
  ]
  const visaRow = ['29.01.2026', '28.01.2026', 'Kartenumsatz', '123', 'Shop', '-159,00', '']
  const preamble = (title: string) => [title, 'Zeitraum: 01.01.2026 - 31.01.2026', '']

  // Giro section long enough that the Visa header is far from the top
  const giroRows = Array.from({ length: 200 }, (_, index) => giroRow((index % 28) + 1))
  const file = [
    [''],
    preamble('Umsätze Girokonto'),
    giroHeader,
    ...giroRows,
    ['Alter Kontostand', '1.000,00 EUR'],
    preamble('Umsätze Visa-Karte (Kreditkarte)'),
    visaHeader,
    visaRow,
    ['Neuer Kontostand', '-159,00 EUR'],
  ]

  it('should find one section per account anywhere in the file', () => {
    const { sections, error } = findSections(file)

    expect(error).toBe('')
    expect(sections.map(({ parser }) => parser.id)).toEqual(['comdirect__giro', 'comdirect__visa'])
    expect(sections.map(({ parser, rows }) => parser.parse(rows).length)).toEqual([200, 1])
  })

  it('should not include rows of the next section', () => {
    const [giro] = findSections(file).sections

    expect(giro.rows.at(-1)).toEqual(preamble('Umsätze Visa-Karte (Kreditkarte)'))
  })

  it('should find a single section', () => {
    const { sections } = findSections([preamble('Umsätze Visa-Karte (Kreditkarte)'), visaHeader, visaRow])

    expect(sections.map(({ parser }) => parser.id)).toEqual(['comdirect__visa'])
  })

  it('should drop sections without transactions', () => {
    const { sections } = findSections([giroHeader, ['Keine Umsätze vorhanden.'], visaHeader, visaRow])

    expect(sections.map(({ parser }) => parser.id)).toEqual(['comdirect__visa'])
  })

  it('should explain why nothing matched', () => {
    expect(findSections([giroHeader]).error).toContain('Header found in row 1, but no transaction rows')
    expect(findSections([giroHeader.slice(0, 4), giroRow(1)]).error).toContain('Missing columns: "Umsatz in EUR"')
    expect(
      findSections([
        ['a', 'b'],
        ['1', '2'],
      ]).error,
    ).toBe('No matching parser found!')
  })

  it('should extract the rows of each section', () => {
    expect(extractFileRows(file)).toEqual([
      { accountName: 'Giro', header: giroHeader, rows: giroRows },
      { accountName: 'Visa', header: visaHeader, rows: [visaRow] },
    ])
  })
})
