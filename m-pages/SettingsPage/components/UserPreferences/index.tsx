'use client'

import { Box } from '@mui/material'

import { ThemeSwitcher } from '@/components'
import { useTranslation } from '@/lib/i18n'

import DateFormatSwitcher from '../DateFormatSwitcher'
import LanguageSwitcher from '../LanguageSwitcher'
import SettingsCard from '../SettingsCard'
import { PreferenceTile } from './components'
import { ui } from './styled'

const Component = () => {
  const sx = ui()
  const { t } = useTranslation()

  return (
    <SettingsCard title={t('SETTINGS_PAGE.PREFERENCES.TITLE')}>
      <Box sx={sx.tiles}>
        <ThemeSwitcher
          renderTrigger={(props) => <PreferenceTile title={t('COMPONENTS.THEME_SWITCHER.THEME')} {...props} />}
        />
        <LanguageSwitcher
          renderTrigger={(props) => <PreferenceTile title={t('SETTINGS_PAGE.LANGUAGE_SWITCHER.LANGUAGE')} {...props} />}
        />
        <DateFormatSwitcher
          renderTrigger={(props) => <PreferenceTile title={t('SETTINGS_PAGE.DATE_FORMAT_SWITCHER.TITLE')} {...props} />}
        />
      </Box>
    </SettingsCard>
  )
}

export default Component
