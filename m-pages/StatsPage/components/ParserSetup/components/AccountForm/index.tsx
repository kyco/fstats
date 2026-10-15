'use client'

import { Box, TextField } from '@mui/material'

import type { SetupDraft } from '@/types'
import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type AccountFormProps = {
  draft: SetupDraft
  onChange: (changes: Partial<SetupDraft>) => void
}

/**
 * Names of the bank and account the files are shown with.
 */
const Component = ({ draft, onChange }: AccountFormProps) => {
  const sx = ui()
  const { t } = useTranslation()

  return (
    <Box sx={sx.fields}>
      <TextField
        size="small"
        label={t('STATS_PAGE.PARSER_SETUP.BANK_NAME')}
        placeholder={t('STATS_PAGE.PARSER_SETUP.BANK_NAME_PLACEHOLDER')}
        value={draft.bankName}
        onChange={(event) => onChange({ bankName: event.target.value })}
        required
        autoFocus
      />
      <TextField
        size="small"
        label={t('STATS_PAGE.PARSER_SETUP.ACCOUNT_NAME')}
        placeholder={t('STATS_PAGE.PARSER_SETUP.ACCOUNT_NAME_PLACEHOLDER')}
        value={draft.accountName}
        onChange={(event) => onChange({ accountName: event.target.value })}
        required
      />
    </Box>
  )
}

export default Component
