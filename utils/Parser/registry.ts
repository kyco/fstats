/**
 * Single source of truth for supported banks. IDs and zod schemas are derived from `BANKS`.
 *
 * Keep this module free of runtime imports besides `zod` and the bank definitions, it's used by `@/types`.
 */
import { z } from 'zod'

import type { AccountIds, ParserIds } from '@/types'

import { capitec, comdirect, fnb, ing, lloyds, n26, tradeRepublic } from './banks'
import { toParserId } from './definition'

export const BANKS = [capitec, comdirect, fnb, ing, lloyds, n26, tradeRepublic] as const

type Bank = (typeof BANKS)[number]

export type BuiltInParserId = ParserIds<Bank>

export type BuiltInBankAccountId = AccountIds<Bank>

/**
 * Bank ID of a custom parser, from its (UUID) ID, see `toCustomBankId`.
 */
export type CustomBankId = `custom_${string}`

export type CustomParserId = `${CustomBankId}__default`

export type CustomBankAccountId = `${CustomBankId}__current`

export type ParserId = BuiltInParserId | CustomParserId

export type BankAccountId = BuiltInBankAccountId | CustomBankAccountId

export const PARSER_IDS = BANKS.flatMap((bank) =>
  bank.formats.map((format) => toParserId(bank, format)),
) as BuiltInParserId[]

const CUSTOM_PARSER_ID = /^custom_[0-9a-f]{32}__default$/

export const zParserId = z.union([
  z.enum(PARSER_IDS),
  z.custom<CustomParserId>((value) => typeof value === 'string' && CUSTOM_PARSER_ID.test(value)),
])
