'use client'

import { useCallback, useState } from 'react'

import type { CategoryRuleDraft, SelectedTransaction, SourcedTransaction } from '@/types'

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
  const [rule, setRule] = useState<CategoryRuleDraft | null>(null)

  const close = useCallback(() => {
    setTransaction(null)
  }, [])

  // Clicking the selected transaction again deselects it. By ID, transactions are recreated when categories change.
  const toggle = useCallback((next: SourcedTransaction) => {
    setTransaction((prev) => (prev?.id === next.id && prev.source === next.source ? null : next))
  }, [])

  const edit = useCallback((next: SourcedTransaction, anchor: HTMLElement) => {
    setEditing({ transaction: next, anchor })
    setRule(null)
  }, [])

  const closeEditor = useCallback(() => {
    setEditing(null)
    setRule(null)
  }, [])

  if (!isEnabled && (transaction || editing)) {
    close()
    closeEditor()
  }

  return { transaction, toggle, close, editing, edit, closeEditor, rule, setRule }
}
