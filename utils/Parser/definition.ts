import type { AmountColumnDef, BankDef, FormatDef, HeaderDef, ValidFormats } from '@/types'

type BankDefOf<Id extends string, F> = Omit<BankDef, 'id' | 'formats'> & { id: Id; formats: F }

export const defineBank = <const Id extends string, const F extends readonly FormatDef[]>(
  bank: BankDefOf<Id, F & ValidFormats<F>>,
): BankDefOf<Id, F> => {
  return bank
}

/**
 * All headers of a format, and the subset required for detection.
 */
export const getFormatHeaders = ({ headers }: FormatDef) => {
  const toName = (header: HeaderDef) => (typeof header === 'string' ? header : header.header)

  return {
    headers: [...new Set(headers.map(toName))],
    required: [...new Set(headers.filter((header) => typeof header === 'string'))],
  }
}

/**
 * Headers read by `columns` and `extraColumns`.
 */
export const getReferencedHeaders = ({ columns, extraColumns }: FormatDef) => {
  const description = Array.isArray(columns.description) ? columns.description : [columns.description]

  return [
    ...new Set([
      columns.date,
      ...description,
      ...getAmountHeaders(columns.amount),
      ...Object.values(extraColumns).filter((header) => header !== null),
    ]),
  ]
}

const getAmountHeaders = (amount: AmountColumnDef) => {
  switch (amount.type) {
    case 'signed':
      return [amount.header]
    case 'inOut':
      return [amount.in, amount.out]
    case 'firstOf':
      return amount.headers
    case 'sum':
      return [...amount.signed, ...amount.in, ...amount.out]
  }
}

export const toAccountId = (bank: Pick<BankDef, 'id'>, format: FormatDef) => {
  return `${bank.id}__${format.accountType}`
}

export const toParserId = (bank: Pick<BankDef, 'id'>, format: FormatDef) => {
  return `${bank.id}__${format.id}`
}
