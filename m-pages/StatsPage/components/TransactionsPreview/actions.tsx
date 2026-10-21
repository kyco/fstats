import { InfoOutlined } from '@mui/icons-material'
import { Box, Tooltip } from '@mui/material'
import type { TFunction } from 'i18next'
import { uniq } from 'lodash'
import type { ReactNode } from 'react'

import type {
  CategoryEngine,
  CategoryId,
  CategoryRulePreview,
  CategoryTree,
  NewRuleKeptBy,
  ParsedStatsFile,
  SourcedTransaction,
  TextRange,
  Transaction,
  VirtualTableColumn,
} from '@/types'
import { TransactionTag } from '@/types-enums'
import type { Currency, DateFormat, UserLocale } from '@/types-enums'
import {
  compileRule,
  getCategoryLabel,
  getKeywordMappingEffect,
  getLibraryDescriptionMatches,
  getNewRuleEffect,
  getRuleDescriptionMatches,
  matchesRule,
  recogniseTransaction,
  resolveCategory,
} from '@/m-category/service'
import { getFileCurrency } from '@/m-stats-file/service'
import { sxChartTooltip } from '@/styles/styled'
import { getCurrencySymbol } from '@/utils/Currency'
import { toDisplayDate } from '@/utils/Date'
import { toFixedLocaleAmount, toFixedLocaleCurrency } from '@/utils/Number'
import { isExpense } from '@/utils/Stats'

import { getSourceText } from '../CategoryEditor/actions'
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

type CreatePreviewMatcherProps = {
  preview: CategoryRulePreview
  engine: CategoryEngine
}

/**
 * Which rows the category form changes (see `CategoryRulePreview`), what wins over it, and the parts of their
 * descriptions to highlight.
 */
export const createPreviewMatcher = ({ preview, engine }: CreatePreviewMatcherProps) => {
  if (preview.type === 'library') {
    return {
      matches: (transaction: Transaction) =>
        isExpense(transaction) !== preview.isIncome &&
        recogniseTransaction({ transaction, engine })?.libraryKeyword.id === preview.keywordId,
      getEffect: (transaction: Transaction) =>
        getKeywordMappingEffect({ transaction, engine, editedId: preview.editedId }),
      getHighlights: (transaction: Transaction) => getLibraryDescriptionMatches(transaction, engine),
    }
  }

  const rule = compileRule({ rule: preview.rule })

  return {
    matches: (transaction: Transaction) => matchesRule(transaction, rule),
    getEffect: (transaction: Transaction) =>
      getNewRuleEffect({ transaction, engine, rule, editedId: preview.editedId }),
    getHighlights: (transaction: Transaction) => getRuleDescriptionMatches(transaction, rule),
  }
}

type GetCategoryInfoProps = {
  transaction: SourcedTransaction
  engine: CategoryEngine
  /**
   * Of the active rule set.
   */
  activeName?: string
  /**
   * Categories of the demo data are only in the transaction.
   */
  isDemoMode: boolean
  t: TFunction
}

/**
 * Where the category of the transaction is from, as plain text for the tooltip.
 */
export const getCategoryInfo = ({ transaction, engine, activeName, isDemoMode, t }: GetCategoryInfoProps) => {
  const resolved = resolveCategory({ transaction, engine, preset: isDemoMode ? transaction.category : null })
  const { i18nKey, values } = getSourceText({ resolved, activeName, t })
  return [t(i18nKey, values).replace(/<\/?b>/g, '')]
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
  t: TFunction
  /**
   * Category cell, by its label, e.g. a chip to change it.
   */
  renderCategory?: (label: string, rowIndex: number) => ReactNode
  /**
   * Parts of the description to highlight, e.g. those the rule being created matches.
   */
  getDescriptionHighlights?: (rowIndex: number) => TextRange[]
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
  t,
  renderCategory,
  getDescriptionHighlights,
  tags,
}: GetTransactionColumnsProps): VirtualTableColumn[] => {
  const sx = ui()

  return [
    { label: t('MISC.DATE'), width: 100, getStyle: () => sx.tabularNums },
    { label: t('MISC.DESCRIPTION'), width: 320, getHighlights: getDescriptionHighlights },
    {
      // Mixed currencies show the symbol per amount instead
      label: currency ? t('MISC.AMOUNT_WITH_CURRENCY', { currency: getCurrencySymbol(currency) }) : t('MISC.AMOUNT'),
      width: 120,
      align: 'right',
      // Money in is highlighted
      getStyle: (value) => (value.startsWith('+') ? { ...sx.tabularNums, fontWeight: 600 } : sx.tabularNums),
    },
    { label: t('MISC.CATEGORY'), width: 160, renderCell: renderCategory },
    ...(showInfo
      ? [
          {
            label: t('MISC.SOURCE'),
            fixedWidth: Math.max(32, ...(tags?.shown ?? []).map((tag) => TAG_COLUMN_WIDTHS[tag])),
            hideLabel: true,
            align: 'right' as const,
            renderCell: (label: string, rowIndex: number) => {
              const tag = tags?.getTag(rowIndex) ?? null

              return (
                <Box component="span" sx={sx.infoCell}>
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
  locale: UserLocale
  dateFormat: DateFormat
  /**
   * Of the active rule set, for the labels of the categories.
   */
  tree: CategoryTree
  t: TFunction
}

/**
 * Shown values of the transaction, without the source (only a tooltip).
 */
export const getTransactionCells = (
  transaction: Transaction,
  { currency, locale, dateFormat, tree, t }: GetTransactionCellsProps,
) => {
  // Mixed currencies show the symbol per amount
  const formatAmount = currency ? toFixedLocaleAmount : toFixedLocaleCurrency

  return [
    toDisplayDate({ date: transaction.date, locale, formatTo: dateFormat }),
    transaction.description,
    formatAmount({ value: transaction.value, currency: transaction.currency, locale, showPlusSign: true }),
    getCategoryLabel({ id: transaction.category, tree, t }),
  ]
}

type GetCategoryPreviewProps = {
  /**
   * Of the rule being created, `null` (or `undefined`) when it doesn't match the transaction.
   */
  effect: { keptBy: NewRuleKeptBy | null } | null | undefined
  current: CategoryId | null
  /**
   * Chosen in the category form.
   */
  category: CategoryId | null
  tree: CategoryTree
  t: TFunction
}

/**
 * The category the rule being created gives the transaction (with the current one as the title), or why it keeps its
 * category. `null` when unchanged, e.g. before a category is chosen.
 */
export const getCategoryPreview = ({ effect, current, category, tree, t }: GetCategoryPreviewProps) => {
  if (!effect) {
    return null
  }

  if (effect.keptBy) {
    return {
      title: t(
        effect.keptBy === 'override'
          ? 'STATS_PAGE.CATEGORY_RULES.KEPT_OVERRIDE'
          : 'STATS_PAGE.CATEGORY_RULES.KEPT_RULE',
      ),
    }
  }

  return category && category !== current
    ? {
        category,
        title: t('STATS_PAGE.CATEGORY_RULES.CURRENT_CATEGORY', {
          category: getCategoryLabel({ id: current, tree, t }),
        }),
      }
    : null
}
