import { parse } from 'papaparse'

import type { RowData, StatsFile, StatsFileSection, StatsFileState } from '@/types'
import { zStatsFileState } from '@/types'
import { StatsFileErrorCode, StatsFileStatus } from '@/types-enums'
import { canConvert, findSections, PARSER_VERSION } from '@/utils/Parser'
import { formatZodIssues } from '@/lib/zod'

export const parseFiles = async (files: StatsFile[]): Promise<{ id: string; state: StatsFileState }[]> => {
  return Promise.all(files.map(async (file) => ({ id: file.id, state: await parseFile(file.file) })))
}

const parseFile = async (file: File): Promise<StatsFileState> => {
  let rows: RowData[]
  try {
    rows = await readCsvRows(file)
  } catch (err) {
    return _toError(StatsFileErrorCode.UNREADABLE, `Reading CSV failed: ${getErrorMessage(err)}`)
  }

  const { sections, error } = findSections(rows)
  if (!sections.length) {
    const code = canConvert(rows) ? StatsFileErrorCode.CONVERTIBLE_FORMAT : StatsFileErrorCode.UNSUPPORTED_FORMAT
    return _toError(code, error)
  }

  const parsedSections: StatsFileSection[] = []
  for (const { parser, rows: sectionRows } of sections) {
    try {
      parsedSections.push({ parserId: parser.id, transactions: parser.parse(sectionRows) })
    } catch (err) {
      console.error(`Parsing failed with ${parser.id}:`, getErrorMessage(err))
      return _toError(StatsFileErrorCode.INVALID_DATA, `Parsing "${parser.id}" failed: ${getErrorMessage(err)}`)
    }
  }

  // Validate so consumers are working with valid data
  const res = zStatsFileState.safeParse({
    status: StatsFileStatus.PARSED,
    sections: parsedSections,
    parserVersion: PARSER_VERSION,
  })

  if (!res.success) {
    const parserIds = parsedSections.map((section) => section.parserId).join(', ')
    const errors = formatZodIssues(res.error)
    console.error(`Validation failed for parser "${parserIds}":`, errors)
    return _toError(StatsFileErrorCode.INVALID_DATA, `Validating "${parserIds}" failed: ${errors}`)
  }

  return res.data
}

const _toError = (code: StatsFileErrorCode, message: string): StatsFileState => {
  return { status: StatsFileStatus.ERROR, error: { code, message } }
}

// Many bank exports (e.g. ING) are Windows-1252, so fall back when the file isn't valid UTF-8
const readFileText = async (file: Blob): Promise<string> => {
  const buffer = await file.arrayBuffer()

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch {
    return new TextDecoder('windows-1252').decode(buffer)
  }
}

export const readCsvRows = async (file: Blob): Promise<RowData[]> => {
  const text = await readFileText(file)

  return new Promise((resolve, reject) => {
    parse<RowData>(text, {
      header: false,
      skipEmptyLines: 'greedy',
      worker: true,
      complete: (results) => {
        resolve(results.data)
      },
      error: (err: Error) => {
        reject(err)
      },
    })
  })
}

const getErrorMessage = (err: unknown) => {
  return err instanceof Error ? err.message : String(err)
}
