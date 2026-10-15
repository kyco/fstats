'use client'

import { CheckCircleOutlined, GitHub } from '@mui/icons-material'
import { Button } from '@mui/material'

import type { CustomParserMapping, StatsFile } from '@/types'
import { EmptyDisplay } from '@/components'
import { getFormatIssueHref } from '@/m-custom-parser/service'
import { Trans, useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type SavedFormatProps = {
  file: StatsFile
  mapping: CustomParserMapping
  onClose: () => void
}

/**
 * Shown once the format is saved, offers to submit it on GitHub (prefilled issue the user reviews and submits).
 */
const Component = ({ file, mapping, onClose }: SavedFormatProps) => {
  const sx = ui()
  const { t } = useTranslation()

  return (
    <EmptyDisplay
      icon={CheckCircleOutlined}
      title={t('STATS_PAGE.PARSER_SETUP.SAVED_TITLE')}
      subtitle={
        <Trans
          i18nKey="STATS_PAGE.PARSER_SETUP.SAVED_SUBTITLE"
          values={{ file: file.file.name }}
          components={{ file: <Button size="large" onClick={onClose} sx={sx.savedFile} /> }}
        />
      }
      actions={
        <Button
          variant="contained"
          startIcon={<GitHub />}
          href={getFormatIssueHref(mapping)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('STATS_PAGE.PARSER_SETUP.SUBMIT_FORMAT')}
        </Button>
      }
    />
  )
}

export default Component
