import type { TFunction } from 'i18next'

import type { RowData, SetupPreviewResult } from '@/types'
import { SetupStep } from '@/types-enums'
import { isValidPreview } from '@/m-custom-parser/service'

/**
 * In order, each step is reached from the previous one.
 */
export const SETUP_STEPS = Object.values(SetupStep)

/**
 * Why the preview has no transactions, `null` if it has.
 */
export const getPreviewMessageKey = (preview: SetupPreviewResult | null) => {
  if (!preview) {
    return 'STATS_PAGE.PARSER_SETUP.PREVIEW_MISSING'
  }

  if (preview.error) {
    return 'STATS_PAGE.PARSER_SETUP.PREVIEW_INVALID'
  }

  return preview.transactions.length ? null : 'STATS_PAGE.PARSER_SETUP.PREVIEW_EMPTY'
}

/**
 * Transactions shown in the preview, the setup steps are below it.
 */
export const PREVIEW_ROWS = 10

// The row with the column names is near the top
const HEADER_ROW_OPTIONS = 30

/**
 * Indices of the first rows of the file to pick the row with the column names from, a few below the current one.
 */
export const getHeaderRowIndices = (rows: RowData[], headerIndex: number) => {
  return Array.from(
    { length: Math.min(rows.length, Math.max(HEADER_ROW_OPTIONS, headerIndex + 3)) },
    (_, index) => index,
  )
}

/**
 * Rows shown in the CSV tab.
 */
const CSV_ROWS = 20

/**
 * The first rows of the file as is, independent of the row picked as the header.
 */
export const getCsvRows = (rows: RowData[]) => {
  return rows.slice(0, CSV_ROWS)
}

type GetPreviewCaptionProps = {
  preview: SetupPreviewResult | null
  isCsv: boolean
  rows: RowData[]
}

/**
 * Next to the title, the number of transactions or rows.
 */
export const getPreviewCaption = ({ preview, isCsv, rows }: GetPreviewCaptionProps, t: TFunction) => {
  if (isCsv) {
    return t('STATS_PAGE.DATA_VIEW.ROW_COUNT', { count: rows.length })
  }

  return isValidPreview(preview)
    ? t('STATS_PAGE.PARSER_SETUP.PREVIEW_COUNT', { count: preview.transactions.length })
    : undefined
}
