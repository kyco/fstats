'use client'

import { createContext, useContext } from 'react'

import type { WorkspaceContextValue } from '@/types'

/**
 * Lets the views inside the workspace use its file picker, files and transactions. Synchronous state only.
 */
export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export const useWorkspace = () => {
  const value = useContext(WorkspaceContext)

  if (!value) {
    throw new Error('useWorkspace must be used inside the workspace')
  }

  return value
}

/**
 * The files shown in the workspace, only the demo file in demo mode.
 */
export const useWorkspaceFiles = () => {
  return useWorkspace().files
}

/**
 * Days deselected in the date explorer, see `useDayFilter`.
 */
export const useWorkspaceDayFilter = () => {
  return useWorkspace().dayFilter
}

/**
 * Transactions of the checked parsed files, computed once for all components, see `getStatsTransactions`.
 */
export const useStatsTransactions = () => {
  return useWorkspace().stats
}

/**
 * The transaction clicked in the transactions table, shown in the sidebar, see `useSelectedTransaction`.
 */
export const useWorkspaceSelectedTransaction = () => {
  return useWorkspace().selectedTransaction
}

/**
 * Search of the transactions and CSV views, kept when switching views.
 */
export const useWorkspaceSearch = () => {
  return useWorkspace().search
}

/**
 * Decided the categories of the files, its `tree` has the categories of the active rule set (the standard ones in demo
 * mode).
 */
export const useWorkspaceCategories = () => {
  return useWorkspace().categoryEngine
}
