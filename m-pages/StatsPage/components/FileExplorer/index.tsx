'use client'

import { Box, List, Typography } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { useRef } from 'react'

import { getView, WorkspaceView } from '@/common'
import { useResizeHandle, useStatsLayout } from '@/hooks'
import { useTranslation } from '@/lib/i18n'

import { useWorkspace, useWorkspaceFiles } from '../../context'
import DateExplorer from '../DateExplorer'
import DateSkeleton from '../DateSkeleton'
import FileRow from '../FileRow'
import FileToolbar from '../FileToolbar'
import { clampSplit } from './actions'
import { ui } from './styled'

const Component = () => {
  const sx = ui()
  const { t } = useTranslation()
  const { isDemoMode } = useWorkspace()
  // The date filter doesn't apply to the CSV view, a placeholder is shown instead
  const isCsv = getView(useSearchParams()) === WorkspaceView.CSV
  const { files, checkedFiles, isChecked, toggleFile } = useWorkspaceFiles()
  const panesRef = useRef<HTMLDivElement>(null)
  const { explorerSplit: split, setExplorerSplit: setSplit } = useStatsLayout()
  const startResize = useResizeHandle(panesRef, 'y')

  return (
    <Box sx={sx.explorer}>
      <Box ref={panesRef} sx={sx.panes}>
        <Box sx={sx.filesPane(split)}>
          <FileToolbar />
          <List disablePadding>
            {files.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                isChecked={isChecked(file.id)}
                onToggle={toggleFile}
                disabled={isDemoMode}
              />
            ))}
          </List>
          {files.length ? (
            <Typography variant="caption" color="text.secondary" sx={sx.dropTip}>
              {t('STATS_PAGE.DROP_ZONE.DROP_TIP')}
            </Typography>
          ) : null}
        </Box>

        <Box sx={sx.splitDivider} onPointerDown={startResize((delta) => setSplit(clampSplit(split + delta)))} />

        <Box sx={sx.datesPane(split)}>
          {/* Without checked files, the date explorer says so */}
          {isCsv && checkedFiles.length ? <DateSkeleton title={t('STATS_PAGE.CSV_DISABLED')} /> : <DateExplorer />}
        </Box>
      </Box>
    </Box>
  )
}

export default Component
