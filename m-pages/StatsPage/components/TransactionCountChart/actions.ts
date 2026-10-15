import { grey, indigo } from '@mui/material/colors'
import type { ChartOptions } from 'chart.js'

import { getBaseChartOptions, getThemeColor } from '@/utils/Chart'

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
