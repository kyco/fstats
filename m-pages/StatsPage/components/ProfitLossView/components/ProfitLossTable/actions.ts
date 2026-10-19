import type { NumberString, ProfitLossFlowLine } from '@/types'
import { Big } from '@/lib/w-big'

// Periods without transactions
export const EMPTY_AMOUNT = '–'

type GetFlowLinesProps = {
  incoming: NumberString
  outgoing: NumberString
  negate: boolean
}

/**
 * Signed like the cell, so they add up to it: the row's direction first (outgoing for expenses), the other one negative.
 */
export const getFlowLines = ({ incoming, outgoing, negate }: GetFlowLinesProps): ProfitLossFlowLine[] => {
  const lineIn = { labelKey: 'STATS_PAGE.PROFIT_LOSS.FLOWS.IN', value: incoming }
  const lineOut = { labelKey: 'STATS_PAGE.PROFIT_LOSS.FLOWS.OUT', value: outgoing }

  return negate
    ? [
        { ...lineOut, value: Big(outgoing).neg().toString() },
        { ...lineIn, value: Big(incoming).neg().toString() },
      ]
    : [lineIn, lineOut]
}
