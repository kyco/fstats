import { alpha } from '@mui/material/styles'
import type { ChartOptions, ScriptableContext } from 'chart.js'
import { merge } from 'lodash'

import type { GradientColors, GradientDirection } from '@/types'

type GetGradientProps = {
  context: ScriptableContext<'line'> | ScriptableContext<'bar'>
  colors: GradientColors
  direction?: GradientDirection
  reverse?: boolean
}

export const getGradient = ({
  context,
  colors,
  direction = 'horizontal',
  reverse = false,
}: GetGradientProps): CanvasGradient | 'currentcolor' => {
  const { chart } = context
  const { ctx, chartArea } = chart

  if (!chartArea) {
    return 'currentcolor'
  }

  const hStart = reverse ? chartArea.right : chartArea.left
  const hEnd = reverse ? chartArea.left : chartArea.right
  const vStart = reverse ? chartArea.top : chartArea.bottom
  const vEnd = reverse ? chartArea.bottom : chartArea.top

  const gradient =
    direction === 'horizontal'
      ? ctx.createLinearGradient(hStart, 0, hEnd, 0)
      : ctx.createLinearGradient(0, vStart, 0, vEnd)

  gradient.addColorStop(0, colors.start)
  gradient.addColorStop(1, colors.end)

  return gradient
}

// By color scheme class and variable name, scriptable options read them on every draw
const themeColors = new Map<string, string>()

/**
 * Current value of a theme CSS variable (e.g. `--mui-palette-divider`). Canvases can't use the variables, and with CSS
 * variables `theme.palette` only has the light mode colors, so read it while drawing (scriptable options).
 */
export const getThemeColor = (name: string) => {
  const key = `${document.documentElement.className}|${name}`
  let color = themeColors.get(key)

  if (color === undefined) {
    color = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    themeColors.set(key, color)
  }

  return color
}

/**
 * Options shared by all charts, deep merged with `options`.
 */
export const getBaseChartOptions = <T extends 'line' | 'bar'>(options: ChartOptions<T>): ChartOptions<T> => {
  const baseOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      // White box with a grey border like the cards, from the theme's CSS variables so it follows the color mode
      tooltip: {
        backgroundColor: () => getThemeColor('--mui-palette-background-paper'),
        borderColor: () => getThemeColor('--mui-palette-divider'),
        borderWidth: 1,
        titleColor: () => getThemeColor('--mui-palette-text-secondary'),
        bodyColor: () => getThemeColor('--mui-palette-text-primary'),
        titleFont: { size: 11, weight: 500 },
        bodyFont: { size: 12, weight: 600 },
        titleMarginBottom: 2,
        padding: { x: 10, y: 8 },
        cornerRadius: 6,
        caretSize: 0,
        caretPadding: 8,
        // A single series per chart, the color box adds nothing
        displayColors: false,
      },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 12,
        },
      },
      y: {
        border: {
          display: false,
        },
      },
    },
  }

  return merge({}, baseOptions, options) as ChartOptions<T>
}

/**
 * Soft area below the line, fading out towards the axis.
 */
export const getAreaFill = (color: string, opacity = 0.16) => {
  return (context: ScriptableContext<'line'>) => {
    return getGradient({
      context,
      colors: { start: alpha(color, 0), end: alpha(color, opacity) },
      direction: 'vertical',
    })
  }
}
