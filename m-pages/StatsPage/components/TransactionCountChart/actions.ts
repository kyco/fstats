import { grey, indigo } from '@mui/material/colors'
import type { ChartOptions } from 'chart.js'
import { mean, round } from 'lodash'

import type { Transaction } from '@/types'
import { DateFormat, UserLocale } from '@/types-enums'
import { getTransactionRangeItems, getTransactionsDateRange, RangeGranularity } from '@/m-transaction/service'
import { getBaseChartOptions, getThemeColor } from '@/utils/Chart'

type GetMonthlyCountsProps = {
  transactions: Transaction[]
  excludedDays: Set<string>
  locale: UserLocale
  dateFormat: DateFormat
}

/**
 * Transactions per month of the sorted transactions, `null` (a gap in the line) for months excluded by date.
 */
export const getMonthlyCounts = ({ transactions, excludedDays, locale, dateFormat }: GetMonthlyCountsProps) => {
  if (!transactions.length) {
    return { labels: [], counts: [], average: null }
  }

  const items = getTransactionRangeItems({
    dateRange: getTransactionsDateRange(transactions),
    transactions,
    locale,
    dateFormat,
    excludedDays,
    granularity: RangeGranularity.MONTH,
  })

  const counts = items.map((item) => (item.isExcluded ? null : item.transactions.length))
  // Of the shown months, including those without transactions
  const shownCounts = counts.filter((count) => count !== null)

  return {
    labels: items.map((item) => item.label),
    counts,
    average: shownCounts.length ? round(mean(shownCounts), 1) : null,
  }
}

export const getLineColors = (isDarkMode: boolean) => {
  return {
    // Friendlier than grey, distinct from the balance chart's cyan
    count: isDarkMode ? indigo[200] : indigo[400],
    // Recessive, a reference rather than data
    average: isDarkMode ? grey[600] : grey[500],
  }
}

type GetChartOptionsProps = {
  average: number | null
  averageLabel: string
  averageColor: string
}

/**
 * The average is a reference line rather than a series, labelled on the line itself.
 */
export const getChartOptions = ({
  average,
  averageLabel,
  averageColor,
}: GetChartOptionsProps): ChartOptions<'line'> => {
  return getBaseChartOptions<'line'>({
    plugins: {
      // A single series, named by the title
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
      annotation: {
        annotations:
          average === null
            ? {}
            : {
                average: {
                  type: 'line',
                  yMin: average,
                  yMax: average,
                  borderColor: averageColor,
                  borderWidth: 1.5,
                  borderDash: [4, 4],
                  // A chip on the middle of the line, drawn above the data so it stays readable
                  label: {
                    display: true,
                    content: averageLabel,
                    position: 'center',
                    backgroundColor: () => getThemeColor('--mui-palette-background-paper'),
                    borderColor: () => getThemeColor('--mui-palette-divider'),
                    borderWidth: 1,
                    borderRadius: 10,
                    color: () => getThemeColor('--mui-palette-text-secondary'),
                    padding: { x: 8, y: 3 },
                    font: { size: 11, weight: 500 },
                  },
                },
              },
      },
    },
    elements: {
      point: {
        radius: 2.5,
        hoverRadius: 4,
        borderWidth: 1.5,
        hoverBorderWidth: 2,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  })
}
