import type { Parser } from '@/types'
import { MISC } from '@/common'

import { createParser } from './create-parser'
import { getCustomParsers } from './custom'
import type { BankAccountId, BuiltInParserId, ParserId } from './registry'
import { BANKS } from './registry'

/**
 * The built-in parsers, see `getParser` for custom ones too.
 */
export const AVAILABLE_PARSERS = Object.fromEntries(
  BANKS.flatMap((bank) => bank.formats.map((format) => createParser(bank, format))).map((parser) => [
    parser.id,
    parser,
  ]),
) as Record<BuiltInParserId, Parser>

/**
 * Built-in or registered custom parser, `undefined` e.g. for a deleted custom parser.
 */
export const getParser = (parserId: ParserId): Parser | undefined => {
  return AVAILABLE_PARSERS[parserId as BuiltInParserId] ?? getCustomParsers().find((parser) => parser.id === parserId)
}

const requireParser = (parserId: ParserId): Parser => {
  const parser = getParser(parserId)

  if (!parser) {
    throw new Error(`Unknown parser ID: ${parserId}`)
  }

  return parser
}

export const getParserCurrency = (parserId: ParserId) => {
  return requireParser(parserId).currency
}

/**
 * E.g. 'fnb' for 'fnb__credit_card', also of custom parsers.
 */
export const toBankId = (parserId: ParserId): string => {
  return parserId.split('__')[0]
}

/**
 * Of a built-in bank, `undefined` for custom parsers.
 */
export const getBankCountry = (bankId: string) => {
  return BANKS.find((bank) => bank.id === bankId)?.country
}

export const getBankAccountId = (parserId: ParserId): BankAccountId => {
  return requireParser(parserId).bankAccountId
}

type BankAccountName = {
  short: string
  long: string
  alt: string
}

export const getBankAccountName = (value: ParserId | null): BankAccountName => {
  if (!value) {
    return {
      short: 'Unsupported',
      long: 'Unsupported bank format',
      alt: 'Unsupported format',
    }
  }

  const parser = getParser(value)

  if (parser) {
    return {
      short: parser.bankName,
      long: `${parser.bankName} ${MISC.CENTER_DOT} ${parser.accountName}`,
      alt: `${parser.bankName} / ${parser.accountName}`,
    }
  }

  console.warn(`Invalid parser ID: ${value}`)

  return {
    short: 'Invalid',
    long: 'Invalid parser',
    alt: 'Invalid parser',
  }
}
