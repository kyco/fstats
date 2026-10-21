'use client'

import { useTheme } from '@mui/material/styles'
import { uniq } from 'lodash'
import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'

import type { SourcedTransaction, StatsFile, TransactionFilter } from '@/types'
import { useActiveRuleset } from '@/m-category/service'
import { isParsed } from '@/m-stats-file/service'
import { filterTransactions, getSourcedTransactions, getTransactionCounts } from '@/m-transaction/service'
import { useUserPreferences } from '@/m-user/service'
import { getTransactionDay } from '@/utils/Date'
import { filterBySearch, highlightMatches, toSearchText } from '@/utils/Search'
import { useTranslation } from '@/lib/i18n'

import { getTransactionCountText } from '../../actions'
import {
  useWorkspace,
  useWorkspaceCategories,
  useWorkspaceDayFilter,
  useWorkspaceSelectedTransaction,
} from '../../context'
import FileMessage from '../FileMessage'
import PreviewSection from '../PreviewSection'
import { STICKY_HEADER_OFFSET } from '../PreviewSection/actions'
import VirtualTable from '../VirtualTable'
import {
  createPreviewMatcher,
  getCategoryInfo,
  getCategoryPreview,
  getSharedCurrency,
  getSourceLabel,
  getTransactionCells,
  getTransactionColumns,
  getTransactionTag,
} from './actions'
import CategoryCell from './components/CategoryCell'
import { ui } from './styled'

type TransactionsPreviewProps = {
  files: StatsFile[]
  filter: TransactionFilter
  includeDuplicates: boolean
  /**
   * Transactions on days deselected in the date explorer are greyed out, otherwise hidden.
   */
  includeDateExcluded: boolean
  scrollElement: HTMLElement | null
  /**
   * Only transactions containing the query in their shown values are shown, see `toSearchQuery`.
   */
  search: string
  /**
   * Next to the title, e.g. the currency.
   */
  chip?: string
  /**
   * Above the title, e.g. a divider from the previous table.
   */
  before?: ReactNode
  /**
   * Combined tables keep their title and header row in view, unless there are several in the scroll container.
   */
  canStick?: boolean
  /**
   * Titled with the file name when showing a single file (e.g. one table per file), otherwise "All transactions".
   */
  showFileName?: boolean
}

/**
 * Transactions of all files in a single table, with their source file when there is more than one.
 */
const Component = ({
  files,
  filter,
  includeDuplicates,
  includeDateExcluded,
  scrollElement,
  search,
  chip,
  before,
  canStick = true,
  showFileName = false,
}: TransactionsPreviewProps) => {
  const theme = useTheme()
  const sx = ui()
  const { t } = useTranslation()
  const { locale, dateFormat } = useUserPreferences()
  const { deselectedDays } = useWorkspaceDayFilter()
  const selected = useWorkspaceSelectedTransaction()
  const engine = useWorkspaceCategories()
  const { tree } = engine
  const { ruleset: activeRuleset } = useActiveRuleset()
  const { edit, guard } = selected
  // Asks first while the category form is open in the sidebar, it would be discarded
  const editCategory = useCallback(
    (transaction: SourcedTransaction, anchor: HTMLElement) => guard(() => edit(transaction, anchor)),
    [guard, edit],
  )
  // The demo is read-only, its categories can't be changed
  const { isDemoMode } = useWorkspace()
  // Rows the category form changes are highlighted
  const rulePreview = selected.rule
  const ruleMatcher = useMemo(
    () => (rulePreview ? createPreviewMatcher({ preview: rulePreview, engine }) : null),
    [rulePreview, engine],
  )
  const parsedFiles = useMemo(() => files.filter(isParsed), [files])
  const isCombined = parsedFiles.length > 1
  const isSticky = isCombined && canStick
  // Shown on its own, with its status when it couldn't be parsed
  const singleFile = isCombined ? undefined : (parsedFiles[0] ?? files[0])
  // Also a file that couldn't be parsed, with its status
  const titleFile = showFileName || !parsedFiles.length ? singleFile : undefined
  const currency = useMemo(() => getSharedCurrency(parsedFiles), [parsedFiles])
  const allTransactions = useMemo(
    () => filterTransactions(getSourcedTransactions(parsedFiles), filter),
    [parsedFiles, filter],
  )
  const shownTransactions = useMemo(
    () => (includeDuplicates ? allTransactions : allTransactions.filter((transaction) => !transaction.isDuplicate)),
    [allTransactions, includeDuplicates],
  )
  // Duplicates are already marked, no need to look for them again
  const counts = useMemo(
    () =>
      getTransactionCounts({
        transactions: allTransactions,
        deselectedDays,
        duplicates: new Set(allTransactions.filter((transaction) => transaction.isDuplicate)),
      }),
    [allTransactions, deselectedDays],
  )
  const dayTransactions = useMemo(
    () =>
      includeDateExcluded
        ? shownTransactions
        : shownTransactions.filter((transaction) => !deselectedDays.has(getTransactionDay(transaction))),
    [shownTransactions, includeDateExcluded, deselectedDays],
  )
  const cellOptions = useMemo(
    () => ({ currency, locale, dateFormat, tree, t }),
    [currency, locale, dateFormat, tree, t],
  )
  // Computed once a search starts, so typing only compares strings
  const isSearching = !!search
  const searchTexts = useMemo(
    () =>
      isSearching
        ? dayTransactions.map((transaction) => toSearchText(getTransactionCells(transaction, cellOptions)))
        : [],
    [isSearching, dayTransactions, cellOptions],
  )
  const transactions = useMemo(
    () => filterBySearch({ rows: dayTransactions, searchTexts, query: search }),
    [dayTransactions, searchTexts, search],
  )
  const tags = useMemo(
    () =>
      transactions.map((transaction) =>
        getTransactionTag(transaction, deselectedDays.has(getTransactionDay(transaction))),
      ),
    [transactions, deselectedDays],
  )
  // Where the categories are from, for the info column
  const categoryInfos = useMemo(
    () =>
      transactions.map((transaction) =>
        getCategoryInfo({ transaction, engine, activeName: activeRuleset?.name, isDemoMode, t }),
      ),
    [transactions, engine, activeRuleset?.name, isDemoMode, t],
  )
  // Of the rows the category form changes: what wins over it (`null` when it changes the category)
  const ruleEffects = useMemo(
    () =>
      ruleMatcher
        ? transactions.map((transaction) =>
            ruleMatcher.matches(transaction) ? { keptBy: ruleMatcher.getEffect(transaction) } : null,
          )
        : null,
    [ruleMatcher, transactions],
  )
  // The match the category form scrolled to, in this table
  const focusedMatch = rulePreview ? selected.focusedMatch : null
  const focusedIndex = focusedMatch ? transactions.findIndex((transaction) => transaction.id === focusedMatch.id) : -1
  const columns = useMemo(() => {
    const shownTags = uniq(tags.filter((tag) => tag !== null))

    return getTransactionColumns({
      currency,
      t,
      renderCategory: (label, rowIndex) => (
        <CategoryCell
          category={transactions[rowIndex].category}
          label={highlightMatches(label, search)}
          preview={getCategoryPreview({
            effect: ruleEffects?.[rowIndex],
            current: transactions[rowIndex].category,
            category: rulePreview?.category ?? null,
            tree,
            t,
          })}
          onClick={isDemoMode ? undefined : (anchor) => editCategory(transactions[rowIndex], anchor)}
        />
      ),
      // What the category form matches
      getDescriptionHighlights: ruleMatcher
        ? (rowIndex) =>
            ruleMatcher.matches(transactions[rowIndex]) ? ruleMatcher.getHighlights(transactions[rowIndex]) : []
        : undefined,
      tags: shownTags.length ? { shown: shownTags, getTag: (rowIndex) => tags[rowIndex] } : undefined,
    })
  }, [currency, t, tags, transactions, search, isDemoMode, editCategory, ruleMatcher, ruleEffects, rulePreview, tree])

  // Only tables with matches are shown, see `NoSearchResultsDisplay`
  if (parsedFiles.length && search && !transactions.length) {
    return null
  }

  return (
    <PreviewSection
      title={titleFile ? titleFile.file.name : t('MISC.ALL_TRANSACTIONS')}
      file={titleFile}
      chip={chip}
      before={before}
      // Like everywhere else, those greyed out or struck through aren't counted
      caption={
        !parsedFiles.length
          ? undefined
          : search
            ? t('STATS_PAGE.DATA_VIEW.SEARCH_MATCHES', { count: transactions.length })
            : getTransactionCountText(counts)
      }
      // A single table, so its title and header row can stay in view
      isSticky={isSticky}
    >
      {parsedFiles.length ? (
        <VirtualTable
          columns={columns}
          columnCount={columns.length}
          rowCount={transactions.length}
          getCells={(index) => [
            ...getTransactionCells(transactions[index], cellOptions),
            getSourceLabel({
              transaction: transactions[index],
              showSource: isCombined,
              tag: tags[index],
              categoryLines: categoryInfos[index],
              t,
            }),
          ]}
          highlight={search}
          stickyHeaderTop={isSticky ? STICKY_HEADER_OFFSET : undefined}
          onRowClick={(index) => guard(() => selected.toggle(transactions[index]))}
          getRowStyle={(index) => {
            const transaction = transactions[index]
            const isSame = (other: SourcedTransaction | undefined) =>
              transaction.id === other?.id && transaction.source === other.source
            const isSelected = isSame(selected.transaction ?? undefined) || isSame(selected.editing?.transaction)
            const isFocused = index === focusedIndex && !!ruleEffects?.[index]
            const highlight = isSelected
              ? { ...sx.selectedRow(theme), ...(isFocused ? sx.selectedFocusedRow(theme) : null) }
              : isFocused
                ? sx.focusedRow(theme)
                : ruleEffects?.[index]
                  ? sx.matchedRow(theme)
                  : undefined

            return tags[index] || highlight ? { ...(tags[index] ? sx.excludedRow : null), ...highlight } : undefined
          }}
          scrollElement={scrollElement}
          scrollTo={
            focusedMatch?.shouldScroll && focusedIndex >= 0 ? { index: focusedIndex, key: focusedMatch.key } : null
          }
        />
      ) : (
        <FileMessage file={files[0]} message={t('STATS_PAGE.DATA_VIEW.FILE_NOT_PARSED')} />
      )}
    </PreviewSection>
  )
}

export default Component
