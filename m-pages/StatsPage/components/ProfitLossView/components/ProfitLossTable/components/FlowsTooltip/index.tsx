'use client'

import { Close } from '@mui/icons-material'
import { Box, ButtonBase, ClickAwayListener, IconButton, Tooltip } from '@mui/material'
import { useState } from 'react'

import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type FlowsTooltipProps = {
  title: string
  /**
   * Formatted, without signs.
   */
  incoming: string
  outgoing: string
  /**
   * Formatted as in the cell, with its color.
   */
  net: string
  netColor?: string
}

/**
 * Amount of a cell with incoming and outgoing transactions, showing both on click in a tooltip like the chart tooltips.
 */
const Component = ({ title, incoming, outgoing, net, netColor }: FlowsTooltipProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <Tooltip
        open={isOpen}
        disableHoverListener
        disableFocusListener
        disableTouchListener
        placement="bottom-end"
        slotProps={{ tooltip: { sx: sx.tooltip } }}
        title={
          <>
            <Box sx={sx.header}>
              <Box sx={sx.title}>{title}</Box>
              <IconButton
                size="small"
                aria-label={t('STATS_PAGE.PROFIT_LOSS.FLOWS.CLOSE')}
                onClick={() => setIsOpen(false)}
                sx={sx.close}
              >
                <Close fontSize="inherit" />
              </IconButton>
            </Box>
            <Box sx={sx.grid}>
              <Box sx={sx.label}>{t('STATS_PAGE.PROFIT_LOSS.FLOWS.IN')}</Box>
              <Box sx={sx.value}>{incoming}</Box>
              <Box sx={sx.label}>{t('STATS_PAGE.PROFIT_LOSS.FLOWS.OUT')}</Box>
              <Box sx={sx.value}>{outgoing}</Box>
              <Box sx={sx.divider} />
              <Box sx={sx.label}>{t('STATS_PAGE.PROFIT_LOSS.FLOWS.NET')}</Box>
              <Box sx={{ ...sx.value, color: netColor }}>{net}</Box>
            </Box>
          </>
        }
      >
        <ButtonBase
          disableRipple
          aria-label={t('STATS_PAGE.PROFIT_LOSS.FLOWS.HINT')}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          sx={sx.amount}
        >
          {net}
        </ButtonBase>
      </Tooltip>
    </ClickAwayListener>
  )
}

export default Component
