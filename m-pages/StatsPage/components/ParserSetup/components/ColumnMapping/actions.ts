import type { ColumnField } from '@/types'

export const FIELD_LABEL_KEYS: Record<ColumnField, string> = {
  date: 'STATS_PAGE.PARSER_SETUP.FIELD.DATE',
  description: 'STATS_PAGE.PARSER_SETUP.FIELD.DESCRIPTION',
  moneyIn: 'STATS_PAGE.PARSER_SETUP.FIELD.MONEY_IN',
  moneyOut: 'STATS_PAGE.PARSER_SETUP.FIELD.MONEY_OUT',
  balance: 'STATS_PAGE.PARSER_SETUP.FIELD.BALANCE',
  reference: 'STATS_PAGE.PARSER_SETUP.FIELD.REFERENCE',
  transactionType: 'STATS_PAGE.PARSER_SETUP.FIELD.TRANSACTION_TYPE',
  category: 'STATS_PAGE.PARSER_SETUP.FIELD.CATEGORY',
  parentCategory: 'STATS_PAGE.PARSER_SETUP.FIELD.PARENT_CATEGORY',
}

// The date formats are shown as this date. Day 31, so day and month can't be mixed up.
export const EXAMPLE_DATE = new Date(2026, 0, 31, 14, 30, 0)
