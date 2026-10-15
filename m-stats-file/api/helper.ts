import type { StatsFile, StatsFileAtRest } from '@/types'
import { zStatsFile } from '@/types'
import { Currency, StatsFileStatus } from '@/types-enums'
import { sha256 } from '@/utils/Hash'
import { parseOrThrow } from '@/lib/zod'

export const syncStatsFile = (dataToSync: StatsFile): StatsFileAtRest => {
  return parseOrThrow({ schema: zStatsFile, data: dataToSync, label: 'Cannot sync StatsFile' })
}

export const parseStatsFile = (dataToParse: StatsFileAtRest): StatsFile => {
  if (dataToParse.status !== StatsFileStatus.PARSED) {
    return dataToParse
  }

  return {
    ...dataToParse,
    sections: dataToParse.sections.map((section) => ({
      ...section,
      transactions: section.transactions.map((row) => ({
        ...row,
        currency: row.currency as Currency,
      })),
    })),
  }
}

export const getFileHash = async (file: Blob): Promise<string> => {
  return sha256(await file.arrayBuffer())
}
