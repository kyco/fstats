'use client'

import { Close, Search } from '@mui/icons-material'
import { IconButton, InputBase } from '@mui/material'

import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

/**
 * Search of the table rows in the toolbar. Escape clears it.
 */
const Component = ({ value, onChange, disabled = false }: SearchFieldProps) => {
  const sx = ui()
  const { t } = useTranslation()

  return (
    <InputBase
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onChange('')
        }
      }}
      disabled={disabled}
      placeholder={t('MISC.SEARCH')}
      inputProps={{ 'aria-label': t('MISC.SEARCH') }}
      startAdornment={<Search sx={sx.icon} />}
      endAdornment={
        value ? (
          <IconButton size="small" onClick={() => onChange('')} aria-label={t('MISC.CLEAR_SEARCH')} sx={sx.clear}>
            <Close sx={sx.icon} />
          </IconButton>
        ) : null
      }
      sx={sx.field}
    />
  )
}

export default Component
