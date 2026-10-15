import { CallSplit, InfoOutlined } from '@mui/icons-material'
import { Box, Tooltip } from '@mui/material'
import type { TFunction } from 'i18next'
import { uniq } from 'lodash'
import type { ReactNode } from 'react'

import type {
  CategoryEngine,
  CategoryRuleset,
  ParsedStatsFile,
  SourcedTransaction,
  Transaction,
  VirtualTableColumn,
} from '@/types'
import { AmountFilter, TransactionTag } from '@/types-enums'
import type { Currency, DateFormat, UserLocale } from '@/types-enums'
import { getCategoryConflicts, resolveCategory } from '@/m-category/service'
import { getFileCurrency } from '@/m-stats-file/service'
import { sxChartTooltip } from '@/styles/styled'
import { getCategoryLabel } from '@/utils/Category'
import { getCurrencySymbol } from '@/utils/Currency'
import { toDisplayDate } from '@/utils/Date'
import { toFixedLocaleAmount, toFixedLocaleCurrency } from '@/utils/Number'
import { Big } from '@/lib/w-big'

import { getSourceText } from '../CategoryEditor/actions'
import { getRulesetName } from '../RulesetSelect/actions'
import { ui } from './styled'

const TAG_LABEL_KEYS: Record<TransactionTag, string> = {
  [TransactionTag.DUPLICATE]: 'STATS_PAGE.DATA_VIEW.DUPLICATE_TAG',
  [TransactionTag.DATE_EXCLUDED]: 'STATS_PAGE.DATA_VIEW.DATE_EXCLUDED_TAG',
}

// Room for the icon showing other rule sets would categorise differently
const CONFLICT_ICON_WIDTH = 20

// Wide enough for the longest label, e.g. "Ausgeschlossen"
const TAG_COLUMN_WIDTHS: Record<TransactionTag, number> = {
  [TransactionTag.DUPLICATE]: 96,
  [TransactionTag.DATE_EXCLUDED]: 128,
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
  /**
   * Where the category is from, see `getCategoryInfo`.
   */
  categoryLines: string[]
  t: TFunction
}

/**
 * Tooltip of the info column: the file and where else the transaction is (only with multiple files), where its category
 * is from, and why it's excluded.
 */
export const getSourceLabel = ({
  transaction: { source, sources, isDuplicate },
  showSource,
  tag,
  categoryLines,
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

  return [...sourceLines, ...categoryLines, ...tagLines].join('\n')
}

type GetCategoryInfoProps = {
  transaction: SourcedTransaction
  engine: CategoryEngine
  rulesets: CategoryRuleset[]
  /**
   * Categories of the demo data are only in the transaction.
   */
  isDemoMode: boolean
  t: TFunction
}

/**
 * Where the category of the transaction is from, and the other rule sets that would give it a different one.
 */
export const getCategoryInfo = ({ transaction, engine, rulesets, isDemoMode, t }: GetCategoryInfoProps) => {
  const resolved = resolveCategory({ transaction, engine, preset: isDemoMode ? transaction.category : null })
  const conflicts = getCategoryConflicts({ transaction, engine, resolved })
  const { i18nKey, values } = getSourceText({ resolved, rulesets, t })
  // Plain text in the tooltip
  const sourceLine = t(i18nKey, values).replace(/<\/?b>/g, '')

  return {
    lines: [sourceLine],
    conflicts: conflicts.length
      ? t('STATS_PAGE.CATEGORY_RULES.ALSO_MATCHED', {
          matches: conflicts
            .map(
              ({ rulesetId, category }) =>
                `${getRulesetName({ id: rulesetId, rulesets, t })} (${getCategoryLabel(category, t)})`,
            )
            .join(', '),
        })
      : null,
  }
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
  /**
   * The info column (file, category source, tags), not in previews of not yet stored transactions.
   */
  showInfo?: boolean
  amountFilter: AmountFilter
  t: TFunction
  /**
   * Category cell, by its label, e.g. a chip to change it.
   */
  renderCategory?: (label: string, rowIndex: number) => ReactNode
  /**
   * Other rule sets that would give the transaction a different category (shown with an icon), `null` without.
   */
  conflicts?: {
    isShown: boolean
    getText: (rowIndex: number) => string | null
  }
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
  showInfo = true,
  amountFilter,
  t,
  renderCategory,
  conflicts,
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
    { label: t('MISC.CATEGORY'), width: 160, renderCell: renderCategory },
    ...(showInfo
      ? [
          {
            label: t('MISC.SOURCE'),
            fixedWidth:
              Math.max(32, ...(tags?.shown ?? []).map((tag) => TAG_COLUMN_WIDTHS[tag])) +
              (conflicts?.isShown ? CONFLICT_ICON_WIDTH : 0),
            hideLabel: true,
            align: 'right' as const,
            renderCell: (label: string, rowIndex: number) => {
              const tag = tags?.getTag(rowIndex) ?? null
              const conflictText = conflicts?.getText(rowIndex) ?? null

              return (
                <Box component="span" sx={sx.infoCell}>
                  {conflictText ? (
                    <Tooltip title={conflictText} placement="left" slotProps={{ tooltip: { sx: sxChartTooltip } }}>
                      <CallSplit sx={sx.conflictIcon} aria-label={conflictText} />
                    </Tooltip>
                  ) : null}
                  {/* Tagged rows show the tag with the icon */}
                  <Tooltip
                    title={<Box sx={{ whiteSpace: 'pre-line' }}>{label}</Box>}
                    placement="left"
                    slotProps={{ tooltip: { sx: sxChartTooltip } }}
                  >
                    {tag ? (
                      <Box component="span" sx={sx.tag}>
                        {t(TAG_LABEL_KEYS[tag])}
                        <InfoOutlined sx={sx.infoIcon} />
                      </Box>
                    ) : (
                      <InfoOutlined sx={sx.infoIcon} />
                    )}
                  </Tooltip>
                </Box>
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
