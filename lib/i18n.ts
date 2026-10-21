'use client'

import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next, Trans, useTranslation } from 'react-i18next'

import { UserLocale } from '@/types-enums'
import { MISC } from '@/common'
import deCategories from '@/public/locales/categories/de.json'
import enCategories from '@/public/locales/categories/en.json'
import de from '@/public/locales/de.json'
import en from '@/public/locales/en.json'
import deHints from '@/public/locales/hints/de.json'
import enHints from '@/public/locales/hints/en.json'

const resources = {
  [UserLocale.EN]: { translation: en, categories: enCategories, hints: enHints },
  [UserLocale.DE]: { translation: de, categories: deCategories, hints: deHints },
} as const

i18n
  .use(initReactI18next)
  .use(
    new LanguageDetector(null, {
      lookupLocalStorage: MISC.LS_I18N_LOCALE_KEY,
      // e.g. `de-AT` -> `de`
      convertDetectedLanguage: (lng) => lng.split('-')[0],
    }),
  )
  .init({
    resources,
    supportedLngs: Object.values(UserLocale),
    fallbackLng: MISC.DEFAULT_LOCALE,
    detection: {
      // A selected language (localStorage) takes precedence over the browser language
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  })

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng
  }
})

if (typeof document !== 'undefined' && i18n.resolvedLanguage) {
  document.documentElement.lang = i18n.resolvedLanguage
}

export { Trans, useTranslation, i18n }
