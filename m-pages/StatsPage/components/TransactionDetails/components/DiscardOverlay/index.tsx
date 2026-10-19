'use client'

import { Box, Button, Typography } from '@mui/material'
import { useEffect, useRef } from 'react'

import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type DiscardOverlayProps = {
  onContinue: () => void
  onDiscard: () => void
}

/**
 * Covers the transaction details, asking whether to discard the open category form, e.g. after clicking another row.
 * Clicking outside the card continues editing.
 */
const Component = ({ onContinue, onDiscard }: DiscardOverlayProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const cardRef = useRef<HTMLDivElement>(null)

  // Into view, the sidebar may be scrolled down
  useEffect(() => {
    cardRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [])

  return (
    <Box sx={sx.overlay} onClick={onContinue}>
      <Box
        ref={cardRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="discard-title"
        onClick={(event) => event.stopPropagation()}
        sx={sx.card}
      >
        <Typography id="discard-title" sx={sx.title}>
          {t('STATS_PAGE.CATEGORY_RULES.DISCARD_TITLE')}
        </Typography>
        <Typography sx={sx.text}>{t('STATS_PAGE.CATEGORY_RULES.DISCARD_TEXT')}</Typography>
        <Box sx={sx.actions}>
          <Button size="small" color="inherit" onClick={onContinue} autoFocus>
            {t('STATS_PAGE.CATEGORY_RULES.CONTINUE_EDITING')}
          </Button>
          <Button size="small" variant="contained" color="error" disableElevation onClick={onDiscard}>
            {t('STATS_PAGE.CATEGORY_RULES.DISCARD_CHANGES')}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default Component
