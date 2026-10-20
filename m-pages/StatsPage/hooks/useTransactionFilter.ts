'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

import type { TransactionFilter } from '@/types'
import { AmountFilter } from '@/types-enums'
import { getView, MISC, WorkspaceView } from '@/common'
import { getDirection } from '@/m-transaction/service'

import { useWorkspaceCategories } from '../context'
import { useViewStorage } from './useViewStorage'

const NO_CATEGORIES = new Set<string>()
const NO_STORED_CATEGORIES: string[] = []

/**
 * Amount and category filter, shared by the views, the filters and the sidebar. Excluded rather than included
 * categories are stored, so categories of newly added files are shown. Nothing filtered in the CSV view, where the
 * filters don't apply. Kept separately in demo mode, see `useViewStorage`. The direction (income or expenses, by the
 * type of the category, so e.g. a refund of an expense stays an expense) follows from the excluded categories.
 */
export const useTransactionFilter = () => {
  const isCsv = getView(useSearchParams()) === WorkspaceView.CSV
  const { tree } = useWorkspaceCategories()
  const [storedAmountFilter, setAmountFilter] = useViewStorage<AmountFilter>(
    MISC.LS_STATS_AMOUNT_FILTER_KEY,
    AmountFilter.ALL,
  )
  const [storedCategories, setStoredCategories] = useViewStorage(
    MISC.LS_STATS_EXCLUDED_CATEGORIES_KEY,
    NO_STORED_CATEGORIES,
  )
  const amountFilter = isCsv ? AmountFilter.ALL : storedAmountFilter
  const excludedCategories = useMemo(
    () => (isCsv ? NO_CATEGORIES : new Set(storedCategories)),
    [isCsv, storedCategories],
  )
  const setExcludedCategories = useCallback(
    (categories: Set<string>) => setStoredCategories([...categories]),
    [setStoredCategories],
  )
  // Of the transactions table and the stats
  const filter: TransactionFilter = useMemo(
    () => ({ amount: amountFilter, excludedCategories }),
    [amountFilter, excludedCategories],
  )
  // The profit and loss and the sidebar show money in and out together (netted), so the amount filter doesn't apply
  const categoryFilter: TransactionFilter = useMemo(
    () => ({ amount: AmountFilter.ALL, excludedCategories }),
    [excludedCategories],
  )
  const direction = useMemo(() => getDirection(excludedCategories, tree), [excludedCategories, tree])

  return { filter, categoryFilter, amountFilter, setAmountFilter, direction, excludedCategories, setExcludedCategories }
}
