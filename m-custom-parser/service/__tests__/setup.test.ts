import { describe, expect, it } from 'vitest'

import { detectMapping } from '@/utils/Parser'

import {
  connectColumn,
  disconnectColumn,
  getAmountValues,
  getConnectChanges,
  getFormatIssueHref,
  getHeaderRowProblem,
  getPreview,
  isNamed,
  toDraft,
  toMapping,
} from '../setup'

const rows = [
  ['Export', ''],
  ['Date', 'Details', 'Paid in', 'Paid out', ''],
  ['15/01/2026', 'Coffee', '', '3.50', ''],
  ['16/01/2026', 'Refund', '1,000.00', '', ''],
  ['Total', '', '', '', ''],
]

const toTestDraft = () => toDraft(detectMapping(rows), { bankName: ' My Bank ', accountName: 'Current' })

describe('toMapping', () => {
  it('should map the detected columns', () => {
    expect(toMapping(toTestDraft(), rows)).toEqual({
      bankName: 'My Bank',
      accountName: 'Current',
      currency: 'EUR',
      dateFormat: 'dd/MM/yyyy',
      numberFormat: 'en',
      headers: ['Date', 'Details', 'Paid in', 'Paid out'],
      columns: { date: 'Date', description: 'Details', amount: { type: 'inOut', in: 'Paid in', out: 'Paid out' } },
      extraColumns: { balance: null, reference: null, transactionType: null, category: null, parentCategory: null },
    })
  })

  it('should be null while required columns are missing', () => {
    const testDraft = toTestDraft()
    const draft = { ...testDraft, columns: { ...testDraft.columns, moneyOut: [] } }

    expect(toMapping(draft, rows)).toBeNull()
  })

  it('should require bank and account names', () => {
    expect(isNamed(toTestDraft())).toBe(true)
    expect(isNamed({ ...toTestDraft(), bankName: ' ' })).toBe(false)
  })

  it('should read one column for money in and out as a signed amount', () => {
    const testDraft = toTestDraft()
    const columns = { ...testDraft.columns, moneyIn: ['Paid in'], moneyOut: ['Paid in'] }

    expect(toMapping({ ...testDraft, columns }, rows)?.columns.amount).toEqual({ type: 'signed', header: 'Paid in' })
  })

  it('should sum several money in and out columns', () => {
    const feeRows = [
      ['Date', 'Details', 'In', 'Out', 'Fee'],
      ['15/01/2026', 'Coffee', '', '3.50', '-0.20'],
      ['16/01/2026', 'Refund', '10.00', '', ''],
    ]
    const testDraft = toDraft(detectMapping(feeRows), { bankName: 'Bank', accountName: 'Current' })
    const columns = { ...testDraft.columns, moneyIn: ['In'], moneyOut: ['Out'] }
    const draft = { ...testDraft, columns: connectColumn({ columns: columns, field: 'moneyOut', column: 'Fee' }) }

    expect(toMapping(draft, feeRows)?.columns.amount).toEqual({
      type: 'sum',
      signed: [],
      in: ['In'],
      out: ['Out', 'Fee'],
    })
    expect(getPreview(feeRows, draft)?.transactions.map((transaction) => transaction.value)).toEqual(['-3.7', '10'])
  })
})

describe('getPreview', () => {
  it('should parse the transactions, without the footer', () => {
    const preview = getPreview(rows, toTestDraft())

    expect(preview?.error).toBeNull()
    expect(preview?.transactions.map((transaction) => transaction.value)).toEqual(['-3.5', '1000.00'])
  })

  it('should report amounts that cannot be read', () => {
    const testDraft = toTestDraft()
    const preview = getPreview(rows, {
      ...testDraft,
      columns: { ...testDraft.columns, moneyIn: ['Details'], moneyOut: ['Details'] },
    })

    expect(preview?.error).toBeTruthy()
    expect(preview?.transactions).toEqual([])
  })
})

describe('connectColumn', () => {
  it('should connect the column to one field only', () => {
    const { columns } = toTestDraft()

    expect(connectColumn({ columns: columns, field: 'description', column: 'Date' })).toEqual({
      ...columns,
      date: [],
      description: ['Date'],
    })
    expect(connectColumn({ columns: columns, field: 'balance', column: 'Details' })).toEqual({
      ...columns,
      description: [],
      balance: ['Details'],
    })
  })

  it('should toggle columns of money in and out, which can share a column', () => {
    const { columns } = toTestDraft()
    const shared = connectColumn({ columns: columns, field: 'moneyIn', column: 'Paid out' })

    expect(shared).toEqual({ ...columns, moneyIn: ['Paid in', 'Paid out'] })
    expect(connectColumn({ columns: shared, field: 'moneyIn', column: 'Paid out' })).toEqual(columns)
  })
})

describe('disconnectColumn', () => {
  it('should remove the column from all fields', () => {
    const { columns } = toTestDraft()
    const shared = { ...columns, moneyIn: ['Paid in'], moneyOut: ['Paid in'] }

    expect(disconnectColumn(shared, 'Paid in')).toEqual({ ...columns, moneyIn: [], moneyOut: [] })
  })
})

describe('getConnectChanges', () => {
  it('should pick a date format matching a new date column', () => {
    const dateRows = [
      ['Booked', 'Valued', 'Details', 'Amount'],
      ['15/01/2026', '2026-01-16', 'Coffee', '-3.50'],
    ]
    const draft = toDraft(detectMapping(dateRows))

    expect(draft.dateFormat).toBe('dd/MM/yyyy')
    expect(getConnectChanges({ rows: dateRows, draft: draft, field: 'date', column: 'Valued' })).toMatchObject({
      dateFormat: 'yyyy-MM-dd',
    })
    expect(
      getConnectChanges({ rows: dateRows, draft: draft, field: 'description', column: 'Details' }),
    ).not.toHaveProperty('dateFormat')
  })

  it('should pick the number format of the amounts, if they tell', () => {
    const numberRows = [
      ['Date', 'Details', 'Amount', 'Fee'],
      ['15/01/2026', 'Coffee', '-1,234', '-0,50'],
    ]
    const draft = { ...toDraft(detectMapping(numberRows)), numberFormat: 'en' as const }

    expect(getConnectChanges({ rows: numberRows, draft: draft, field: 'moneyOut', column: 'Fee' })).toMatchObject({
      numberFormat: 'de',
    })
  })
})

describe('getHeaderRowProblem', () => {
  it('should explain why a row cannot be the header', () => {
    expect(getHeaderRowProblem(rows, 1)).toBeNull()
    expect(getHeaderRowProblem(rows, 0)).toBe('names')
    expect(
      getHeaderRowProblem(
        [
          ['Date', 'Amount'],
          ['15/01/2026', '1', 'extra'],
        ],
        0,
      ),
    ).toBe('columnCount')
  })
})

describe('getAmountValues', () => {
  it('should ignore repeated header rows', () => {
    const header = ['Date', 'Details', 'Amount']
    const amountRows = [header, ['15/01/2026', 'Coffee', '-3.50'], header, ['16/01/2026', 'Refund', '10.00']]
    const { columns } = toDraft(detectMapping(amountRows))

    expect(getAmountValues({ rows: amountRows, headerIndex: 0, columns: columns })).toEqual(['-3.50', '10.00'])
  })
})

describe('getFormatIssueHref', () => {
  it('should prefill the issue form with the format', () => {
    const mapping = toMapping(toTestDraft(), rows)!
    const url = new URL(getFormatIssueHref(mapping))

    expect(url.origin + url.pathname).toBe('https://github.com/kyco/fstats/issues/new')
    expect(url.searchParams.get('template')).toBe('new-format.yml')
    expect(url.searchParams.get('title')).toBe('New format: My Bank – Current')
    expect(JSON.parse(url.searchParams.get('format') ?? '')).toEqual(mapping)
  })
})
