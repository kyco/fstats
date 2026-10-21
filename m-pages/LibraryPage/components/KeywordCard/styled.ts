export const ui = () => {
  return {
    // Highlighted when linked
    card: (isTarget: boolean) => ({
      display: 'flex',
      flexDirection: 'column',
      gap: 0.75,
      minWidth: 0,
      p: 1.5,
      border: 1,
      borderColor: isTarget ? 'primary.main' : 'divider',
      borderRadius: 1.5,
      scrollMarginTop: 16,
    }),
    title: {
      display: 'flex',
      alignItems: 'baseline',
      flexWrap: 'wrap',
      columnGap: 1,
    },
    name: {
      fontSize: 13,
      fontWeight: 500,
    },
    id: {
      fontFamily: 'monospace',
      fontSize: 11,
      color: 'text.secondary',
    },
    meta: {
      fontSize: 12,
      color: 'text.secondary',
    },
    keywords: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 0.5,
    },
    keyword: {
      px: 0.75,
      borderRadius: '4px',
      bgcolor: 'action.selected',
      fontFamily: 'monospace',
      fontSize: 11,
      lineHeight: '20px',
    },
    examplesTitle: {
      mt: 0.25,
      fontSize: 11,
      color: 'text.secondary',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    example: {
      fontFamily: 'monospace',
      fontSize: 11,
      color: 'text.secondary',
      overflowWrap: 'anywhere',
    },
  }
}
