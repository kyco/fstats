'use client'

import { useMemo } from 'react'

import type { StatsFile } from '@/types'
import { isRejected, useFileRows } from '@/m-stats-file/service'
import { useTranslation } from '@/lib/i18n'

import FileMessage from '../FileMessage'
import PreviewSection from '../PreviewSection'
import VirtualTable from '../VirtualTable'
import { filterBySearch, toSearchText } from '../VirtualTable/actions'
import { getColumnCount, getMinColumnWidth } from './actions'

type CsvPreviewProps = {
  file: StatsFile
  scrollElement: HTMLElement | null
  /**
   * Only rows containing the query are shown, see `toSearchQuery`.
   */
  search: string
}

const Component = ({ file, scrollElement, search }: CsvPreviewProps) => {
  const { t } = useTranslation()
  const { data, isLoading, error } = useFileRows(file)
  // Computed once per file, so searching only compares strings
  const searchTexts = useMemo(() => data?.map(({ rows }) => rows.map(toSearchText)), [data])
  const shownRows = useMemo(
    () =>
      data?.map(({ rows }, index) => filterBySearch({ rows, searchTexts: searchTexts?.[index] ?? [], query: search })),
    [data, searchTexts, search],
  )

  // Not a CSV, so only the reason is shown
  if (isRejected(file)) {
    return (
      <PreviewSection title={file.file.name} file={file}>
        <FileMessage file={file} message={t('STATS_PAGE.DATA_VIEW.FILE_NOT_READ', { message: file.error.message })} />
      </PreviewSection>
    )
  }

  if (!data) {
    return (
      <PreviewSection
        title={file.file.name}
        file={file}
        isLoading={isLoading}
        error={error ? t('STATS_PAGE.DATA_VIEW.FAILED_TO_READ_FILE', { message: error.message }) : null}
      />
    )
  }

  // One table per section (e.g. Giro + Visa), as their columns differ
  return (
    <>
      {data.map(({ accountName, header, rows }, index) => {
        const columnCount = getColumnCount(header, rows)
        const sectionRows = shownRows?.[index] ?? rows

        // Only sections with matches are shown, see `NoSearchResultsDisplay`
        if (!sectionRows.length && search) {
          return null
        }

        return (
          <PreviewSection
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            title={data.length > 1 && accountName ? `${file.file.name} (${accountName})` : file.file.name}
            file={file}
            caption={
              search
                ? t('STATS_PAGE.DATA_VIEW.SEARCH_MATCHES', { count: sectionRows.length })
                : t('STATS_PAGE.DATA_VIEW.ROW_COUNT', { count: rows.length })
            }
          >
            <VirtualTable
              columns={header?.map((label) => ({ label })) ?? null}
              columnCount={columnCount}
              minColumnWidth={getMinColumnWidth(columnCount)}
              rowCount={sectionRows.length}
              getCells={(rowIndex) => sectionRows[rowIndex]}
              highlight={search}
              scrollElement={scrollElement}
            />
          </PreviewSection>
        )
      })}
    </>
  )
}

export default Component
