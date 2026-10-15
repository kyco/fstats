'use client'

import { TransactionsLayout } from '@/types-enums'
import { MISC } from '@/common'

import { useViewStorage } from './useViewStorage'

/**
 * Display options of the transactions table: the layout of multiple files, and whether duplicates and transactions on
 * deselected days are shown (greyed out). Display only, they are never counted. Kept separately in demo mode, see
 * `useViewStorage`.
 */
export const useTableOptions = () => {
  const [transactionsLayout, setTransactionsLayout] = useViewStorage<TransactionsLayout>(
    MISC.LS_STATS_TRANSACTIONS_LAYOUT_KEY,
    TransactionsLayout.COMBINED,
  )
  const [includeDuplicates, setIncludeDuplicates] = useViewStorage(MISC.LS_STATS_INCLUDE_DUPLICATES_KEY, false)
  const [includeDateExcluded, setIncludeDateExcluded] = useViewStorage(MISC.LS_STATS_INCLUDE_DATE_EXCLUDED_KEY, false)

  return {
    transactionsLayout,
    setTransactionsLayout,
    includeDuplicates,
    setIncludeDuplicates,
    includeDateExcluded,
    setIncludeDateExcluded,
  }
}
