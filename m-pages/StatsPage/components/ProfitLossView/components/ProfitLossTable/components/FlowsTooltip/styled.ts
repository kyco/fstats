import { sxChartTooltip } from '@/styles/styled'

export const ui = () => {
  return {
    // Dotted underline in the amount's color, there's more to see
    amount: {
      font: 'inherit',
      color: 'inherit',
      textDecoration: 'underline dotted',
      textUnderlineOffset: 3,
      '&:hover, &.Mui-focusVisible': { textDecorationStyle: 'solid' },
    },
    // Like the chart tooltips, but roomier
    tooltip: {
      ...sxChartTooltip,
      maxWidth: 'none',
      minWidth: 240,
      px: 2,
      py: 1.5,
      fontSize: 13,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      mb: 1.25,
    },
    title: {
      fontSize: 12,
      fontWeight: 500,
      color: 'text.secondary',
    },
    close: {
      mr: -0.75,
      fontSize: 16,
      color: 'text.secondary',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'auto auto',
      columnGap: 4,
      rowGap: 0.5,
    },
    label: {
      color: 'text.secondary',
    },
    value: {
      textAlign: 'right' as const,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
    },
    // Across both columns, like the sum line of a calculation
    divider: {
      gridColumn: '1 / -1',
      my: 0.5,
      borderTop: 1,
      borderColor: 'text.primary',
    },
  }
}
