import type { NumberString, Transaction } from '@/types'
import { getPercentage, isExpense, isIncome, sumValues } from '@/utils/Stats'

export const getStats = (
  transactions: Transaction[],
): {
  totalIncome: NumberString
  totalExpense: NumberString
  profit: NumberString
  expenseRatio: NumberString
  profitMargin: NumberString
} => {
  const totalIncome = sumValues(transactions.filter(isIncome))
  const totalExpense = sumValues(transactions.filter(isExpense)).abs()
  const profit = totalIncome.minus(totalExpense)
  const profitMargin = getPercentage(profit, totalIncome)
  const expenseRatio = getPercentage(totalExpense, totalIncome)

  return {
    totalIncome: totalIncome.toString(),
    totalExpense: totalExpense.toString(),
    profit: profit.toString(),
    profitMargin: profitMargin.toString(),
    expenseRatio: expenseRatio.toString(),
  }
}
