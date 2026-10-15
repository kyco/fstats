import { describe, expect, it } from 'vitest'

import type { Transaction } from '@/types'

import { getSimilarTransactions } from '..'

const toTransaction = (date: string, description: string, value: string, currency = 'EUR') =>
  ({ id: `${date}|${description}`, date, description, value, currency, category: null, extra: null }) as Transaction

describe('getSimilarTransactions', () => {
  it('should sum transactions with the same description and currency, ignoring case and spacing', () => {
    const transaction = toTransaction('2026-02-01', 'REWE  Markt', '-10')
    const transactions = [
      toTransaction('2026-03-01', 'rewe markt', '-20.50'),
      transaction,
      toTransaction('2026-01-01', 'REWE Markt 42', '-5'),
      toTransaction('2026-01-15', 'REWE Markt', '-7', 'GBP'),
    ]

    expect(getSimilarTransactions(transactions, transaction)).toEqual({
      count: 2,
      total: '-30.5',
      average: '-15.25',
      first: '2026-02-01',
      last: '2026-03-01',
    })
  })
})
