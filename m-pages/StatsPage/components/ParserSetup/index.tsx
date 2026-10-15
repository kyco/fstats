'use client'

import { CloseOutlined } from '@mui/icons-material'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import type { CustomParserMapping, StatsFile } from '@/types'
import { getSetupChange, getWorkspaceHref } from '@/common'
import { useFileRows } from '@/m-stats-file/service'
import { useTranslation } from '@/lib/i18n'

import { SavedFormat, SetupSteps } from './components'
import { ui } from './styled'

type ParserSetupProps = {
  /**
   * A file of a detected format, see `isConvertible`.
   */
  file: StatsFile
  /**
   * The saved format, shown with a link to submit it once saved. The file is parsed with it by then.
   */
  savedMapping: CustomParserMapping | null
  onSaved: (mapping: CustomParserMapping) => void
}

/**
 * Middle column view to set up a custom parser for a file of a detected format, one step at a time like an onboarding:
 * the detected transactions are confirmed (or the columns fixed), then the currency and the account name.
 */
const Component = ({ file, savedMapping, onSaved }: ParserSetupProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data, isLoading, error } = useFileRows(file)
  // State rather than a ref, so the tables re-render once the scroll element exists
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null)

  const close = () => router.replace(getWorkspaceHref(searchParams, getSetupChange(null)))

  return (
    <>
      <Box sx={sx.toolbar}>
        <Box component="h2" sx={sx.title} title={file.file.name}>
          {t('STATS_PAGE.PARSER_SETUP.TITLE', { file: file.file.name })}
        </Box>
        <Tooltip title={t('STATS_PAGE.PARSER_SETUP.CLOSE')}>
          <IconButton size="small" onClick={close} aria-label={t('STATS_PAGE.PARSER_SETUP.CLOSE')} sx={sx.closeButton}>
            <CloseOutlined sx={sx.closeIcon} />
          </IconButton>
        </Tooltip>
      </Box>
      <Box ref={setScrollElement} sx={sx.scroll}>
        {savedMapping ? (
          <SavedFormat file={file} mapping={savedMapping} onClose={close} />
        ) : data ? (
          // Files that weren't parsed are read as one section with all rows
          <SetupSteps file={file} rows={data[0]?.rows ?? []} scrollElement={scrollElement} onSaved={onSaved} />
        ) : (
          <Typography variant="body2" color={error ? 'error' : 'text.secondary'}>
            {error
              ? t('STATS_PAGE.DATA_VIEW.FAILED_TO_READ_FILE', { message: error.message })
              : isLoading
                ? t('MISC.LOADING')
                : null}
          </Typography>
        )}
      </Box>
    </>
  )
}

export default Component
