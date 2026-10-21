import { describe, expect, it } from 'vitest'

import type { CategoryId, ParsedStatsFile, Transaction } from '@/types'
import { BreakdownPeriod, Currency, StatsFileStatus } from '@/types-enums'
import { getTemplateTree } from '@/m-category/service'
import { DEFAULT_TEMPLATE_ID, toCategoryId } from '@/utils/Category'
import { i18n } from '@/lib/i18n'
import { Big } from '@/lib/w-big'

import { getAccountTransactions, getCheckedTransactions, getPeriodKey, getProfitLoss, splitTransfers } from '..'

const tree = getTemplateTree(DEFAULT_TEMPLATE_ID)

const toTransaction = (
  day: string,
  value: string,
  category: CategoryId | null = null,
  currency: Currency = Currency.EUR,
) =>
  ({
    id: `${day}|${value}|${category}|${currency}`,
    date: `${day}T00:00:00+00:00`,
    value,
    category,
    currency,
  }) as Transaction

const toFile = (id: string, sections: { parserId: string; transactions: Transaction[] }[]) =>
  ({ id, status: StatsFileStatus.PARSED, sections }) as unknown as ParsedStatsFile

const toAccountTransactions = (files: ParsedStatsFile[]) =>
  getAccountTransactions(files, getCheckedTransactions(files).unique)

describe('getPeriodKey', () => {
  it('should group by month, quarter and year', () => {
    const transaction = toTransaction('2026-05-31', '1')

    expect(getPeriodKey(transaction, BreakdownPeriod.MONTH)).toBe('2026-05')
    expect(getPeriodKey(transaction, BreakdownPeriod.QUARTER)).toBe('2026-Q2')
    expect(getPeriodKey(transaction, BreakdownPeriod.YEAR)).toBe('2026')
  })
})

describe('splitTransfers', () => {
  const toAccountTransaction = (bankAccountId: string, ...args: Parameters<typeof toTransaction>) =>
    ({ ...toTransaction(...args), bankAccountId }) as Transaction & { bankAccountId: never }

  it('should pair opposite amounts in different accounts a few days apart', () => {
    const outgoing = toAccountTransaction('ing__current', '2026-01-01', '-100')
    const incoming = toAccountTransaction('comdirect__current', '2026-01-03', '100')
    const sameAccount = toAccountTransaction('ing__current', '2026-01-02', '100')
    const tooLate = toAccountTransaction('comdirect__current', '2026-01-10', '-50')
    const tooLateIncoming = toAccountTransaction('ing__current', '2026-01-14', '50')

    const { transactions, transfers } = splitTransfers(
      [outgoing, incoming, sameAccount, tooLate, tooLateIncoming],
      tree,
    )

    expect(transfers).toEqual([outgoing, incoming])
    expect(transactions).toEqual([sameAccount, tooLate, tooLateIncoming])
  })

  it('should pair each transaction once, closest first', () => {
    const first = toAccountTransaction('ing__current', '2026-01-01', '-100')
    const second = toAccountTransaction('ing__current', '2026-01-05', '-100')
    const far = toAccountTransaction('comdirect__current', '2026-01-03', '100')
    const close = toAccountTransaction('comdirect__current', '2026-01-02', '100')

    const { transactions, transfers } = splitTransfers([first, second, far, close], tree)

    expect(transfers).toEqual([first, second, far, close])
    expect(transactions).toEqual([])
  })

  it('should exclude transactions in a transfer category without a counterpart', () => {
    const transfer = toAccountTransaction('ing__current', '2026-01-01', '-100', toCategoryId('transfers_out'))
    const other = toAccountTransaction('ing__current', '2026-01-01', '-20', toCategoryId('groceries'))

    expect(splitTransfers([transfer, other], tree)).toEqual({ transactions: [other], transfers: [transfer] })
  })
})

describe('getProfitLoss', () => {
  it('should sum income and expenses per category and period, without transfers or duplicates', () => {
    const salary = toTransaction('2026-01-25', '3000', toCategoryId('salary'))
    const groceries = toTransaction('2026-01-10', '-200', toCategoryId('groceries'))
    const groceriesFeb = toTransaction('2026-02-10', '-150.5', toCategoryId('groceries'))
    const restaurant = toTransaction('2026-02-12', '-50', toCategoryId('eating_out'))
    const unknown = toTransaction('2026-02-01', '-10', null)
    const toCreditCard = toTransaction('2026-02-01', '-500', toCategoryId('fees_interest'))
    const fromGiro = toTransaction('2026-02-02', '500', null)
    const files = [
      toFile('a', [
        { parserId: 'comdirect__giro', transactions: [salary, groceries, toCreditCard, unknown] },
        { parserId: 'comdirect__visa', transactions: [fromGiro, restaurant] },
      ]),
      // Overlapping statement
      toFile('b', [{ parserId: 'comdirect__giro', transactions: [{ ...groceries }, groceriesFeb] }]),
    ]

    const [profitLoss] = getProfitLoss({
      accountTransactions: toAccountTransactions(files),
      period: BreakdownPeriod.MONTH,
      tree,
      t: i18n.t,
    })

    expect(profitLoss.periods).toEqual(['2026-01', '2026-02'])
    expect(profitLoss.income.rows.map((row) => [row.key, row.total])).toEqual([[toCategoryId('income'), '3000']])
    expect(profitLoss.expenses.rows.map((row) => [row.key, row.values, row.total])).toEqual([
      [toCategoryId('food'), { '2026-01': '200', '2026-02': '200.5' }, '400.5'],
      ['uncategorised', { '2026-02': '10' }, '10'],
    ])
    expect(profitLoss.expenses.rows[0].children.map((row) => [row.key, row.total])).toEqual([
      [toCategoryId('groceries'), '350.5'],
      [toCategoryId('eating_out'), '50'],
    ])
    expect(profitLoss.expenses.total.total).toBe('410.5')
    expect(profitLoss.net.values).toEqual({ '2026-01': '2800', '2026-02': '-210.5' })
    // Of the net result, none without income
    expect(Object.keys(profitLoss.netMargin.values)).toEqual(['2026-01'])
    expect(Big(profitLoss.netMargin.values['2026-01']).toFixed(2)).toBe('93.33')
    expect(Big(profitLoss.netMargin.total!).toFixed(2)).toBe('86.32')
    expect(profitLoss.transfers.count).toBe(2)
    expect(profitLoss.transfers.net.total).toBe('0')
  })

  it('should sum incoming and outgoing transactions of categories with both', () => {
    const doctor = toTransaction('2026-01-05', '-1000', toCategoryId('medical'))
    const payout = toTransaction('2026-02-10', '600', toCategoryId('medical'))
    const groceries = toTransaction('2026-01-10', '-200', toCategoryId('groceries'))
    const files = [toFile('a', [{ parserId: 'comdirect__giro', transactions: [doctor, payout, groceries] }])]

    const [profitLoss] = getProfitLoss({
      accountTransactions: toAccountTransactions(files),
      period: BreakdownPeriod.MONTH,
      tree,
      t: i18n.t,
    })
    const [health, grocery] = profitLoss.expenses.rows

    expect(health.total).toBe('400')
    expect(health.flows?.incoming.total).toBe('600')
    expect(health.children[0].flows).toEqual({
      incoming: { values: { '2026-02': '600' }, total: '600' },
      outgoing: { values: { '2026-01': '-1000' }, total: '-1000' },
    })
    expect(grocery.flows).toBeUndefined()
    expect(grocery.children[0].flows).toBeUndefined()
    expect(profitLoss.expenses.total.flows).toBeUndefined()
  })

  it('should pair transfers before filtering', () => {
    const outgoing = toTransaction('2026-01-01', '-500', toCategoryId('fees_interest'))
    const incoming = toTransaction('2026-01-02', '500', null)
    const groceries = toTransaction('2026-01-03', '-20', toCategoryId('groceries'))
    const files = [
      toFile('a', [
        { parserId: 'comdirect__giro', transactions: [outgoing, groceries] },
        { parserId: 'comdirect__visa', transactions: [incoming] },
      ]),
    ]
    const withoutIncoming = <T extends Transaction>(transactions: T[]) =>
      transactions.filter((transaction) => transaction.id !== incoming.id)

    const [profitLoss] = getProfitLoss({
      accountTransactions: toAccountTransactions(files),
      period: BreakdownPeriod.MONTH,
      tree,
      t: i18n.t,
      filter: withoutIncoming,
    })

    expect(profitLoss.expenses.total.total).toBe('20')
    expect(profitLoss.transfers.count).toBe(1)
    expect(profitLoss.transfers.outgoing.total).toBe('-500')
  })

  it('should skip currencies without shown transactions', () => {
    const files = [
      toFile('a', [
        { parserId: 'ing__giro', transactions: [toTransaction('2026-01-01', '-1', toCategoryId('groceries'))] },
      ]),
    ]

    expect(
      getProfitLoss({
        accountTransactions: toAccountTransactions(files),
        period: BreakdownPeriod.YEAR,
        tree,
        t: i18n.t,
        filter: () => [],
      }),
    ).toEqual([])
  })

  it('should return one per currency', () => {
    const files = [
      toFile('a', [
        { parserId: 'ing__giro', transactions: [toTransaction('2026-01-01', '-1', toCategoryId('groceries'))] },
      ]),
      toFile('b', [
        {
          parserId: 'fnb__credit_card',
          transactions: [toTransaction('2026-01-01', '-1', toCategoryId('groceries'), Currency.ZAR)],
        },
      ]),
    ]

    expect(
      getProfitLoss({
        accountTransactions: toAccountTransactions(files),
        period: BreakdownPeriod.YEAR,
        tree,
        t: i18n.t,
      }).map((profitLoss) => profitLoss.currency),
    ).toEqual([Currency.EUR, Currency.ZAR])
  })
})
