'use client'

import { Box, Divider, Typography } from '@mui/material'
import { Fragment, useEffect, useMemo, useState } from 'react'

import type { CategoryEditorDraft, CategoryRulePreview, SourcedTransaction } from '@/types'
import { getSimilarTransactions } from '@/m-transaction/service'
import { useUserPreferences } from '@/m-user/service'
import { useTranslation } from '@/lib/i18n'

import { useStatsTransactions, useWorkspace, useWorkspaceSelectedTransaction } from '../../context'
import CategoryEditor from '../CategoryEditor'
import TransactionHeader from '../TransactionHeader'
import { getExtraRows, getSimilarRows } from './actions'
import DiscardOverlay from './components/DiscardOverlay'
import { ui } from './styled'

type TransactionDetailsProps = {
  transaction: SourcedTransaction
  onClose: () => void
  /**
   * The rule being created in the category form, so the table can highlight its matches.
   */
  onRuleChange: (rule: CategoryRulePreview | null) => void
  /**
   * The form moved from the category editor menu, opened with what was entered there.
   */
  draft?: CategoryEditorDraft
}

/**
 * The transaction selected in the transactions table: its details, those with the same description and its category,
 * which can be changed.
 */
const Component = ({ transaction, onClose, onRuleChange, draft }: TransactionDetailsProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const { locale, dateFormat } = useUserPreferences()
  const { isDemoMode } = useWorkspace()
  const { unique } = useStatsTransactions()
  const { focusMatch, focusedMatch, setForm, isAskingToDiscard, discard, keepEditing } =
    useWorkspaceSelectedTransaction()
  // The category form, opened below the category like an accordion
  const [isEditing, setIsEditing] = useState(!!draft)
  const [hasChanges, setHasChanges] = useState(false)

  // Clicking rows or categories in the table asks before discarding the changes, until it's closed (also with the
  // sidebar)
  useEffect(() => {
    setForm({ isOpen: isEditing, hasChanges: isEditing && hasChanges })
    return () => setForm({ isOpen: false, hasChanges: false })
  }, [isEditing, hasChanges, setForm])
  // Starts the form over each time
  const [editorKey, setEditorKey] = useState(0)
  const similar = useMemo(() => getSimilarTransactions(unique, transaction), [unique, transaction])
  const format = { locale, dateFormat, t }
  const { currency } = transaction
  const extraRows = getExtraRows({ transaction, ...format })

  // Labels and values in two columns
  const renderRows = (rows: { label: string; value: string }[]) => (
    <Box component="dl" sx={sx.fields}>
      {rows.map((row) => (
        <Fragment key={row.label}>
          <Box component="dt" sx={sx.fieldLabel}>
            {row.label}
          </Box>
          <Box component="dd" sx={sx.fieldValue}>
            {row.value}
          </Box>
        </Fragment>
      ))}
    </Box>
  )

  return (
    <Box sx={sx.panel}>
      {isAskingToDiscard ? <DiscardOverlay onContinue={keepEditing} onDiscard={discard} /> : null}

      <TransactionHeader transaction={transaction} onClose={onClose} />

      <Divider />

      <CategoryEditor
        key={editorKey}
        transaction={transaction}
        isEditing={isEditing}
        // The demo is read-only
        readOnly={isDemoMode}
        onEdit={() => setIsEditing(true)}
        onClose={() => {
          setIsEditing(false)
          setEditorKey((key) => key + 1)
          onRuleChange(null)
        }}
        onRuleChange={onRuleChange}
        // Only the first time, starting over shows the defaults
        initialDraft={editorKey ? undefined : draft}
        onFocusMatch={focusMatch}
        focusedMatchId={focusedMatch?.id}
        onChangesChange={setHasChanges}
      />

      {/* One grid for the sections below, so their labels and values line up */}
      <Box sx={sx.grid}>
        {extraRows.length ? (
          <>
            <Divider sx={sx.fullRow} />

            <Box sx={sx.gridSection}>
              <Box sx={sx.heading}>{t('STATS_PAGE.TRANSACTION_DETAILS.ADDITIONAL_FIELDS')}</Box>
              {renderRows(extraRows)}
            </Box>
          </>
        ) : null}

        <Divider sx={sx.fullRow} />

        <Box sx={sx.gridSection}>
          <Box sx={sx.heading}>{t('STATS_PAGE.TRANSACTION_DETAILS.STATS')}</Box>
          {similar.count > 1 ? (
            renderRows(getSimilarRows({ similar, currency, ...format }))
          ) : (
            <Typography sx={{ ...sx.empty, ...sx.fullRow }}>{t('STATS_PAGE.TRANSACTION_DETAILS.ONLY_ONCE')}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default Component
