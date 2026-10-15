'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import type { NewStatsFile, RowData, StatsFile, StatsFileState } from '@/types'
import type { FileRows } from '@/utils/Parser'
import { extractFileRows } from '@/utils/Parser'

import { addFiles, getFiles, getStorageSize, removeAllFiles, removeFiles, updateFiles } from '../api'
import { isParsed, isRejected } from './helper'
import { statsFileKey } from './keys'
import { readCsvRows } from './parse'

/**
 * Header and transaction rows of a file as is, one entry per section. Files that weren't parsed have no known header,
 * so all rows are returned. Rejected files aren't CSVs, so they aren't read.
 */
export const useFileRows = (file: StatsFile) => {
  const parsed = isParsed(file)

  // Stable `select`, otherwise it re-runs (scanning the whole file) on every render
  const select = useCallback(
    (rows: RowData[]): FileRows[] => (parsed ? extractFileRows(rows) : [{ accountName: null, header: null, rows }]),
    [parsed],
  )

  return useQuery({
    queryKey: statsFileKey.rows(file.id),
    queryFn: () => {
      return readCsvRows(file.file)
    },
    select,
    enabled: !isRejected(file),
  })
}

export const useFiles = () => {
  return useQuery({
    queryKey: statsFileKey.all,
    queryFn: () => {
      return getFiles()
    },
  })
}

export const useStorageSize = () => {
  return useQuery({
    queryKey: statsFileKey.storageSize,
    queryFn: () => {
      return getStorageSize()
    },
    // Invalidated while the settings page isn't shown (e.g. files added), refetched once it is
    refetchOnMount: true,
    retry: false,
  })
}

export const useMutateAddFiles = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (files: NewStatsFile[]) => {
      return addFiles(files)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statsFileKey.all })
    },
  })
}

export const useMutateUpdateFiles = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (filesToUpdate: { id: string; state: StatsFileState }[]) => {
      return updateFiles(filesToUpdate)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statsFileKey.all })
    },
  })
}

export const useMutateRemoveFiles = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => {
      return removeFiles(ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statsFileKey.all })
    },
  })
}

export const useMutateRemoveAllFiles = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => {
      return removeAllFiles()
    },
    onSuccess: () => {
      queryClient.setQueryData(statsFileKey.all, [])
      queryClient.setQueryData(statsFileKey.storageSize, 0)
    },
  })
}
