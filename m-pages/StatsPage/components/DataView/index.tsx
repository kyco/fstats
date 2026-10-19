'use client'

import { Box } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { useDeferredValue, useMemo, useState } from 'react'

import { TransactionsLayout } from '@/types-enums'
import { getView, WorkspaceView } from '@/common'
import { FletchingDivider, SearchField, SegmentedToggle } from '@/components'
import { filterTransactions, getFilteredCurrencies, groupFilesByCurrency } from '@/m-transaction/service'
import { useTranslation } from '@/lib/i18n'

import {
  ALL_CURRENCIES,
  EMPTY_REASON_TITLE_KEYS,
  getAmountFilterOptions,
  getEmptyReason,
  getTransactionsLayoutOptions,
} from '../../actions'
import { useStatsTransactions, useWorkspaceFiles, useWorkspaceSearch } from '../../context'
import { useCurrencySelect, useTableOptions, useTransactionFilter } from '../../hooks'
import CsvPreview from '../CsvPreview'
import NoSearchResultsDisplay from '../NoSearchResultsDisplay'
import TransactionsPreview from '../TransactionsPreview'
import ViewEmptyState from '../ViewEmptyState'
import ViewToolbar from '../ViewToolbar'
import { toSearchQuery } from '../VirtualTable/actions'
import { ui } from './styled'

/**
 * Transactions or CSV view of the workspace (`view` param) of the checked files.
 */
const Component = () => {
  const sx = ui()
  const { t } = useTranslation()
  // State rather than a ref, so the previews re-render once the scroll element exists
  const [middleColumn, setMiddleColumn] = useState<HTMLDivElement | null>(null)
  const isTransactions = getView(useSearchParams()) === WorkspaceView.TRANSACTIONS
  // Kept when switching views. Deferred, so typing stays responsive with many rows.
  const { value: search, setValue: setSearch } = useWorkspaceSearch()
  const searchQuery = toSearchQuery(useDeferredValue(search))
  const {
    transactionsLayout,
    setTransactionsLayout,
    includeDuplicates,
    setIncludeDuplicates,
    includeDateExcluded,
    setIncludeDateExcluded,
  } = useTableOptions()
  const { filter, amountFilter, setAmountFilter } = useTransactionFilter()
  const { all, unique, shown, count } = useStatsTransactions()
  // All transactions, those on days deselected in the date explorer are greyed out or hidden
  const { files, checkedFiles, selectedFiles: checkedParsedFiles } = useWorkspaceFiles()
  const visible = includeDateExcluded ? unique : shown
  // The transactions and filters don't apply to the CSV view. The transactions view also shows the messages of files
  // without transactions. Memoized, the view re-renders on each search keystroke.
  const emptyReason = useMemo(
    () =>
      getEmptyReason({
        fileCount: files.length,
        checkedCount: checkedFiles.length,
        transactions: isTransactions ? { all, shown: visible, filter, allowEmpty: true } : undefined,
      }),
    [files.length, checkedFiles.length, isTransactions, all, visible, filter],
  )
  const isEmpty = !!emptyReason
  // The view's controls only apply to checked files
  const isTransactionsView = checkedFiles.length > 0 && isTransactions
  // Multiple parsed files are shown as one, with combined stats above the stats per file
  const isCombined = checkedParsedFiles.length > 1
  const isTransactionsSplit = isCombined && transactionsLayout === TransactionsLayout.SPLIT
  // The combined table can be shown per currency, like the breakdown and stats views
  const filesByCurrency = useMemo(() => groupFilesByCurrency(checkedParsedFiles), [checkedParsedFiles])
  const currencies = useMemo(() => getFilteredCurrencies(visible, filter), [visible, filter])
  // Stable arrays per file for the split tables, as `TransactionsPreview` memoizes on `files`
  const splitFiles = useMemo(() => checkedFiles.map((file) => [file]), [checkedFiles])
  const {
    selected: selectedCurrency,
    setSelected: setSelectedCurrency,
    shownCurrencies,
  } = useCurrencySelect(currencies)
  const isPerCurrency = isTransactionsView && !isTransactionsSplit && currencies.length > 1
  // Shared by all transaction tables
  const previewProps = {
    filter,
    includeDuplicates,
    includeDateExcluded,
    scrollElement: middleColumn,
    search: searchQuery,
  }
  // Of the selected currency only, when one table per currency is shown
  const countedCurrency = isPerCurrency && selectedCurrency !== ALL_CURRENCIES ? selectedCurrency : null
  const counts = useMemo(
    () =>
      count(
        filterTransactions(
          countedCurrency ? all.filter((transaction) => transaction.currency === countedCurrency) : all,
          filter,
        ),
      ),
    [count, all, filter, countedCurrency],
  )
  // Only the combined table has duplicates
  const duplicateCount = isCombined && !isTransactionsSplit ? counts.duplicateCount : 0

  return (
    <>
      {/* Outside the scroll container, so it stays in place */}
      <ViewToolbar
        currency={
          isTransactionsView
            ? {
                currencies,
                value: selectedCurrency,
                onChange: setSelectedCurrency,
                // The tables are per file
                disabled: isTransactionsSplit,
              }
            : undefined
        }
        end={<SearchField value={search} onChange={setSearch} disabled={isEmpty} />}
        options={
          isTransactionsView
            ? [
                {
                  key: 'dateExcluded',
                  label: t('STATS_PAGE.DATA_VIEW.SHOW_DATE_EXCLUDED'),
                  count: counts.dateExcludedCount,
                  checked: includeDateExcluded,
                  onChange: setIncludeDateExcluded,
                },
                {
                  key: 'duplicates',
                  label: t('STATS_PAGE.DATA_VIEW.SHOW_DUPLICATES'),
                  count: duplicateCount,
                  checked: includeDuplicates,
                  onChange: setIncludeDuplicates,
                },
              ]
            : undefined
        }
      >
        {/* Always shown, so the toolbar doesn't change when switching views */}
        <SegmentedToggle
          value={amountFilter}
          options={getAmountFilterOptions()}
          onChange={setAmountFilter}
          disabled={!isTransactionsView}
          disabledTooltip={
            !checkedFiles.length && emptyReason
              ? t(EMPTY_REASON_TITLE_KEYS[emptyReason])
              : !isTransactions
                ? t('STATS_PAGE.CSV_DISABLED')
                : undefined
          }
        />
        {isTransactionsView && isCombined ? (
          <SegmentedToggle
            value={transactionsLayout}
            options={getTransactionsLayoutOptions()}
            onChange={setTransactionsLayout}
          />
        ) : null}
      </ViewToolbar>
      <Box ref={setMiddleColumn} sx={sx.middleScroll(isEmpty)}>
        {/* Single child, observed by the tables for layout changes above them */}
        <Box sx={sx.tables}>
          {emptyReason ? (
            <ViewEmptyState reason={emptyReason} />
          ) : isTransactions ? (
            isTransactionsSplit ? (
              splitFiles.map((fileGroup) => (
                <TransactionsPreview key={fileGroup[0].id} files={fileGroup} showFileName {...previewProps} />
              ))
            ) : isPerCurrency ? (
              shownCurrencies.map((currency) => (
                <TransactionsPreview
                  key={currency}
                  files={filesByCurrency[currency]}
                  {...previewProps}
                  chip={currency}
                  // Hidden above the first table, see `sx.tables`
                  before={<FletchingDivider />}
                  canStick={shownCurrencies.length === 1}
                />
              ))
            ) : (
              <TransactionsPreview files={checkedFiles} {...previewProps} />
            )
          ) : (
            checkedFiles.map((file) => (
              <CsvPreview key={file.id} file={file} scrollElement={middleColumn} search={searchQuery} />
            ))
          )}
        </Box>
        {/* Shown by CSS once the tables leave the content empty, so they don't need to report their matches */}
        {searchQuery ? (
          <Box sx={sx.noSearchResults}>
            <NoSearchResultsDisplay search={search.trim()} onClear={() => setSearch('')} />
          </Box>
        ) : null}
      </Box>
    </>
  )
}

export default Component
