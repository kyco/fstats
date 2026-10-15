'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import type { FileRejection } from 'react-dropzone'

import type { NewStatsFile, RDZFileWithPath } from '@/types'
import { StatsFileStatus } from '@/types-enums'
import { MISC } from '@/common'
import { isParsed, parseFiles, useMutateAddFiles, useMutateUpdateFiles } from '@/m-stats-file/service'

import { openFolderPicker, setInputFiles } from '../actions'
import { useFileHelper } from './useFileHelper'

type UseFileDropzoneProps = {
  onAdded?: () => void
}

/**
 * Dropzone that adds, parses and selects the dropped files, and a folder picker that goes through the same flow.
 */
export const useFileDropzone = ({ onAdded }: UseFileDropzoneProps = {}) => {
  const { mutateAsync: addFiles } = useMutateAddFiles()
  const { mutateAsync: updateFiles } = useMutateUpdateFiles()
  const { setSelectedFileIds } = useFileHelper()

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const newFiles: NewStatsFile[] = [
        ...acceptedFiles.map((file) => ({ file: file as RDZFileWithPath })),
        ...fileRejections.map(({ file, errors }) => ({ file, rejection: errors.map((e) => e.message).join(', ') })),
      ]

      const addedFiles = await addFiles(newFiles)
      const parseResults = await parseFiles(addedFiles.filter((file) => file.status === StatsFileStatus.PARSING))
      const updatedFiles = await updateFiles(parseResults)
      setSelectedFileIds((prev) => [...prev, ...updatedFiles.filter(isParsed).map((file) => file.id)])
      onAdded?.()
    },
    [addFiles, updateFiles, setSelectedFileIds, onAdded],
  )

  const dropzone = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxSize: MISC.MAX_UPLOAD_FILE_SIZE,
    multiple: true,
    noClick: true,
    noKeyboard: true,
  })

  // Run picked folders through the dropzone input, so they are validated like dropped files
  const addFolder = async () => {
    const pickedFiles = await openFolderPicker()

    if (pickedFiles && dropzone.inputRef.current) {
      setInputFiles(dropzone.inputRef.current, pickedFiles)
    }
  }

  return { dropzone, addFolder }
}
