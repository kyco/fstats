import { grey } from '@mui/material/colors'
import type { ChartOptions } from 'chart.js'

import { getBaseChartOptions, getThemeColor } from '@/utils/Chart'

export const getLineColor = (isDarkMode: boolean) => {
  return isDarkMode ? grey[300] : grey[800]
}

export const getChartOptions = (): ChartOptions<'line'> => {
  return getBaseChartOptions<'line'>({
    plugins: {
      // A single series, the tooltip names it
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    elements: {
      // Points only on hover, hollow like the transactions per month chart
      point: {
        radius: 0,
        hoverRadius: 4,
        hoverBorderWidth: 2,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: true,
        },
      },
      y: {
        grid: {
          display: true,
          color: (ctx) => {
            return ctx.tick.value === 0 ? getThemeColor('--mui-palette-divider') : 'transparent'
          },
        },
        ticks: {
          display: true,
        },
        afterBuildTicks: (scale) => {
          scale.ticks.push({ value: 0 })
        },
      },
    },
  })
}
