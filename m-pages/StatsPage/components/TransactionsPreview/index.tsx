'use client'

import { uniq } from 'lodash'
import type { ReactNode } from 'react'
import { useMemo } from 'react'

import type { StatsFile, TransactionFilter } from '@/types'
import { isParsed } from '@/m-stats-file/service'
import { useUserPreferences } from '@/m-user/service'
import { getTransactionDay } from '@/utils/Date'
import { useTranslation } from '@/lib/i18n'

import { filterTransactions, getTransactionCounts, getTransactionCountText } from '../../actions'
import { useWorkspaceDayFilter } from '../../context'
import FileMessage from '../FileMessage'
import PreviewSection from '../PreviewSection'
import { STICKY_HEADER_OFFSET } from '../PreviewSection/actions'
import VirtualTable from '../VirtualTable'
import { filterBySearch, toSearchText } from '../VirtualTable/actions'
import {
  getSharedCurrency,
  getSourcedTransactions,
  getSourceLabel,
  getTransactionCells,
  getTransactionColumns,
  getTransactionTag,
} from './actions'
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
  const sx = ui()
  const { t } = useTranslation()
  const { locale, dateFormat } = useUserPreferences()
  const { deselectedDays } = useWorkspaceDayFilter()
  const parsedFiles = useMemo(() => files.filter(isParsed), [files])
  const isCombined = parsedFiles.length > 1
  const isSticky = isCombined && canStick
  // Shown on its own, with its status when it couldn't be parsed
  const singleFile = isCombined ? undefined : (parsedFiles[0] ?? files[0])
  // Also a file that couldn't be parsed, with its status
  const titleFile = showFileName || !parsedFiles.length ? singleFile : undefined
  const currency = useMemo(() => getSharedCurrency(parsedFiles), [parsedFiles])
  const amountFilter = filter.amount
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
    () => ({ currency, amountFilter, locale, dateFormat, t }),
    [currency, amountFilter, locale, dateFormat, t],
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
  const columns = useMemo(() => {
    const shownTags = uniq(tags.filter((tag) => tag !== null))

    return getTransactionColumns({
      currency,
      showSource: isCombined,
      amountFilter,
      t,
      tags: shownTags.length ? { shown: shownTags, getTag: (rowIndex) => tags[rowIndex] } : undefined,
    })
  }, [currency, isCombined, amountFilter, t, tags])
  // Same condition as the column in `getTransactionColumns`
  const hasTagColumn = isCombined || tags.some((tag) => tag !== null)

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
            ...(hasTagColumn
              ? [getSourceLabel({ transaction: transactions[index], showSource: isCombined, tag: tags[index], t })]
              : []),
          ]}
          highlight={search}
          stickyHeaderTop={isSticky ? STICKY_HEADER_OFFSET : undefined}
          getRowStyle={(index) => (tags[index] ? sx.excludedRow : undefined)}
          scrollElement={scrollElement}
        />
      ) : (
        <FileMessage file={files[0]} message={t('STATS_PAGE.DATA_VIEW.FILE_NOT_PARSED')} />
      )}
    </PreviewSection>
  )
}

export default Component
