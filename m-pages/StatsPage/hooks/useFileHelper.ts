'use client'

import { useMemo } from 'react'
import { useLocalStorage } from 'usehooks-ts'

import type { FileHelper, StatsFile } from '@/types'
import { MISC } from '@/common'
import { categoriseFiles, useCategoryEngine } from '@/m-category/service'
import { DEMO_FILE_ID, getDemoFile, isParsed, useFiles } from '@/m-stats-file/service'

const NO_FILES: StatsFile[] = []

type UseFileHelperProps = {
  isDemoMode?: boolean
}

/**
 * The user's files and which of them are checked, with the categories of their transactions resolved (see
 * `categoriseFiles`). In demo mode only the demo file, always checked and read-only.
 */
export const useFileHelper = ({ isDemoMode = false }: UseFileHelperProps = {}): FileHelper => {
  const [storedSelectedFileIds, setStoredSelectedFileIds] = useLocalStorage<string[]>(MISC.LS_SELECTED_FILE_IDS_KEY, [])
  const { data: storedFiles = NO_FILES, isLoading: isLoadingStoredFiles } = useFiles()
  const { engine, isLoading: isLoadingCategories } = useCategoryEngine({ isDemoMode })
  const isLoadingFiles = isLoadingStoredFiles || isLoadingCategories
  const files: StatsFile[] = useMemo(
    () => categoriseFiles(isDemoMode ? [getDemoFile()] : storedFiles, engine),
    [isDemoMode, storedFiles, engine],
  )
  const selectedFileIds = useMemo(
    () => (isDemoMode ? [DEMO_FILE_ID] : storedSelectedFileIds),
    [isDemoMode, storedSelectedFileIds],
  )
  const setSelectedFileIds: typeof setStoredSelectedFileIds = isDemoMode ? () => {} : setStoredSelectedFileIds

  // Derived from `files`, so IDs of removed files are ignored. Memoized, so the views' memoized values depending on them
  // aren't recomputed on every render.
  const { checkedFiles, checkedIds, selectedFiles } = useMemo(() => {
    const checkedFiles = files.filter((file) => selectedFileIds.includes(file.id))
    return {
      checkedFiles,
      checkedIds: checkedFiles.map((file) => file.id),
      selectedFiles: checkedFiles.filter(isParsed),
    }
  }, [files, selectedFileIds])
  const isAllChecked = files.length > 0 && checkedIds.length === files.length

  const isChecked = (fileId: string) => selectedFileIds.includes(fileId)

  const toggleFile = (fileId: string) => {
    setSelectedFileIds((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  // Checks all files, or none if some are checked
  const toggleAll = () => {
    setSelectedFileIds(checkedIds.length ? [] : files.map((file) => file.id))
  }

  return {
    files,
    categoryEngine: engine,
    isLoadingFiles,
    checkedFiles,
    checkedIds,
    selectedFiles,
    isAllChecked,
    isChecked,
    toggleFile,
    toggleAll,
    setSelectedFileIds,
  }
}
