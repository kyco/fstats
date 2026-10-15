'use client'

import { Close } from '@mui/icons-material'
import { Box, Divider, IconButton, Tooltip, Typography } from '@mui/material'
import { Fragment, useMemo, useState } from 'react'

import type { CategoryRuleDraft, SourcedTransaction } from '@/types'
import { getSimilarTransactions } from '@/m-transaction/service'
import { useUserPreferences } from '@/m-user/service'
import { toDisplayDate } from '@/utils/Date'
import { toFixedLocaleCurrency } from '@/utils/Number'
import { useTranslation } from '@/lib/i18n'

import { useStatsTransactions, useWorkspace } from '../../context'
import CategoryEditor from '../CategoryEditor'
import { getExtraRows, getSimilarRows } from './actions'
import { ui } from './styled'

type TransactionDetailsProps = {
  transaction: SourcedTransaction
  onClose: () => void
  /**
   * The rule being created in the category form, so the table can highlight its matches.
   */
  onRuleChange: (rule: CategoryRuleDraft | null) => void
}

/**
 * The transaction selected in the transactions table: its details, those with the same description and its category,
 * which can be changed.
 */
const Component = ({ transaction, onClose, onRuleChange }: TransactionDetailsProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const { locale, dateFormat } = useUserPreferences()
  const { isDemoMode } = useWorkspace()
  const { unique } = useStatsTransactions()
  // The category form, opened below the category like an accordion
  const [isEditing, setIsEditing] = useState(false)
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
      <Box sx={sx.titleBar}>
        <Typography component="h2" sx={sx.title} title={transaction.description}>
          {transaction.description || '–'}
        </Typography>
        <Tooltip title={t('STATS_PAGE.TRANSACTION_DETAILS.CLOSE')}>
          <IconButton
            size="small"
            onClick={onClose}
            aria-label={t('STATS_PAGE.TRANSACTION_DETAILS.CLOSE')}
            sx={sx.closeButton}
          >
            <Close sx={sx.closeIcon} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={sx.summarySection}>
        <Box sx={sx.summary}>
          <Box component="span" sx={sx.amount}>
            {toFixedLocaleCurrency({ value: transaction.value, currency, locale, showPlusSign: true })}
          </Box>
          <Box component="span" sx={sx.date}>
            {toDisplayDate({ date: transaction.date, locale, formatTo: dateFormat })}
          </Box>
        </Box>
      </Box>

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
