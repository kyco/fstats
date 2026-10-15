'use client'

import { InfoOutlined } from '@mui/icons-material'
import { Box, FormControlLabel, Switch, Typography } from '@mui/material'
import type { ChangeEvent } from 'react'

import { useUserPreferences } from '@/m-user/service'
import { useIsMobile } from '@/hooks'
import { useTranslation } from '@/lib/i18n'

import SettingsCard from '../SettingsCard'
import { ui } from './styled'

const Component = () => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const sx = ui(isMobile)
  const { persistData, setPersistData } = useUserPreferences()

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPersistData(event.target.checked)
  }

  return (
    <SettingsCard title={t('SETTINGS_PAGE.DEVICE.TITLE')}>
      <Box sx={sx.switch}>
        <FormControlLabel
          control={<Switch checked={persistData} onChange={onChange} />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0 }}>
                {t('SETTINGS_PAGE.DEVICE.PERSIST_DATA')}
              </Typography>
            </Box>
          }
        />
      </Box>

      <Box sx={sx.info}>
        <InfoOutlined color={persistData ? 'warning' : 'secondary'} sx={{ fontSize: 16 }} />
        <Typography variant="caption" color={persistData ? 'warning' : 'text.secondary'}>
          {persistData ? t('SETTINGS_PAGE.DEVICE.PERSIST_ON') : t('SETTINGS_PAGE.DEVICE.PERSIST_OFF')}
        </Typography>
      </Box>
    </SettingsCard>
  )
}

export default Component
