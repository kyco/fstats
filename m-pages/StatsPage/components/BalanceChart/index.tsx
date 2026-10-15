import { Box } from '@mui/material'

import type { TransactionRangeItem } from '@/types'
import { MISC } from '@/common'
import { CardTitle, LineChart } from '@/components'
import { useIsDarkMode } from '@/hooks'
import { Color } from '@/styles/colors'
import { getAreaFill, getThemeColor } from '@/utils/Chart'
import { useTranslation } from '@/lib/i18n'

import { accumulateValues, getChartOptions, getLineColor } from './actions'
import { ui } from './styled'

type BalanceChartProps = {
  transactionRangeItems: TransactionRangeItem[]
  /**
   * Days with transactions deselected in the date explorer.
   */
  excludedDayCount: number
  /**
   * Next to the title, e.g. the currency when several are shown.
   */
  chip?: string
}

const Component = ({ transactionRangeItems, excludedDayCount, chip }: BalanceChartProps) => {
  const { t } = useTranslation()
  const isDarkMode = useIsDarkMode()
  const sx = ui()
  const chartOptions = getChartOptions()
  const lineColor = getLineColor(isDarkMode)
  const labels = transactionRangeItems.map(({ label }) => label)
  const both = accumulateValues(transactionRangeItems)

  // Add a "zero" data entry so the chart always begins from zero
  labels.unshift('')
  both.unshift(0)

  const chartData = {
    labels,
    datasets: [
      {
        label: t('STATS_PAGE.STATS_VIEW.BALANCE'),
        data: both,
        borderColor: lineColor,
        // Brand cyan, so it's distinct from the transactions per month chart
        backgroundColor: getAreaFill(Color.cyan, isDarkMode ? 0.2 : 0.14),
        fill: 'origin',
        borderWidth: 2,
        // Smooth, without overshooting the balance
        cubicInterpolationMode: 'monotone' as const,
        pointHoverBackgroundColor: () => getThemeColor('--mui-palette-background-paper'),
        pointHoverBorderColor: lineColor,
      },
    ],
  }

  return (
    <Box>
      <CardTitle
        chip={chip}
        caption={
          transactionRangeItems.length
            ? [
                t('STATS_PAGE.STATS_VIEW.DATE_RANGE', {
                  start: transactionRangeItems[0].label,
                  end: transactionRangeItems[transactionRangeItems.length - 1].label,
                }),
                ...(excludedDayCount ? [t('STATS_PAGE.STATS_VIEW.DAYS_EXCLUDED', { count: excludedDayCount })] : []),
              ].join(` ${MISC.CENTER_DOT} `)
            : null
        }
      >
        {t('STATS_PAGE.STATS_VIEW.BALANCE')}
      </CardTitle>
      <Box sx={sx.chartCard}>
        <LineChart type="line" options={chartOptions} data={chartData} />
      </Box>
    </Box>
  )
}

export default Component
