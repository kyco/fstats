'use client'

import { useMemo } from 'react'

import type { TransactionFilter } from '@/types'
import { useTranslation } from '@/lib/i18n'

import { useStatsTransactions } from '../../context'
import StatsRow from '../StatsRow'
import { getTransactionsByCurrency } from './actions'

type TransactionsSummaryProps = {
  filter: TransactionFilter
}

/**
 * Combined stats of the checked files, one row per currency.
 */
const Component = ({ filter }: TransactionsSummaryProps) => {
  const { t } = useTranslation()
  const stats = useStatsTransactions()
  const groups = useMemo(() => getTransactionsByCurrency(stats, filter), [stats, filter])

  return groups.map(({ currency, transactions, counts }) => (
    <StatsRow
      key={currency}
      title={t('MISC.ALL_TRANSACTIONS')}
      chip={groups.length > 1 ? currency : undefined}
      isTotal
      defaultExpanded
      stats={{ transactions, currency }}
      counts={counts}
    />
  ))
}

export default Component
