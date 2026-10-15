'use client'

import { Alert, Box } from '@mui/material'
import { useMemo } from 'react'

import type { SetupDraft } from '@/types'
import { Currency } from '@/types-enums'
import { useUserPreferences } from '@/m-user/service'
import { getCurrencySymbol } from '@/utils/Currency'
import type { NumberFormat } from '@/utils/Parser'
import { useTranslation } from '@/lib/i18n'

import FormatSelect from '../FormatSelect'
import { NUMBER_FORMAT_LABELS } from './actions'
import { ui } from './styled'

type AmountFormatsProps = {
  draft: SetupDraft
  /**
   * The amounts can't be read with the number format.
   */
  isNumberMismatch: boolean
  onChange: (changes: Partial<SetupDraft>) => void
}

/**
 * The currency and number format of the amounts, both rarely in the file and detected from its values.
 */
const Component = ({ draft, isNumberMismatch, onChange }: AmountFormatsProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const { locale } = useUserPreferences()
  // Localized names, e.g. "Euro" or "US-Dollar"
  const currencyNames = useMemo(() => new Intl.DisplayNames([locale], { type: 'currency' }), [locale])

  return (
    <Box sx={sx.container}>
      <Box sx={sx.fields}>
        <Box component="label" sx={sx.field}>
          {t('STATS_PAGE.PARSER_SETUP.CURRENCY')}
          <FormatSelect
            title={t('STATS_PAGE.PARSER_SETUP.CURRENCY')}
            value={draft.currency}
            options={Object.values(Currency).map((currency) => {
              const symbol = getCurrencySymbol(currency)
              // The symbol only if it isn't the code (e.g. "CHF")
              const end = symbol === currency ? undefined : symbol

              return {
                value: currency,
                label: currency,
                description: currencyNames.of(currency),
                end,
                buttonLabel: end ? `${currency} ${end}` : currency,
              }
            })}
            onChange={(currency) => onChange({ currency: currency as Currency })}
          />
        </Box>
        <Box component="label" sx={sx.field}>
          {t('STATS_PAGE.PARSER_SETUP.NUMBER_FORMAT')}
          <FormatSelect
            title={t('STATS_PAGE.PARSER_SETUP.NUMBER_FORMAT')}
            value={draft.numberFormat}
            options={Object.entries(NUMBER_FORMAT_LABELS).map(([value, label]) => ({ value, label }))}
            isError={isNumberMismatch}
            onChange={(numberFormat) => onChange({ numberFormat: numberFormat as NumberFormat })}
          />
        </Box>
      </Box>
      {isNumberMismatch ? (
        <Alert severity="error" sx={sx.alert}>
          <strong>{t('STATS_PAGE.PARSER_SETUP.CONNECTOR.NUMBER_MISMATCH')}</strong>{' '}
          {t('STATS_PAGE.PARSER_SETUP.NUMBER_MISMATCH_HINT')}
        </Alert>
      ) : null}
    </Box>
  )
}

export default Component
