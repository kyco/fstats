import { z } from 'zod'

import { StatsFileStatus, zStatsFileErrorCode } from '@/types-enums'
import { zParserId } from '@/utils/Parser/registry'

import { zDateTimeString, zIdString, zNonEmptyString } from '../global'
import type { _KeysCheck } from '../key-check'
import type { RDZFileWithPath } from '../lib/react-dropzone'
import { zRDZFileWithPath } from '../lib/react-dropzone'
import { zTransaction, zTransactionAtRest } from './transaction'

export type RowData = string[]

const zStatsFileError = z.object({
  code: zStatsFileErrorCode,
  message: z.string(),
})

const zStatsFileMeta = z.object({
  id: zIdString,
  created: zDateTimeString,
  modified: zDateTimeString,
  file: zRDZFileWithPath,
  /**
   * SHA-256 of the file content, used to detect duplicate uploads. `null` for rejected files.
   */
  hash: zNonEmptyString.nullable(),
})

const zStatsFileParsing = z.object({ status: z.literal(StatsFileStatus.PARSING) })
const zStatsFileErrorState = z.object({ status: z.literal(StatsFileStatus.ERROR), error: zStatsFileError })

/**
 * Transactions of one account. Most files have one section, some have one per account (e.g. Giro + Visa).
 */
const makeStatsFileSection = <T extends z.ZodType>(transaction: T) => {
  return z.object({ parserId: zParserId, transactions: z.array(transaction) })
}

export type StatsFileSection = z.infer<ReturnType<typeof makeStatsFileSection<typeof zTransaction>>>

/**
 * The status dependent part of a file, i.e. the result of parsing.
 */
const makeStatsFileState = <T extends z.ZodType>(transaction: T) => {
  return z.discriminatedUnion('status', [
    zStatsFileParsing,
    z.object({
      status: z.literal(StatsFileStatus.PARSED),
      sections: z.array(makeStatsFileSection(transaction)).min(1),
      /**
       * `PARSER_VERSION` at parse time, files parsed with an older version are re-parsed.
       */
      parserVersion: z.number().int(),
    }),
    zStatsFileErrorState,
  ])
}

export const zStatsFileState = makeStatsFileState(zTransaction)

export type StatsFileState = z.infer<typeof zStatsFileState>

export const zStatsFile = z.intersection(zStatsFileMeta, zStatsFileState)

export type StatsFile = z.infer<typeof zStatsFile>

export type ParsedStatsFile = Extract<StatsFile, { status: typeof StatsFileStatus.PARSED }>

export type NewStatsFile = {
  file: RDZFileWithPath
  /**
   * Set if the file was rejected on upload (e.g. wrong type or too large).
   */
  rejection?: string
}

export type StatsFileAtRest = z.infer<typeof zStatsFileMeta> &
  z.infer<ReturnType<typeof makeStatsFileState<typeof zTransactionAtRest>>>

// Safety checks
true satisfies _KeysCheck<StatsFile, StatsFileAtRest>
