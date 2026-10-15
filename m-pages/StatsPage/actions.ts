import { uniq } from 'lodash'

import type {
  NumberString,
  ParsedStatsFile,
  StatsFile,
  Transaction,
  TransactionCounts,
  TransactionFilter,
} from '@/types'
import { AmountFilter, EmptyReason, StatsFileStatus, TransactionsLayout } from '@/types-enums'
import { MISC } from '@/common'
import { isConvertible, isError, isParsed, isUnknown } from '@/m-stats-file/service'
import { filterTransactions } from '@/m-transaction/service'
import { getParser } from '@/utils/Parser'
import { i18n } from '@/lib/i18n'
import { Big } from '@/lib/w-big'

/**
 * Currency selection of all currencies, see `useCurrencySelect`.
 */
export const ALL_CURRENCIES = 'all'

/**
 * Bank and accounts of a parsed file, e.g. Comdirect with Giro and Visa.
 */
export const getFileAccount = (file: ParsedStatsFile) => {
  // Files of deleted custom parsers are re-parsed on start, until then they show their parser ID
  const parsers = uniq(file.sections.map((section) => section.parserId)).map(
    (parserId) => getParser(parserId) ?? { bankName: parserId, accountName: parserId },
  )
  return { bankName: parsers[0].bankName, accountNames: parsers.map((parser) => parser.accountName) }
}

/**
 * Same colors as `FileStatusIcon`.
 */
export const getFileNameColor = (file: StatsFile) => {
  return isConvertible(file)
    ? 'info.main'
    : isUnknown(file)
      ? 'warning.main'
      : isError(file)
        ? 'error.main'
        : 'text.primary'
}

/**
 * What a file was parsed as, or why it wasn't.
 */
export const getFileFormat = (file: StatsFile) => {
  if (isParsed(file)) {
    // Sections are all from the same bank, e.g. "Comdirect · Giro + Visa"
    const { bankName, accountNames } = getFileAccount(file)
    return { value: `${bankName} ${MISC.CENTER_DOT} ${accountNames.join(' + ')}`, color: 'text.primary' }
  }

  if (file.status === StatsFileStatus.PARSING) {
    return { value: i18n.t('STATS_PAGE.FILE_STATUS.PARSING'), color: 'text.secondary' }
  }

  if (isConvertible(file)) {
    return { value: i18n.t('STATS_PAGE.FILE_STATUS.CONVERTIBLE_FORMAT'), color: 'info.main' }
  }

  if (isUnknown(file)) {
    return { value: i18n.t('STATS_PAGE.FILE_STATUS.UNSUPPORTED_FORMAT'), color: 'warning.main' }
  }

  return { value: file.status === StatsFileStatus.ERROR ? file.error.message : '-', color: 'error.main' }
}

/**
 * Like accounting software, only negative amounts are colored.
 */
export const getAmountColor = (value: NumberString) => {
  return Big(value).lt(0) ? 'error.main' : undefined
}

export const MIN_COLUMN_WIDTH_PERCENT = 10

type ResizeColumnsProps = {
  widths: number[]
  index: number
  delta: number
}

/**
 * Moves the divider between column `index` and `index + 1` by `delta` percent, respecting the minimum width.
 */
export const resizeColumns = ({ widths, index, delta }: ResizeColumnsProps) => {
  const total = widths[index] + widths[index + 1]
  const left = Math.min(Math.max(widths[index] + delta, MIN_COLUMN_WIDTH_PERCENT), total - MIN_COLUMN_WIDTH_PERCENT)
  const next = [...widths]
  next[index] = left
  next[index + 1] = total - left
  return next
}

/**
 * Opens the browser's folder picker and returns all files in it (recursively), or `undefined` if nothing was picked.
 */
export const openFolderPicker = async () => {
  try {
    if (!('showDirectoryPicker' in window)) {
      alert(i18n.t('STATS_PAGE.FOLDER.NOT_SUPPORTED'))
      return
    }

    // @ts-expect-error showDirectoryPicker not in TS types
    const directoryHandle = await window.showDirectoryPicker()

    const getFilesRecursively = async (dirHandle: any): Promise<File[]> => {
      const files: File[] = []
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          files.push(await entry.getFile())
        } else if (entry.kind === 'directory') {
          files.push(...(await getFilesRecursively(entry)))
        }
      }
      return files
    }

    const files = await getFilesRecursively(directoryHandle)

    if (!files.length) {
      alert(i18n.t('STATS_PAGE.FOLDER.EMPTY'))
      return
    }

    return files
  } catch (error) {
    const err = error as Error
    if (err.name !== 'AbortError') {
      console.error('Error selecting folder:', error)
      alert(i18n.t('STATS_PAGE.FOLDER.ACCESS_FAILED'))
    }
  }
}

/**
 * Sets the files of a file input and fires its change event, as if the user had picked them.
 */
export const setInputFiles = (input: HTMLInputElement, files: File[]) => {
  const dataTransfer = new DataTransfer()
  files.forEach((file) => dataTransfer.items.add(file))
  input.files = dataTransfer.files
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

export const getTransactionsLayoutOptions = () => [
  {
    value: TransactionsLayout.COMBINED,
    label: i18n.t('STATS_PAGE.DATA_VIEW.TRANSACTIONS_LAYOUT.COMBINED'),
    title: i18n.t('STATS_PAGE.DATA_VIEW.TRANSACTIONS_LAYOUT.COMBINED_TITLE'),
  },
  {
    value: TransactionsLayout.SPLIT,
    label: i18n.t('STATS_PAGE.DATA_VIEW.TRANSACTIONS_LAYOUT.SPLIT'),
    title: i18n.t('STATS_PAGE.DATA_VIEW.TRANSACTIONS_LAYOUT.SPLIT_TITLE'),
  },
]

export const getAmountFilterOptions = () => [
  {
    value: AmountFilter.ALL,
    label: i18n.t('STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.ALL'),
    title: i18n.t('STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.ALL_TITLE'),
  },
  {
    value: AmountFilter.IN,
    label: i18n.t('STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.IN'),
    title: i18n.t('STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.IN_TITLE'),
  },
  {
    value: AmountFilter.OUT,
    label: i18n.t('STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.OUT'),
    title: i18n.t('STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.OUT_TITLE'),
  },
]

export const EMPTY_REASON_TITLE_KEYS: Record<EmptyReason, string> = {
  [EmptyReason.NO_FILES]: 'STATS_PAGE.NO_FILES.TITLE',
  [EmptyReason.NO_SELECTION]: 'STATS_PAGE.NO_SELECTION.TITLE',
  [EmptyReason.NO_TRANSACTIONS]: 'STATS_PAGE.NO_TRANSACTIONS.EMPTY_TITLE',
  [EmptyReason.NO_DATES]: 'STATS_PAGE.NO_TRANSACTIONS.NO_DATES_TITLE',
  [EmptyReason.NO_MATCHES]: 'STATS_PAGE.NO_TRANSACTIONS.NO_MATCHES_TITLE',
}

/**
 * There's nothing the view's controls could change, unlike deselected days or filters without matches.
 */
export const isMissingData = (reason: EmptyReason | null) => {
  return (
    reason === EmptyReason.NO_FILES || reason === EmptyReason.NO_SELECTION || reason === EmptyReason.NO_TRANSACTIONS
  )
}

type GetEmptyReasonProps = {
  fileCount: number
  checkedCount: number
  /**
   * Of the checked files, omitted for views that don't show transactions (the CSV view).
   */
  transactions?: {
    all: Transaction[]
    /**
     * Without those on deselected days.
     */
    shown: Transaction[]
    /**
     * Omitted where the filters don't apply (the date explorer).
     */
    filter?: TransactionFilter
    /**
     * The view also shows files without transactions (e.g. the messages of unsupported files).
     */
    allowEmpty?: boolean
  }
}

/**
 * Why a view of the checked files is empty, in this order: no files, none checked, no transactions (e.g. only
 * unsupported files), all days deselected in the date explorer, or the filters leave none. `null` if there's
 * something to show.
 */
export const getEmptyReason = ({ fileCount, checkedCount, transactions }: GetEmptyReasonProps): EmptyReason | null => {
  if (!fileCount) {
    return EmptyReason.NO_FILES
  }

  if (!checkedCount) {
    return EmptyReason.NO_SELECTION
  }

  if (!transactions) {
    return null
  }

  const { all, shown, filter, allowEmpty = false } = transactions

  if (!all.length) {
    return allowEmpty ? null : EmptyReason.NO_TRANSACTIONS
  }

  if (!shown.length) {
    return EmptyReason.NO_DATES
  }

  return !filter || filterTransactions(shown, filter).length ? null : EmptyReason.NO_MATCHES
}

/**
 * E.g. "20 transactions · 12 excluded by date · 5 duplicates excluded".
 */
export const getTransactionCountText = ({ count, dateExcludedCount, duplicateCount }: TransactionCounts) => {
  return [
    i18n.t('MISC.TRANSACTION_COUNT', { count }),
    ...(dateExcludedCount ? [i18n.t('MISC.DATE_EXCLUDED', { count: dateExcludedCount })] : []),
    ...(duplicateCount ? [i18n.t('MISC.DUPLICATES_EXCLUDED', { count: duplicateCount })] : []),
  ].join(` ${MISC.CENTER_DOT} `)
}
