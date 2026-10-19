'use client'

import { useCallback, useState } from 'react'

import type { CategoryEditorDraft, CategoryRulePreview, SelectedTransaction, SourcedTransaction } from '@/types'

type UseSelectedTransactionProps = {
  /**
   * Deselected (and the category editor closed) otherwise, e.g. in views without the transactions table.
   */
  isEnabled: boolean
}

/**
 * The transaction clicked in the transactions table, shown in the sidebar with its details, and the transaction whose
 * category is changed in the category editor menu.
 */
export const useSelectedTransaction = ({ isEnabled }: UseSelectedTransactionProps): SelectedTransaction => {
  const [transaction, setTransaction] = useState<SourcedTransaction | null>(null)
  const [editing, setEditing] = useState<SelectedTransaction['editing']>(null)
  const [rule, setRule] = useState<CategoryRulePreview | null>(null)
  const [draft, setDraft] = useState<SelectedTransaction['draft']>(null)
  const [focusedMatch, setFocusedMatch] = useState<SelectedTransaction['focusedMatch']>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  // Waits until the user decides to discard the category form
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const close = useCallback(() => {
    setTransaction(null)
    setDraft(null)
    setFocusedMatch(null)
  }, [])

  // Clicking the selected transaction again deselects it. By ID, transactions are recreated when categories change.
  const toggle = useCallback((next: SourcedTransaction) => {
    setTransaction((prev) => (prev?.id === next.id && prev.source === next.source ? null : next))
    setDraft(null)
    setFocusedMatch(null)
  }, [])

  const edit = useCallback(
    (next: SourcedTransaction, anchor: HTMLElement) => {
      setEditing({ transaction: next, anchor })
      setRule(null)
      setFocusedMatch(null)

      // Only one row is selected, the sidebar closes for another transaction, or with its form (one form at a time)
      if (transaction && (isFormOpen || transaction.id !== next.id || transaction.source !== next.source)) {
        setTransaction(null)
        setDraft(null)
      }
    },
    [transaction, isFormOpen],
  )

  const closeEditor = useCallback(() => {
    setEditing(null)
    setRule(null)
  }, [])

  // The rule stays highlighted, the form in the sidebar takes it over
  const moveToSidebar = useCallback(
    (values: CategoryEditorDraft) => {
      if (!editing) {
        return
      }

      setTransaction(editing.transaction)
      // Already in view, where it was clicked
      setFocusedMatch((prev) => ({ id: editing.transaction.id, key: (prev?.key ?? 0) + 1, shouldScroll: false }))
      setDraft((prev) => ({ values, key: (prev?.key ?? 0) + 1 }))
      setEditing(null)
    },
    [editing],
  )

  const focusMatch = useCallback((id: string, shouldScroll = true) => {
    setFocusedMatch((prev) => ({ id, key: (prev?.key ?? 0) + 1, shouldScroll }))
  }, [])

  const guard = useCallback(
    (action: () => void) => {
      if (isFormOpen) {
        setPendingAction(() => action)
      } else {
        action()
      }
    },
    [isFormOpen],
  )

  const discard = useCallback(() => {
    pendingAction?.()
    setPendingAction(null)
  }, [pendingAction])

  const keepEditing = useCallback(() => {
    setPendingAction(null)
  }, [])

  if (!isEnabled && (transaction || editing)) {
    close()
    closeEditor()
  }

  return {
    transaction,
    toggle,
    close,
    editing,
    edit,
    closeEditor,
    rule,
    setRule,
    draft,
    moveToSidebar,
    focusedMatch,
    focusMatch,
    setIsFormOpen,
    guard,
    isAskingToDiscard: !!pendingAction,
    discard,
    keepEditing,
  }
}
