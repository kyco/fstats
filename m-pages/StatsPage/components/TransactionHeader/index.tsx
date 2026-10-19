'use client'

import { Close } from '@mui/icons-material'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'

import type { Transaction } from '@/types'
import { useUserPreferences } from '@/m-user/service'
import { toDisplayDate } from '@/utils/Date'
import { toFixedLocaleCurrency } from '@/utils/Number'
import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type TransactionHeaderProps = {
  transaction: Transaction
  onClose: () => void
}

/**
 * The date, description and amount of a transaction with a close button, of the transaction details and the
 * category editor menu.
 */
const Component = ({ transaction, onClose }: TransactionHeaderProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const { locale, dateFormat } = useUserPreferences()

  return (
    <>
      <Box sx={sx.titleBar}>
        {/* The date above the description, so it's found at once */}
        <Box sx={sx.titleGroup}>
          <Box component="span" sx={sx.date}>
            {toDisplayDate({ date: transaction.date, locale, formatTo: dateFormat })}
          </Box>
          <Typography component="h2" sx={sx.title}>
            {transaction.description || '–'}
          </Typography>
        </Box>
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
        <Box component="span" sx={sx.amount}>
          {toFixedLocaleCurrency({
            value: transaction.value,
            currency: transaction.currency,
            locale,
            showPlusSign: true,
          })}
        </Box>
      </Box>
    </>
  )
}

export default Component
