'use client'

import { Box } from '@mui/material'

import type { Transaction, TransactionCounts } from '@/types'
import { CardTitle, LineChart } from '@/components'
import { getMonthlyCounts } from '@/m-transaction/service'
import { useUserPreferences } from '@/m-user/service'
import { useIsDarkMode } from '@/hooks'
import { getAreaFill, getThemeColor } from '@/utils/Chart'
import { useTranslation } from '@/lib/i18n'

import { getTransactionCountText } from '../../actions'
import { ui } from '../BalanceChart/styled'
import { getChartOptions, getLineColors } from './actions'

type TransactionCountChartProps = {
  /**
   * Filtered and sorted by date.
   */
  transactions: Transaction[]
  /**
   * Days deselected in the date explorer, months without other transactions are gaps.
   */
  excludedDays: Set<string>
  /**
   * Of the transactions before the date explorer, see `getTransactionCounts`.
   */
  counts: TransactionCounts
  /**
   * Next to the title, e.g. the currency when several are shown.
   */
  chip?: string
}

/**
 * Number of transactions per month.
 */
const Component = ({ transactions, excludedDays, counts: transactionCounts, chip }: TransactionCountChartProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const isDarkMode = useIsDarkMode()
  const { locale, dateFormat } = useUserPreferences()
  const { labels, counts, average } = getMonthlyCounts({ transactions, excludedDays, locale, dateFormat })
  const colors = getLineColors(isDarkMode)

  const chartData = {
    labels,
    datasets: [
      {
        label: t('MISC.TRANSACTIONS'),
        data: counts,
        borderColor: colors.count,
        backgroundColor: getAreaFill(colors.count),
        fill: 'origin',
        borderWidth: 2,
        // Smooth, without overshooting the counts
        cubicInterpolationMode: 'monotone' as const,
        // Hollow points, ringed by the surface
        pointBackgroundColor: () => getThemeColor('--mui-palette-background-paper'),
        pointBorderColor: colors.count,
      },
    ],
  }

  return (
    <Box>
      <CardTitle chip={chip} caption={getTransactionCountText(transactionCounts)}>
        {t('STATS_PAGE.STATS_VIEW.TRANSACTIONS_PER_MONTH')}
      </CardTitle>
      <Box sx={sx.chartCard}>
        <LineChart
          type="line"
          options={getChartOptions({
            average,
            averageLabel: t('STATS_PAGE.STATS_VIEW.AVERAGE_PER_MONTH', {
              average: (average ?? 0).toLocaleString(locale),
            }),
            averageColor: colors.average,
          })}
          data={chartData}
        />
      </Box>
    </Box>
  )
}

export default Component
