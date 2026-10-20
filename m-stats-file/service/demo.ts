import type { ParsedStatsFile } from '@/types'
import { StatsFileStatus } from '@/types-enums'
import { DEMO_TRANSACTIONS, MISC } from '@/common'
import { PARSER_VERSION } from '@/utils/Parser'
import { Big } from '@/lib/w-big'

export const DEMO_FILE_ID = 'demo'

let demoFile: ParsedStatsFile | null = null

/**
 * The demo transactions as a Lloyds current account CSV, so the raw CSV view detects the format like for a real file.
 */
const toLloydsCsv = () => {
  const toUkDate = (date: string) => date.slice(0, 10).split('-').reverse().join('/')
  let balance = Big(0)

  const rows = DEMO_TRANSACTIONS.map(({ date, description, value }) => {
    const amount = Big(value)
    const isDebit = amount.lt(0)
    balance = balance.plus(amount)
    return [
      toUkDate(date),
      isDebit ? 'DEB' : 'FPI',
      "'30-99-50",
      '12345678',
      description.toUpperCase(),
      isDebit ? amount.abs().toFixed(2) : '',
      isDebit ? '' : amount.toFixed(2),
      balance.toFixed(2),
    ]
  })

  return [
    [
      'Transaction Date',
      'Transaction Type',
      'Sort Code',
      'Account Number',
      'Transaction Description',
      'Debit Amount',
      'Credit Amount',
      'Balance',
    ],
    ...rows,
  ]
    .map((row) => row.join(','))
    .join('\n')
}

/**
 * When the demo was first viewed, used as the demo file's upload date. Remembered in local storage, now if that's not
 * available.
 */
const getFirstViewed = () => {
  const now = new Date().toISOString()

  try {
    const stored = localStorage.getItem(MISC.LS_DEMO_FIRST_VIEWED_KEY)

    if (stored && !Number.isNaN(Date.parse(stored))) {
      return stored
    }

    localStorage.setItem(MISC.LS_DEMO_FIRST_VIEWED_KEY, now)
  } catch {
    // Storage unavailable, e.g. blocked
  }

  return now
}

/**
 * Read-only file of the demo transactions, shown like a real file in demo mode. Never stored.
 */
export const getDemoFile = (): ParsedStatsFile => {
  if (demoFile) {
    return demoFile
  }

  const created = getFirstViewed()
  const csv = toLloydsCsv()

  demoFile = {
    id: DEMO_FILE_ID,
    created,
    modified: created,
    // Like a dropped file, see `FileWithPath`
    file: Object.assign(new File([csv], 'demo.csv', { type: 'text/csv' }), {
      path: './demo.csv',
      relativePath: './demo.csv',
    }),
    hash: DEMO_FILE_ID,
    status: StatsFileStatus.PARSED,
    sections: [{ parserId: 'lloyds__current', transactions: DEMO_TRANSACTIONS }],
    parserVersion: PARSER_VERSION,
  }

  return demoFile
}
