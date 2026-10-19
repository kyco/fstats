'use client'

import { Box } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { Fragment, useMemo, useState } from 'react'

import type { CustomParserMapping } from '@/types'
import { getEndDemoHref, getSetupFileId, getView, isDemo, WorkspaceView } from '@/common'
import { PageWrapper } from '@/components'
import { isConvertible } from '@/m-stats-file/service'
import { getCheckedTransactions, getStatsTransactions } from '@/m-transaction/service'
import { useStatsLayout } from '@/hooks'

import {
  CategoryEditorMenu,
  DataView,
  DemoBanner,
  DropOverlay,
  FileExplorer,
  FileSidebar,
  ParserSetup,
  ProfitLossView,
  ResizeDivider,
  StatsView,
} from './components'
import { resizePanes } from './components/ResizeDivider/actions'
import { WorkspaceContext } from './context'
import { useDayFilter, useDemoState, useFileDropzone, useFileHelper, useSelectedTransaction } from './hooks'
import { ui } from './styled'

/**
 * Workspace of the stats page: file explorer, the transactions, stats, breakdown or CSV view (`view` param) in the middle column, and the file
 * summary. Setting up an unsupported file (`setup` param) replaces the view.
 */
const Component = () => {
  const sx = ui()
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = getView(searchParams)
  const isDemoMode = isDemo(searchParams)
  const files = useFileHelper({ isDemoMode })
  // Only while the file isn't set up yet, it's parsed once it is. Kept once saved, to show the saved format.
  const setupFileId = getSetupFileId(searchParams)
  const [savedSetup, setSavedSetup] = useState<{ fileId: string; mapping: CustomParserMapping } | null>(null)
  const savedMapping = savedSetup?.fileId === setupFileId ? savedSetup.mapping : null
  const setupFile = files.files.find((file) => file.id === setupFileId && (isConvertible(file) || !!savedMapping))
  const dayFilter = useDayFilter({ isDemoMode, isDisabled: view === WorkspaceView.CSV })
  // Once for all components, the part only depending on the files is kept when (de)selecting days
  const checkedTransactions = useMemo(() => getCheckedTransactions(files.selectedFiles), [files.selectedFiles])
  const stats = useMemo(
    () => getStatsTransactions(checkedTransactions, dayFilter.deselectedDays),
    [checkedTransactions, dayFilter.deselectedDays],
  )
  const demoState = useDemoState(isDemoMode)
  // Selected in the transactions table
  const selectedTransaction = useSelectedTransaction({ isEnabled: !setupFile && view === WorkspaceView.TRANSACTIONS })
  // Of the transactions and CSV views, here so it's kept when switching to other views and back
  const [searchValue, setSearchValue] = useState('')
  const { columnWidths: widths, setColumnWidths: setWidths } = useStatsLayout()
  // Leave demo mode once real files are added, so they are shown
  const { dropzone, addFolder } = useFileDropzone({
    onAdded: isDemoMode ? () => router.replace(getEndDemoHref(searchParams)) : undefined,
  })

  if (files.isLoadingFiles) {
    return <PageWrapper />
  }

  const columns: {
    id: string
    content: ReactNode
  }[] = [
    {
      id: 'left',
      content: <FileExplorer />,
    },
    {
      id: 'middle',
      content: setupFile ? (
        <ParserSetup
          key={setupFile.id}
          file={setupFile}
          savedMapping={savedMapping}
          onSaved={(mapping) => setSavedSetup({ fileId: setupFile.id, mapping })}
        />
      ) : view === WorkspaceView.STATS ? (
        <StatsView />
      ) : view === WorkspaceView.BREAKDOWN ? (
        <ProfitLossView />
      ) : (
        <DataView />
      ),
    },
    {
      id: 'right',
      content: <FileSidebar />,
    },
  ]

  return (
    <WorkspaceContext.Provider
      value={{
        isDemoMode,
        onAddFiles: dropzone.open,
        onAddFolder: addFolder,
        dayFilter,
        demoState,
        files,
        stats,
        selectedTransaction,
        search: { value: searchValue, setValue: setSearchValue },
      }}
    >
      <Box {...dropzone.getRootProps()} sx={sx.dropzone}>
        <input {...dropzone.getInputProps()} />
        {/* Above all columns, all of them show demo data in demo mode */}
        {isDemoMode ? <DemoBanner /> : null}
        <Box sx={sx.container}>
          {columns.map((column, index) => (
            <Fragment key={column.id}>
              {index > 0 ? (
                <ResizeDivider
                  axis="x"
                  onResize={(delta) => setWidths(resizePanes({ sizes: widths, index: index - 1, delta }))}
                />
              ) : null}
              <Box sx={{ ...sx.column, flexBasis: `${widths[index]}%` }}>{column.content}</Box>
            </Fragment>
          ))}
        </Box>
        {dropzone.isDragActive ? <DropOverlay /> : null}
        <CategoryEditorMenu />
      </Box>
    </WorkspaceContext.Provider>
  )
}

export default Component
