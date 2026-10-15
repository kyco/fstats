import { uniq } from 'lodash'

import type { ParsedStatsFile, StatsFile } from '@/types'
import { Currency, StatsFileErrorCode, StatsFileStatus } from '@/types-enums'
import { MISC } from '@/common'
import type { BankAccountId } from '@/utils/Parser'
import { getBankAccountId, getBankAccountName, getParser, getParserCurrency, PARSER_VERSION } from '@/utils/Parser'

import { getFiles, removeAllFiles, updateFiles } from '../api'
import { parseFiles } from './parse'

export const isParsed = (file: StatsFile): file is ParsedStatsFile => {
  return file.status === StatsFileStatus.PARSED
}

/**
 * Bank and accounts of a parsed file, e.g. Comdirect with Giro and Visa.
 */
export const getFileAccount = (file: ParsedStatsFile) => {
  // Files of deleted custom parsers are re-parsed on start, until then they show their parser ID
  const parsers = uniq(file.sections.map((section) => section.parserId)).map(
    (parserId) => getParser(parserId) ?? { bankName: parserId, accountName: parserId },
  )
  return { bankName: parsers[0].bankName, accountNames: parsers.map((parser) => parser.accountName) }
}

/**
 * Files which are broken, as opposed to `isUnknown()` and `isConvertible()` files which are valid CSVs from an
 * unsupported bank.
 */
export const isError = (file: StatsFile) => {
  return file.status === StatsFileStatus.ERROR && !isUnknown(file) && !isConvertible(file)
}

/**
 * Files that weren't added as CSV (wrong file type or too large), so their content is never read.
 */
export const isRejected = (file: StatsFile): file is Extract<StatsFile, { status: typeof StatsFileStatus.ERROR }> => {
  return file.status === StatsFileStatus.ERROR && file.error.code === StatsFileErrorCode.REJECTED
}

/**
 * Files of an unsupported format that couldn't be detected either.
 */
export const isUnknown = (file: StatsFile) => {
  return file.status === StatsFileStatus.ERROR && file.error.code === StatsFileErrorCode.UNSUPPORTED_FORMAT
}

/**
 * Files of an unsupported format that was detected, so they can be set up as a custom parser (see `ParserSetup`).
 */
export const isConvertible = (file: StatsFile) => {
  return file.status === StatsFileStatus.ERROR && file.error.code === StatsFileErrorCode.CONVERTIBLE_FORMAT
}

export const getFileTransactions = (file: ParsedStatsFile) => {
  return file.sections.flatMap((section) => section.transactions)
}

/**
 * All sections of a file are from the same bank, so they share the currency.
 */
export const getFileCurrency = (file: ParsedStatsFile) => {
  return getParserCurrency(file.sections[0].parserId)
}

type FileBankAccount = {
  bankAccountId: BankAccountId
  label: string
  currency: Currency
  fileIds: string[]
}

/**
 * Bank accounts of the files' sections, with the files they're in, sorted by label.
 */
export const getFileBankAccounts = (files: ParsedStatsFile[]): FileBankAccount[] => {
  const accounts = new Map<BankAccountId, FileBankAccount>()

  files.forEach((file) => {
    file.sections.forEach(({ parserId }) => {
      const bankAccountId = getBankAccountId(parserId)
      const account = accounts.get(bankAccountId) ?? {
        bankAccountId,
        label: getBankAccountName(parserId).alt,
        currency: getParserCurrency(parserId),
        fileIds: [],
      }

      if (!account.fileIds.includes(file.id)) {
        accounts.set(bankAccountId, { ...account, fileIds: [...account.fileIds, file.id] })
      }
    })
  })

  return Array.from(accounts.values()).sort((a, b) => a.label.localeCompare(b.label))
}

const reparseFiles = async (isOutdated: (file: StatsFile) => boolean) => {
  const outdatedFiles = (await getFiles()).filter(isOutdated)

  if (outdatedFiles.length) {
    await updateFiles(await parseFiles(outdatedFiles))
  }
}

/**
 * Re-parses stored files that were parsed with an older parser version (e.g. to update their transaction IDs) or with
 * a parser that no longer exists (a deleted custom parser). Unknown files too, as detection may have improved.
 */
export const reparseOutdatedFiles = async () => {
  await reparseFiles(
    (file) =>
      isUnknown(file) ||
      (isParsed(file) &&
        (file.parserVersion !== PARSER_VERSION || file.sections.some((section) => !getParser(section.parserId)))),
  )
}

/**
 * Re-parses the files of unsupported formats, e.g. after adding a custom parser.
 */
export const reparseUnsupportedFiles = async () => {
  await reparseFiles((file) => isUnknown(file) || isConvertible(file))
}

/**
 * Removes all stored files and the selected file IDs, e.g. at the start of a session when data isn't persisted.
 */
export const clearSessionFiles = async () => {
  await removeAllFiles()
  window.localStorage.removeItem(MISC.LS_SELECTED_FILE_IDS_KEY)
}
