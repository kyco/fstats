import type { Transaction } from '@/types'
import type { BigSource } from '@/lib/w-big'
import { Big } from '@/lib/w-big'

type HasValue = Pick<Transaction, 'value'>

export const isIncome = (transaction: HasValue): boolean => {
  return Big(transaction.value).gt(0)
}

export const isExpense = (transaction: HasValue): boolean => {
  return Big(transaction.value).lt(0)
}

export const sumValues = (transactions: HasValue[]): Big => {
  return transactions.reduce((acc, transaction) => acc.plus(transaction.value), Big(0))
}

/**
 * `part` as a percentage of `total`, or 0 if `total` is 0.
 */
export const getPercentage = (part: BigSource, total: BigSource): Big => {
  return Big(total).eq(0) ? Big(0) : Big(part).div(total).times(100)
}
