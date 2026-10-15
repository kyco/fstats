'use client'

import { Box } from '@mui/material'
import type { ChartData, ChartDataset } from 'chart.js'
import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useDebounceCallback, useResizeObserver } from 'usehooks-ts'

import type { Size, Transaction } from '@/types'
import { Currency } from '@/types-enums'
import { BarChart, CardTitle } from '@/components'
import { useUserPreferences } from '@/m-user/service'
import { toDisplayDate } from '@/utils/Date'
import { useTranslation } from '@/lib/i18n'
import { Big } from '@/lib/w-big'

import { getBackgroundColour, getBarThickness, getBorderRadius, getChartOptions } from './actions'
import { ui } from './styled'

type TransactionChartProps = {
  transactions: Transaction[]
  currency: Currency
  /**
   * Next to the title, e.g. the currency when several are shown.
   */
  chip?: string
}

const Component = ({ transactions, currency, chip }: TransactionChartProps) => {
  const { t } = useTranslation()
  const { locale, dateFormat } = useUserPreferences()
  const sx = ui()
  const ref = useRef<HTMLDivElement>(null)
  const [{ width = 0 }, setSize] = useState<Size>({ width: undefined, height: undefined })

  useResizeObserver({
    ref: ref as RefObject<HTMLDivElement>,
    onResize: useDebounceCallback(setSize, 200),
  })

  const dataset: ChartDataset<'bar'> = {
    type: 'bar',
    label: t('MISC.TRANSACTIONS'),
    data: transactions.map((row) => Big(row.value).toNumber()),
    backgroundColor: getBackgroundColour,
    borderRadius: getBorderRadius,
    barThickness: getBarThickness({ transactions, chartWidth: width }),
    order: 2,
  }

  const chartData: ChartData = {
    labels: transactions.map((row) => toDisplayDate({ date: row.date, locale, formatTo: dateFormat })),
    datasets: [dataset],
  }

  const chartOptions = getChartOptions({ currency, locale })

  return (
    <Box>
      <CardTitle chip={chip}>{t('STATS_PAGE.STATS_VIEW.CASHFLOW')}</CardTitle>

      <Box sx={sx.chartCard} ref={ref}>
        {/* @ts-expect-error Type '"line"' is not assignable to type '"bar"'. */}
        <BarChart type="bar" data={chartData} options={chartOptions} />
      </Box>
    </Box>
  )
}

export default Component
