'use client'

import { Alert, Box } from '@mui/material'
import { format, parseISO } from 'date-fns'

import type { SetupPreviewResult } from '@/types'
import { AmountFilter } from '@/types-enums'
import type { Currency } from '@/types-enums'
import { isValidPreview } from '@/m-custom-parser/service'
import { useUserPreferences } from '@/m-user/service'
import { useTranslation } from '@/lib/i18n'

import { getTransactionCells, getTransactionColumns } from '../../../TransactionsPreview/actions'
import VirtualTable from '../../../VirtualTable'
import { PREVIEW_ROWS } from '../../actions'
import { ui } from './styled'

type SetupPreviewProps = {
  /**
   * `null` while required columns are missing.
   */
  preview: SetupPreviewResult | null
  /**
   * Of the amounts, also shown without transactions.
   */
  currency: Currency
  /**
   * Of the file, dates are shown as in it rather than in the user's format, so they can be compared.
   */
  dateFormat: string
  scrollElement: HTMLElement | null
}

/**
 * The first transactions as they will be read (like the transactions view). Without any, the empty table with why.
 */
const Component = ({ preview, currency, dateFormat: fileDateFormat, scrollElement }: SetupPreviewProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const { locale, dateFormat } = useUserPreferences()
  const transactions = preview?.transactions.slice(0, PREVIEW_ROWS) ?? []
  const [dateColumn, ...otherColumns] = getTransactionColumns({
    currency,
    showInfo: false,
    amountFilter: AmountFilter.ALL,
    t,
  })
  // Wider, the file's dates can have a time
  const columns = [{ ...dateColumn, width: 150 }, ...otherColumns]
  // Why is shown above the buttons of the steps
  const hasTransactions = isValidPreview(preview)

  return (
    <>
      <VirtualTable
        columns={columns}
        columnCount={columns.length}
        rowCount={transactions.length}
        getCells={(index) => {
          const transaction = transactions[index]
          const [, ...cells] = getTransactionCells(transaction, {
            currency,
            amountFilter: AmountFilter.ALL,
            locale,
            dateFormat,
            t,
          })
          return [format(parseISO(transaction.date), fileDateFormat), ...cells]
        }}
        scrollElement={scrollElement}
      />
      {/* Like a first row of the table */}
      {!hasTransactions ? (
        <Box sx={sx.body}>
          <Alert severity="info" sx={sx.alert}>
            {t('STATS_PAGE.PARSER_SETUP.PREVIEW_UNAVAILABLE')}
          </Alert>
        </Box>
      ) : null}
    </>
  )
}

export default Component
