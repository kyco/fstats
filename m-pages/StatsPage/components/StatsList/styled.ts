export const ui = () => {
  const value = {
    m: 0,
    fontSize: 12,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  } as const

  const total = {
    fontSize: 14,
    fontWeight: 700,
    color: 'text.primary',
  } as const

  return {
    count: {
      mb: 1,
      fontSize: 12,
      color: 'text.secondary',
    },
    list: {
      m: 0,
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 2,
      py: 0.125,
    },
    // Sum line, like in a ledger
    totalRow: {
      mt: 0.25,
      pt: 0.5,
      borderTop: 1,
      // Stronger than the dividers, softer than the text
      borderColor: 'text.secondary',
    },
    label: {
      m: 0,
      fontSize: 12,
    },
    value: value,
    total: total,
    totalValue: (color: string | undefined) => ({
      ...value,
      ...total,
      color,
    }),
  }
}
