import type { TFunction } from 'i18next'
import { groupBy, sortBy } from 'lodash'

import type {
  AccountTransaction,
  CategoryCode,
  NumberString,
  ParsedStatsFile,
  ProfitLoss,
  ProfitLossRow,
  Transaction,
} from '@/types'
import { BreakdownPeriod } from '@/types-enums'
import type { Currency } from '@/types-enums'
import { EXPENSE_CATEGORIES } from '@/common'
import { getCategoryLabel, getParentCategoryCode, isUncategorisedCode } from '@/utils/Category'
import { getTransactionDay } from '@/utils/Date'
import { getBankAccountId } from '@/utils/Parser'
import { getPercentage, isExpense, isIncome, sumValues } from '@/utils/Stats'
import { Big } from '@/lib/w-big'

/**
 * Categorised as an internal transfer by the keyword rules.
 */
const TRANSFER_CATEGORIES: CategoryCode[] = ['TFI_01', 'TFO_01']

/**
 * Bank transfers can take a few days, e.g. over a weekend.
 */
const TRANSFER_MAX_DAYS = 3

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * The transactions (e.g. `StatsTransactions.unique`) with the bank account of their section in the files.
 */
export const getAccountTransactions = (files: ParsedStatsFile[], transactions: Transaction[]): AccountTransaction[] => {
  const bankAccountIds = new Map(
    files.flatMap((file) =>
      file.sections.flatMap((section) =>
        section.transactions.map((transaction) => [transaction, getBankAccountId(section.parserId)] as const),
      ),
    ),
  )

  return transactions.map((transaction) => ({ ...transaction, bankAccountId: bankAccountIds.get(transaction)! }))
}

const getDayDiff = (a: Transaction, b: Transaction) => {
  return Math.abs(Date.parse(getTransactionDay(a)) - Date.parse(getTransactionDay(b))) / DAY_MS
}

/**
 * Transfers between own accounts, which are neither income nor expenses: those categorised as such, and pairs of
 * opposite amounts in different accounts of the same currency at most `TRANSFER_MAX_DAYS` apart (closest first).
 */
export const splitTransfers = <T extends AccountTransaction>(transactions: T[]) => {
  const transferIds = new Set(
    transactions
      .filter((transaction) => transaction.category && TRANSFER_CATEGORIES.includes(transaction.category))
      .map((transaction) => transaction.id),
  )
  const getMatchKey = (transaction: T) => `${transaction.currency}|${Big(transaction.value).abs().toString()}`
  const incomingByKey = groupBy(transactions.filter(isIncome), getMatchKey)
  // Each transaction is paired at most once, categorised transfers too (with their uncategorised counterpart)
  const pairedIds = new Set<string>()

  sortBy(transactions.filter(isExpense), (transaction) => transaction.date).forEach((outgoing) => {
    const [match] = sortBy(
      (incomingByKey[getMatchKey(outgoing)] ?? []).filter(
        (incoming) =>
          incoming.bankAccountId !== outgoing.bankAccountId &&
          !pairedIds.has(incoming.id) &&
          getDayDiff(incoming, outgoing) <= TRANSFER_MAX_DAYS,
      ),
      (incoming) => getDayDiff(incoming, outgoing),
    )

    if (match) {
      pairedIds.add(outgoing.id)
      pairedIds.add(match.id)
      transferIds.add(outgoing.id)
      transferIds.add(match.id)
    }
  })

  return {
    transactions: transactions.filter((transaction) => !transferIds.has(transaction.id)),
    transfers: transactions.filter((transaction) => transferIds.has(transaction.id)),
  }
}

/**
 * E.g. "2026-03", "2026-Q1" or "2026", sortable as strings.
 */
export const getPeriodKey = (transaction: Pick<Transaction, 'date'>, period: BreakdownPeriod) => {
  const day = getTransactionDay(transaction)

  switch (period) {
    case BreakdownPeriod.YEAR:
      return day.slice(0, 4)
    case BreakdownPeriod.QUARTER:
      return `${day.slice(0, 4)}-Q${Math.ceil(Number(day.slice(5, 7)) / 3)}`
    default:
      return day.slice(0, 7)
  }
}

type ToRowProps = {
  key: string
  label: string
  transactions: Transaction[]
  period: BreakdownPeriod
  negate?: boolean
  children?: ProfitLossRow[]
  withFlows?: boolean
}

/**
 * Sums of the transactions per period, negated for expenses so they're shown as positive amounts. With `withFlows`, a
 * row with both incoming and outgoing transactions (e.g. a medical aid payout to a medical expense) gets their sums too
 * (not negated).
 */
const toRow = ({
  key,
  label,
  transactions,
  period,
  negate = false,
  children = [],
  withFlows = false,
}: ToRowProps): ProfitLossRow => {
  const sign = negate ? -1 : 1
  const byPeriod = groupBy(transactions, (transaction) => getPeriodKey(transaction, period))
  const values = Object.fromEntries(
    Object.entries(byPeriod).map(([periodKey, items]) => [periodKey, sumValues(items).times(sign).toString()]),
  )
  const incoming = transactions.filter(isIncome)
  const outgoing = transactions.filter((transaction) => !isIncome(transaction))
  const toFlow = (items: Transaction[]) => {
    const { values: flowValues, total } = toRow({ key, label, transactions: items, period })
    return { values: flowValues, total }
  }
  const flows: ProfitLossRow['flows'] =
    withFlows && incoming.length && outgoing.length
      ? { incoming: toFlow(incoming), outgoing: toFlow(outgoing) }
      : undefined

  return { key, label, values, total: sumValues(transactions).times(sign).toString(), children, flows }
}

/**
 * Largest first.
 */
const sortRows = (rows: ProfitLossRow[]) => {
  return [...rows].sort((a, b) => Big(b.total).abs().cmp(Big(a.total).abs()) || a.label.localeCompare(b.label))
}

const isUncategorised = (transaction: Transaction) => {
  return isUncategorisedCode(transaction.category)
}

type GetCategoryRowsProps = {
  transactions: Transaction[]
  period: BreakdownPeriod
  negate: boolean
  t: TFunction
}

/**
 * One row per parent category (expandable to its subcategories), uncategorised transactions last.
 */
const getCategoryRows = ({ transactions, period, negate, t }: GetCategoryRowsProps) => {
  const uncategorised = transactions.filter(isUncategorised)
  const byParent = groupBy(
    transactions.filter((transaction) => !isUncategorised(transaction)),
    (transaction) => getParentCategoryCode(transaction.category!),
  )

  const rows = Object.entries(byParent).map(([parentCode, items]) => {
    const children = Object.entries(groupBy(items, (transaction) => transaction.category)).map(([code, subItems]) =>
      toRow({ key: code, label: getCategoryLabel(code, t), transactions: subItems, period, negate, withFlows: true }),
    )

    return toRow({
      key: parentCode,
      label: getCategoryLabel(parentCode, t),
      transactions: items,
      period,
      negate,
      children: sortRows(children),
    })
  })

  return [
    ...sortRows(rows),
    ...(uncategorised.length
      ? [
          toRow({
            key: 'uncategorised',
            label: t('STATS_PAGE.PROFIT_LOSS.UNCATEGORISED'),
            transactions: uncategorised,
            period,
            negate,
            withFlows: true,
          }),
        ]
      : []),
  ]
}

const isExpenseCategory = (transaction: Transaction) => {
  return transaction.category
    ? getParentCategoryCode(transaction.category) in EXPENSE_CATEGORIES
    : isExpense(transaction)
}

/**
 * The transfers as one row per transaction, by date.
 */
const getTransferRows = (transfers: Transaction[], period: BreakdownPeriod) => {
  return sortBy(transfers, (transaction) => transaction.date).map((transaction) => ({
    ...toRow({ key: transaction.id, label: transaction.description, transactions: [transaction], period }),
    date: transaction.date,
  }))
}

/**
 * Net result as a percentage of the income, `undefined` without income.
 */
const getNetMargin = (net: NumberString | undefined, income: NumberString | undefined) => {
  return income === undefined || Big(income).eq(0) ? undefined : getPercentage(net ?? '0', income).toString()
}

type GetProfitLossProps = {
  accountTransactions: AccountTransaction[]
  period: BreakdownPeriod
  t: TFunction
  filter?: (transactions: AccountTransaction[]) => AccountTransaction[]
}

/**
 * Income statement of the transactions (without duplicates, e.g. `StatsTransactions.unique`) per period, one per currency
 * as amounts in different currencies can't be summed up. Transfers between own accounts are excluded from it, but
 * listed separately. Transfers are paired before `filter` (e.g. the category and day filters) is applied, so excluding
 * one side of a transfer doesn't turn the other side into income or an expense.
 */
export const getProfitLoss = ({
  accountTransactions,
  period,
  t,
  filter = (transactions) => transactions,
}: GetProfitLossProps): ProfitLoss[] => {
  const byCurrency = groupBy(accountTransactions, (transaction) => transaction.currency)

  return Object.entries(byCurrency).flatMap(([currency, allCurrencyTransactions]) => {
    const currencyTransactions = filter(allCurrencyTransactions)

    if (!currencyTransactions.length) {
      return []
    }

    const shown = new Set(currencyTransactions)
    const split = splitTransfers(allCurrencyTransactions)
    const transactions = split.transactions.filter((transaction) => shown.has(transaction))
    const transfers = split.transfers.filter((transaction) => shown.has(transaction))
    const expenses = transactions.filter(isExpenseCategory)
    const income = transactions.filter((transaction) => !isExpenseCategory(transaction))
    const incomingTransfers = transfers.filter(isIncome)
    const outgoingTransfers = transfers.filter((transaction) => !isIncome(transaction))
    const periods = Object.keys(
      groupBy(currencyTransactions, (transaction) => getPeriodKey(transaction, period)),
    ).sort()

    const incomeTotal = toRow({
      key: 'income',
      label: t('STATS_PAGE.PROFIT_LOSS.TOTAL_INCOME'),
      transactions: income,
      period,
    })
    const net = toRow({ key: 'net', label: t('STATS_PAGE.PROFIT_LOSS.NET'), transactions, period })
    const netMargins = periods.flatMap((periodKey) => {
      const rate = getNetMargin(net.values[periodKey], incomeTotal.values[periodKey])
      return rate === undefined ? [] : [[periodKey, rate]]
    })

    return {
      currency: currency as Currency,
      periods,
      income: {
        rows: getCategoryRows({ transactions: income, period, negate: false, t }),
        total: incomeTotal,
      },
      expenses: {
        rows: getCategoryRows({ transactions: expenses, period, negate: true, t }),
        total: toRow({
          key: 'expenses',
          label: t('STATS_PAGE.PROFIT_LOSS.TOTAL_EXPENSES'),
          transactions: expenses,
          period,
          negate: true,
        }),
      },
      net,
      netMargin: {
        values: Object.fromEntries(netMargins),
        total: getNetMargin(net.total, incomeTotal.total),
      },
      transfers: {
        incoming: toRow({
          key: 'transfersIn',
          label: t('STATS_PAGE.PROFIT_LOSS.TRANSFERS_IN'),
          transactions: incomingTransfers,
          period,
          children: getTransferRows(incomingTransfers, period),
        }),
        outgoing: toRow({
          key: 'transfersOut',
          label: t('STATS_PAGE.PROFIT_LOSS.TRANSFERS_OUT'),
          transactions: outgoingTransfers,
          period,
          children: getTransferRows(outgoingTransfers, period),
        }),
        net: toRow({
          key: 'transfersNet',
          label: t('STATS_PAGE.PROFIT_LOSS.TRANSFERS_NET'),
          transactions: transfers,
          period,
        }),
        count: transfers.length,
      },
    }
  })
}
