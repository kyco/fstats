'use client'

import { Box, List, Typography } from '@mui/material'
import { useSearchParams } from 'next/navigation'

import { getView, WorkspaceView } from '@/common'
import { useStatsLayout } from '@/hooks'
import { useTranslation } from '@/lib/i18n'

import { useWorkspace, useWorkspaceFiles } from '../../context'
import DateExplorer from '../DateExplorer'
import DateSkeleton from '../DateSkeleton'
import FileRow from '../FileRow'
import FileToolbar from '../FileToolbar'
import ResizeDivider from '../ResizeDivider'
import { resizePanes } from '../ResizeDivider/actions'
import { ui } from './styled'

const Component = () => {
  const sx = ui()
  const { t } = useTranslation()
  const { isDemoMode } = useWorkspace()
  // The date filter doesn't apply to the CSV view, a placeholder is shown instead
  const isCsv = getView(useSearchParams()) === WorkspaceView.CSV
  const { files, checkedFiles, isChecked, toggleFile } = useWorkspaceFiles()
  const { explorerSplit: split, setExplorerSplit: setSplit } = useStatsLayout()

  return (
    <Box sx={sx.explorer}>
      <Box sx={sx.panes}>
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

        <ResizeDivider
          axis="y"
          onResize={(delta) => setSplit(resizePanes({ sizes: [split, 100 - split], index: 0, delta })[0])}
        />

        <Box sx={sx.datesPane(split)}>
          {/* Without checked files, the date explorer says so */}
          {isCsv && checkedFiles.length ? <DateSkeleton title={t('STATS_PAGE.CSV_DISABLED')} /> : <DateExplorer />}
        </Box>
      </Box>
    </Box>
  )
}

export default Component
