import { InfoOutlined } from '@mui/icons-material'
import { Box, Tooltip } from '@mui/material'
import type { TFunction } from 'i18next'
import { groupBy, uniq } from 'lodash'

import type { ParsedStatsFile, SourcedTransaction, Transaction, VirtualTableColumn } from '@/types'
import { AmountFilter, TransactionTag } from '@/types-enums'
import type { Currency, DateFormat, UserLocale } from '@/types-enums'
import { getFileCurrency, getFileTransactions, splitDuplicates } from '@/m-stats-file/service'
import { getCategoryLabel } from '@/utils/Category'
import { getCurrencySymbol } from '@/utils/Currency'
import { toDisplayDate } from '@/utils/Date'
import { toFixedLocaleAmount, toFixedLocaleCurrency } from '@/utils/Number'
import { Big } from '@/lib/w-big'

import { ui } from './styled'

const TAG_LABEL_KEYS: Record<TransactionTag, string> = {
  [TransactionTag.DUPLICATE]: 'STATS_PAGE.DATA_VIEW.DUPLICATE_TAG',
  [TransactionTag.DATE_EXCLUDED]: 'STATS_PAGE.DATA_VIEW.DATE_EXCLUDED_TAG',
}

// Wide enough for the longest label, e.g. "Ausgeschlossen"
const TAG_COLUMN_WIDTHS: Record<TransactionTag, number> = {
  [TransactionTag.DUPLICATE]: 96,
  [TransactionTag.DATE_EXCLUDED]: 128,
}

/**
 * Transactions of all files in a single list, newest first like the date explorer. Stable, so the order of files is
 * kept for equal dates. The first occurrence of a transaction in multiple files is the original, the others are
 * duplicates.
 */
export const getSourcedTransactions = (files: ParsedStatsFile[]): SourcedTransaction[] => {
  const transactions = files.flatMap((file) =>
    getFileTransactions(file).map((transaction) => ({ ...transaction, source: file.file.name })),
  )
  const duplicates = new Set(splitDuplicates(transactions).duplicates)
  const sourcesById = groupBy(transactions, 'id')

  return transactions
    .map((transaction) => ({
      ...transaction,
      sources: sourcesById[transaction.id].map(({ source }) => source),
      isDuplicate: duplicates.has(transaction),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Duplicates are tagged as such even if also excluded by date, they're excluded either way.
 */
export const getTransactionTag = (transaction: SourcedTransaction, isDateExcluded: boolean): TransactionTag | null => {
  if (transaction.isDuplicate) {
    return TransactionTag.DUPLICATE
  }

  return isDateExcluded ? TransactionTag.DATE_EXCLUDED : null
}

type GetSourceLabelProps = {
  transaction: SourcedTransaction
  showSource: boolean
  tag: TransactionTag | null
  t: TFunction
}

/**
 * Tooltip of the source column: the file and where else the transaction is (only with multiple files), and why it's
 * excluded. Empty when there is nothing to show.
 */
export const getSourceLabel = ({
  transaction: { source, sources, isDuplicate },
  showSource,
  tag,
  t,
}: GetSourceLabelProps) => {
  const otherSources = sources.filter((name) => name !== source)
  const sourceLines = !showSource
    ? []
    : isDuplicate
      ? [source, t('STATS_PAGE.DATA_VIEW.DUPLICATE_OF', { file: sources[0] })]
      : otherSources.length
        ? [source, t('STATS_PAGE.DATA_VIEW.ALSO_IN', { files: otherSources.join(', ') })]
        : [source]
  const tagLines = tag === TransactionTag.DATE_EXCLUDED ? [t('STATS_PAGE.DATA_VIEW.EXCLUDED_BY_DATE')] : []

  return [...sourceLines, ...tagLines].join('\n')
}

/**
 * The shared currency of all files, or `null` if they are mixed.
 */
export const getSharedCurrency = (files: ParsedStatsFile[]): Currency | null => {
  const currencies = uniq(files.map(getFileCurrency))
  return currencies.length === 1 ? currencies[0] : null
}

type GetTransactionColumnsProps = {
  currency: Currency | null
  showSource: boolean
  amountFilter: AmountFilter
  t: TFunction
  /**
   * Tags shown next to the source (e.g. "Duplicate"), only when some are shown. Shows the column without sources.
   */
  tags?: {
    shown: TransactionTag[]
    getTag: (rowIndex: number) => TransactionTag | null
  }
}

export const getTransactionColumns = ({
  currency,
  showSource,
  amountFilter,
  t,
  tags,
}: GetTransactionColumnsProps): VirtualTableColumn[] => {
  const sx = ui()

  return [
    { label: t('MISC.DATE'), width: 100, getStyle: () => sx.tabularNums },
    { label: t('MISC.DESCRIPTION'), width: 320 },
    {
      // Mixed currencies show the symbol per amount instead
      label: currency ? t('MISC.AMOUNT_WITH_CURRENCY', { currency: getCurrencySymbol(currency) }) : t('MISC.AMOUNT'),
      width: 120,
      align: 'right',
      // Only highlight money in when both directions are shown
      getStyle: (value) =>
        amountFilter === AmountFilter.ALL && value.startsWith('+')
          ? { ...sx.tabularNums, fontWeight: 600 }
          : sx.tabularNums,
    },
    { label: t('MISC.CATEGORY'), width: 160 },
    ...(showSource || tags
      ? [
          {
            label: t('MISC.SOURCE'),
            fixedWidth: Math.max(32, ...(tags?.shown ?? []).map((tag) => TAG_COLUMN_WIDTHS[tag])),
            hideLabel: true,
            align: 'right' as const,
            renderCell: (label: string, rowIndex: number) => {
              const tag = tags?.getTag(rowIndex) ?? null

              if (!label) {
                return null
              }

              // Tagged rows show the tag with the icon
              return (
                <Tooltip title={<Box sx={{ whiteSpace: 'pre-line' }}>{label}</Box>} placement="left">
                  {tag ? (
                    <Box component="span" sx={sx.tag}>
                      {t(TAG_LABEL_KEYS[tag])}
                      <InfoOutlined sx={sx.infoIcon} />
                    </Box>
                  ) : (
                    <InfoOutlined sx={{ ...sx.infoIcon, ml: 'auto' }} />
                  )}
                </Tooltip>
              )
            },
          },
        ]
      : []),
  ]
}

type GetTransactionCellsProps = {
  currency: Currency | null
  amountFilter: AmountFilter
  locale: UserLocale
  dateFormat: DateFormat
  t: TFunction
}

/**
 * Shown values of the transaction, without the source (only a tooltip).
 */
export const getTransactionCells = (
  transaction: Transaction,
  { currency, amountFilter, locale, dateFormat, t }: GetTransactionCellsProps,
) => {
  // Signs are redundant when only one direction is shown
  const isSigned = amountFilter === AmountFilter.ALL
  const displayValue = isSigned ? transaction.value : Big(transaction.value).abs().toString()
  // Mixed currencies show the symbol per amount
  const formatAmount = currency ? toFixedLocaleAmount : toFixedLocaleCurrency

  return [
    toDisplayDate({ date: transaction.date, locale, formatTo: dateFormat }),
    transaction.description,
    formatAmount({ value: displayValue, currency: transaction.currency, locale, showPlusSign: isSigned }),
    getCategoryLabel(transaction.category, t),
  ]
}
