import { z } from 'zod'

import type { Currency } from '@/types-enums'
import { zCurrency } from '@/types-enums'

import { zDateTimeString, zIdString, zNonEmptyString } from '../global'
import type { Transaction } from './transaction'

const zAmountColumn = z.discriminatedUnion('type', [
  z.object({ type: z.literal('signed'), header: zNonEmptyString }),
  z.object({ type: z.literal('inOut'), in: zNonEmptyString, out: zNonEmptyString }),
  z.object({
    type: z.literal('sum'),
    signed: z.array(zNonEmptyString),
    in: z.array(zNonEmptyString),
    out: z.array(zNonEmptyString),
  }),
])

/**
 * How to read the CSV files of one account, set up by the user for files no built-in bank format matches. Like a
 * `FormatDef`, all `headers` must be present in a file for it to match.
 */
export const zCustomParserMapping = z.object({
  bankName: zNonEmptyString,
  accountName: zNonEmptyString,
  currency: zCurrency,
  dateFormat: zNonEmptyString,
  numberFormat: z.enum(['en', 'de']),
  headers: z.array(zNonEmptyString).min(1),
  columns: z.object({
    date: zNonEmptyString,
    description: zNonEmptyString,
    amount: zAmountColumn,
  }),
  extraColumns: z.object({
    balance: zNonEmptyString.nullable(),
    reference: zNonEmptyString.nullable(),
    transactionType: zNonEmptyString.nullable(),
    category: zNonEmptyString.nullable(),
    parentCategory: zNonEmptyString.nullable(),
  }),
})

export type CustomParserMapping = z.infer<typeof zCustomParserMapping>

export const zCustomParser = z.object({
  id: zIdString,
  created: zDateTimeString,
  modified: zDateTimeString,
  ...zCustomParserMapping.shape,
})

export type CustomParser = z.infer<typeof zCustomParser>

// -------------------------------------------------------
// Setup, see `m-custom-parser/service/setup.ts`
// -------------------------------------------------------

export type ColumnField =
  | 'date'
  | 'description'
  | 'moneyIn'
  | 'moneyOut'
  | 'balance'
  | 'reference'
  | 'transactionType'
  | 'category'
  | 'parentCategory'

/**
 * The form state, the connected header names per field. At most one, except for the amount fields.
 */
export type SetupDraft = {
  headerIndex: number
  bankName: string
  accountName: string
  currency: Currency
  dateFormat: string
  numberFormat: CustomParserMapping['numberFormat']
  columns: Record<ColumnField, string[]>
}

/**
 * The file parsed with the mapping of the setup, see `getPreview`.
 */
export type SetupPreviewResult = {
  transactions: Transaction[]
  error: string | null
}
