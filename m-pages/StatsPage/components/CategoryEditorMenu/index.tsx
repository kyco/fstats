'use client'

import type { PopoverActions } from '@mui/material'
import { Box, Divider, Popover } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

import { useWorkspaceSelectedTransaction } from '../../context'
import CategoryEditor from '../CategoryEditor'
import TransactionHeader from '../TransactionHeader'
import { ui } from './styled'

/**
 * Changes the category of a transaction, opened from its category in the transactions table or from the transaction
 * details.
 */
const Component = () => {
  const sx = ui()
  const { editing, closeEditor, setRule, moveToSidebar } = useWorkspaceSelectedTransaction()
  const actionsRef = useRef<PopoverActions>(null)
  const [content, setContent] = useState<HTMLElement | null>(null)

  // Moved when its content grows (e.g. the rule fields), so it stays in view and scrolls instead
  useEffect(() => {
    if (!content) {
      return
    }

    const observer = new ResizeObserver(() => actionsRef.current?.updatePosition())
    observer.observe(content)
    return () => observer.disconnect()
  }, [content])

  if (!editing) {
    return null
  }

  const { transaction, anchor } = editing

  return (
    <Popover
      open
      action={actionsRef}
      anchorEl={anchor}
      onClose={closeEditor}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{ paper: { sx: sx.paper } }}
    >
      <Box ref={setContent}>
        {/* Like the transaction details */}
        <TransactionHeader transaction={transaction} onClose={closeEditor} />
        <Divider />
        <CategoryEditor
          // Starts over for another transaction
          key={`${transaction.id}|${transaction.source}`}
          transaction={transaction}
          isEditing
          onClose={closeEditor}
          onRuleChange={setRule}
          onMoveToSidebar={moveToSidebar}
        />
      </Box>
    </Popover>
  )
}

export default Component
