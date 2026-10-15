export const ui = () => {
  return {
    item: {
      minHeight: 0,
      m: 0,
      py: 0.5,
      px: 1.5,
      gap: 1,
      fontSize: 14,
      lineHeight: 1.4,
      '&.Mui-selected': { fontWeight: 600 },
    },
    label: {
      flexGrow: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    count: {
      fontSize: 12,
      fontWeight: 400,
      color: 'text.secondary',
      fontVariantNumeric: 'tabular-nums',
    },
  }
}
