import type { BankAccountOption, StatsFile } from '@/types'
import { getFileBankAccounts, isParsed } from '@/m-stats-file/service'

/**
 * One option per bank account of the parsed files, sorted by label.
 */
export const getBankAccountOptions = (files: StatsFile[]): BankAccountOption[] => {
  return getFileBankAccounts(files.filter(isParsed)).map(({ bankAccountId, label, fileIds }) => ({
    value: bankAccountId,
    label,
    fileIds,
  }))
}

/**
 * Checks the files of a bank account, or unchecks them if they're all checked already. Keeps the other checked files.
 */
export const toggleFileIds = (fileIds: string[], checkedIds: string[]) => {
  return fileIds.every((id) => checkedIds.includes(id))
    ? checkedIds.filter((id) => !fileIds.includes(id))
    : [...checkedIds, ...fileIds.filter((id) => !checkedIds.includes(id))]
}

/**
 * Whether `fileIds` are exactly the checked files, i.e. the option is what's currently selected.
 */
export const isSameSelection = (fileIds: string[], checkedIds: string[]) => {
  return fileIds.length === checkedIds.length && fileIds.every((id) => checkedIds.includes(id))
}
