import type { TFunction } from 'i18next'

import type { SimilarTransactions, SourcedTransaction } from '@/types'
import type { Currency, DateFormat, UserLocale } from '@/types-enums'
import { toDisplayDate } from '@/utils/Date'
import { toFixedLocaleCurrency } from '@/utils/Number'

type FormatProps = {
  locale: UserLocale
  dateFormat: DateFormat
  t: TFunction
}

type DetailRow = {
  label: string
  value: string
}

type GetExtraRowsProps = Omit<FormatProps, 'dateFormat'> & {
  transaction: SourcedTransaction
}

/**
 * The bank specific columns the transaction has (see `extraColumns` of the bank formats).
 */
export const getExtraRows = ({ transaction, locale, t }: GetExtraRowsProps): DetailRow[] => {
  const { extra, currency } = transaction
  const extraRows: (DetailRow | null)[] = [
    extra?.parentCategory
      ? { label: t('STATS_PAGE.TRANSACTION_DETAILS.BANK_PARENT_CATEGORY'), value: extra.parentCategory }
      : null,
    extra?.category ? { label: t('STATS_PAGE.TRANSACTION_DETAILS.BANK_CATEGORY'), value: extra.category } : null,
    extra?.transactionType ? { label: t('STATS_PAGE.TRANSACTION_DETAILS.TYPE'), value: extra.transactionType } : null,
    extra?.reference ? { label: t('STATS_PAGE.TRANSACTION_DETAILS.REFERENCE'), value: extra.reference } : null,
    extra?.balance
      ? {
          label: t('STATS_PAGE.TRANSACTION_DETAILS.BALANCE'),
          value: toFixedLocaleCurrency({ value: extra.balance, currency, locale }),
        }
      : null,
  ]

  return extraRows.filter((row) => row !== null)
}

type GetSimilarRowsProps = FormatProps & {
  similar: SimilarTransactions
  currency: Currency
}

/**
 * How often, how much and when the transactions with the same description were.
 */
export const getSimilarRows = ({ similar, currency, locale, dateFormat, t }: GetSimilarRowsProps): DetailRow[] => {
  const toDate = (date: string | null) => (date ? toDisplayDate({ date, locale, formatTo: dateFormat }) : '–')
  const toAmount = (value: string) => toFixedLocaleCurrency({ value, currency, locale, showPlusSign: true })

  return [
    {
      label: t('STATS_PAGE.TRANSACTION_DETAILS.OCCURRENCES'),
      value: t('STATS_PAGE.TRANSACTION_DETAILS.OCCURRENCE_COUNT', { count: similar.count }),
    },
    { label: t('STATS_PAGE.TRANSACTION_DETAILS.TOTAL'), value: toAmount(similar.total) },
    { label: t('STATS_PAGE.TRANSACTION_DETAILS.AVERAGE'), value: toAmount(similar.average) },
    { label: t('STATS_PAGE.TRANSACTION_DETAILS.LAST'), value: toDate(similar.last) },
    { label: t('STATS_PAGE.TRANSACTION_DETAILS.FIRST'), value: toDate(similar.first) },
  ]
}
