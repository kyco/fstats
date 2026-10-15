'use client'

import { useColorScheme } from '@mui/material/styles'
import type { ReactNode } from 'react'

import { ColorMode } from '@/types-enums'
import { useTranslation } from '@/lib/i18n'

import OptionSwitcher from '../OptionSwitcher'
import type { OptionSwitcherTriggerProps } from '../OptionSwitcher'
import { getActiveIcon, getActiveLabel, MODES } from './actions'

type ThemeSwitcherProps = {
  renderTrigger?: (props: OptionSwitcherTriggerProps) => ReactNode
}

const Component = ({ renderTrigger }: ThemeSwitcherProps) => {
  const { t } = useTranslation()
  const { mode, setMode } = useColorScheme()

  const onSelect = (value: ColorMode) => {
    setMode(value)
  }

  return (
    <OptionSwitcher
      title={t('COMPONENTS.THEME_SWITCHER.CHOOSE_THEME')}
      icon={getActiveIcon(mode, 'secondary')}
      label={getActiveLabel(mode)}
      renderTrigger={renderTrigger}
      listSx={{ pt: 0 }}
      options={MODES.map((value) => ({
        value,
        primary: t(`COMPONENTS.THEME_SWITCHER.THEME_${value.toUpperCase()}`),
        checked: mode === value,
      }))}
      onSelect={onSelect}
    />
  )
}

export default Component
