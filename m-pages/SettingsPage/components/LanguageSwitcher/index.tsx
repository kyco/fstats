'use client'

import { Translate } from '@mui/icons-material'
import type { ReactNode } from 'react'

import { UserLocale } from '@/types-enums'
import type { OptionSwitcherTriggerProps } from '@/components'
import { OptionSwitcher } from '@/components'
import { useUserPreferences } from '@/m-user/service'
import { useTranslation } from '@/lib/i18n'

import { LOCALES } from './actions'

type LanguageSwitcherProps = {
  renderTrigger?: (props: OptionSwitcherTriggerProps) => ReactNode
}

const Component = ({ renderTrigger }: LanguageSwitcherProps) => {
  const { t, i18n } = useTranslation()
  const { setLocale } = useUserPreferences()
  const language = LOCALES.find((locale) => locale === i18n.language) ?? UserLocale.EN
  // E.g. "German" in English
  const getLanguageName = (locale: UserLocale, inLocale: UserLocale) => {
    return t(`SETTINGS_PAGE.LANGUAGE_SWITCHER.LOCALE_${locale.toUpperCase()}_LANGUAGE_${inLocale.toUpperCase()}`)
  }

  const onSelect = (locale: UserLocale) => {
    i18n.changeLanguage(locale)
    setLocale(locale)
  }

  return (
    <OptionSwitcher
      title={t('SETTINGS_PAGE.LANGUAGE_SWITCHER.CHANGE_LANGUAGE')}
      icon={<Translate color="secondary" sx={{ fontSize: 18 }} />}
      label={getLanguageName(language, language)}
      renderTrigger={renderTrigger}
      listSx={{ pt: 0 }}
      options={LOCALES.map((locale) => ({
        value: locale,
        primary: getLanguageName(locale, locale),
        secondary: locale !== language ? getLanguageName(locale, language) : '',
        checked: locale === language,
      }))}
      onSelect={onSelect}
    />
  )
}

export default Component
