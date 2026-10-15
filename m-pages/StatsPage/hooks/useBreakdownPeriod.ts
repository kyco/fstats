'use client'

import { BreakdownPeriod } from '@/types-enums'
import { MISC } from '@/common'

import { useViewStorage } from './useViewStorage'

/**
 * Period of the profit and loss columns. Kept separately in demo mode, see `useViewStorage`.
 */
export const useBreakdownPeriod = () => {
  const [period, setPeriod] = useViewStorage<BreakdownPeriod>(MISC.LS_STATS_BREAKDOWN_PERIOD_KEY, BreakdownPeriod.MONTH)

  return { period, setPeriod }
}
