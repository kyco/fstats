'use client'

import { Box, Typography } from '@mui/material'

import { DEFAULT_STATS_COLUMN_WIDTHS, DEFAULT_STATS_EXPLORER_SPLIT, StatsLayout, useStatsLayout } from '@/hooks'
import { useTranslation } from '@/lib/i18n'

import SettingsCard from '../SettingsCard'
import { isChanged } from './actions'
import { LayoutPreview } from './components'
import { ui } from './styled'

const Component = () => {
  const sx = ui()
  const { t } = useTranslation()
  const { customColumnWidths, customExplorerSplit, activeLayout, setActiveLayout } = useStatsLayout()
  const isCustomSameAsDefault =
    !isChanged(customExplorerSplit, DEFAULT_STATS_EXPLORER_SPLIT) &&
    customColumnWidths.every((width, index) => !isChanged(width, DEFAULT_STATS_COLUMN_WIDTHS[index]))

  return (
    <SettingsCard title={t('SETTINGS_PAGE.LAYOUT.TITLE')}>
      <Box sx={sx.tiles}>
        <LayoutPreview
          title={t('SETTINGS_PAGE.LAYOUT.DEFAULT')}
          columnWidths={DEFAULT_STATS_COLUMN_WIDTHS}
          explorerSplit={DEFAULT_STATS_EXPLORER_SPLIT}
          isSelected={activeLayout === StatsLayout.DEFAULT || isCustomSameAsDefault}
          onSelect={() => setActiveLayout(StatsLayout.DEFAULT)}
        />
        {isCustomSameAsDefault ? null : (
          <LayoutPreview
            title={t('SETTINGS_PAGE.LAYOUT.CUSTOM')}
            columnWidths={customColumnWidths}
            explorerSplit={customExplorerSplit}
            isSelected={activeLayout === StatsLayout.CUSTOM}
            onSelect={() => setActiveLayout(StatsLayout.CUSTOM)}
            compareTo={{ columnWidths: DEFAULT_STATS_COLUMN_WIDTHS, explorerSplit: DEFAULT_STATS_EXPLORER_SPLIT }}
          />
        )}
      </Box>

      <Typography variant="caption" component="p" color="text.secondary" sx={sx.hint}>
        {t('SETTINGS_PAGE.LAYOUT.HINT')}
      </Typography>
    </SettingsCard>
  )
}

export default Component
