import { AccountType, Country, Currency } from '@/types-enums'
import type { BankAccountId, ParserId } from '@/utils/Parser/registry'

import type { RowData } from './services/stats-file'
import type { Transaction } from './services/transaction'

export type Parser = {
  id: ParserId
  bankAccountId: BankAccountId
  bankName: string
  accountName: string
  currency: Currency
  /**
   * Headers that must be present in a header row of this format.
   */
  requiredHeaders: string[]
  /**
   * Required headers missing from `row`, empty if `row` is a header row of this format.
   */
  getMissingHeaders: (row: RowData) => string[]
  /**
   * The header row and transaction rows of a section (header in the first row) as is, without footers.
   */
  extractRows: (section: RowData[]) => { header: RowData; rows: RowData[] }
  parse: (section: RowData[]) => Transaction[]
}

// Bank definitions

export type ExtraField = keyof NonNullable<Transaction['extra']>

/**
 * A CSV header of the file. Optional headers aren't always present and aren't required for detection.
 */
export type HeaderDef<H extends string = string> = H | { readonly header: H; readonly optional: true }

/**
 * - `signed`: one signed column
 * - `inOut`: money in / money out columns, out values are stored as negative whether the file has them positive or negative
 * - `firstOf`: first non-empty signed column
 * - `sum`: sum of the non-empty columns, `signed` as they are, `in` as positive and `out` as negative (e.g. money out
 *   and a fee column)
 */
export type AmountColumnDef<H extends string = string> =
  | { readonly type: 'signed'; readonly header: H }
  | { readonly type: 'inOut'; readonly in: H; readonly out: H }
  | { readonly type: 'firstOf'; readonly headers: readonly H[] }
  | { readonly type: 'sum'; readonly signed: readonly H[]; readonly in: readonly H[]; readonly out: readonly H[] }

export type FormatDef<H extends string = string> = {
  /**
   * Unique within the bank, in snake_case, e.g. "giro", "visa" or "savings_legacy". Parser ID:
   * `${bank.id}__${id}`, changing it requires bumping `PARSER_VERSION`.
   */
  id: string
  /**
   * Bank account ID: `${bank.id}__${accountType}`, formats of the same account share it. Part of the persisted
   * transaction IDs, so never change it.
   */
  accountType: AccountType
  /**
   * Display name, e.g. "Giro" or "Current Account".
   */
  accountName: string
  dateFormat: string
  /**
   * 'de' = "1.234,56". 'en' = "1,234.56".
   */
  numberFormat: 'en' | 'de'
  /**
   * All CSV headers of the file, used for detection. A file matches if all non-optional headers are present (any
   * order), unlisted headers are logged but still match.
   */
  headers: readonly HeaderDef<H>[]
  /**
   * Core transaction fields, headers must be listed in `headers`. If `description` is a list, the first non-empty
   * column is used.
   */
  columns: { date: H; description: H | readonly H[]; amount: AmountColumnDef<H> }
  /**
   * Stored in `Transaction['extra']`, headers must be listed in `headers`. `null` if the file has no such column.
   */
  extraColumns: Record<ExtraField, H | null>
}

export type BankDef = {
  /**
   * Part of the persisted IDs.
   */
  id: string
  name: string
  /**
   * Bank website.
   */
  url: string
  /**
   * Shown on the home page.
   */
  country: Country
  currency: Currency
  formats: readonly FormatDef[]
}

type HeaderNames<F> = F extends { headers: readonly (infer D)[] }
  ? D extends string
    ? D
    : D extends { header: infer H extends string }
      ? H
      : never
  : never

/**
 * Checks that `columns` and `extraColumns` only reference headers listed in `headers`.
 */
export type ValidFormats<F extends readonly FormatDef[]> = { [K in keyof F]: FormatDef<HeaderNames<F[K]>> }

type ParserIdOf<BankId extends string, F> = F extends { id: infer FormatId extends string }
  ? `${BankId}__${FormatId}`
  : never

type AccountIdOf<BankId extends string, F> = F extends { accountType: infer A extends string }
  ? `${BankId}__${A}`
  : never

export type ParserIds<B> = B extends { id: infer BankId extends string; formats: readonly (infer F)[] }
  ? ParserIdOf<BankId, F>
  : never

export type AccountIds<B> = B extends { id: infer BankId extends string; formats: readonly (infer F)[] }
  ? AccountIdOf<BankId, F>
  : never
