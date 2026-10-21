export const ui = () => {
  return {
    row: (depth: number) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      minHeight: 44,
      pl: 3 + depth * 2.5,
      pr: 0.5,
      borderRadius: '6px',
      '&:hover': { bgcolor: 'action.hover' },
    }),
    main: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      minWidth: 0,
      py: 0.5,
    },
    title: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 1,
      minWidth: 0,
    },
    name: {
      minWidth: 0,
      fontSize: 13,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    // Where it's from, e.g. "de" or a bank
    pack: {
      flexShrink: 0,
      px: 0.5,
      borderRadius: '4px',
      bgcolor: 'action.selected',
      fontSize: 11,
      lineHeight: '16px',
      textTransform: 'uppercase',
      color: 'text.secondary',
    },
    hint: {
      flexShrink: 0,
      fontSize: 12,
      color: 'text.secondary',
      whiteSpace: 'nowrap',
    },
    keywords: {
      minWidth: 0,
      fontFamily: 'monospace',
      fontSize: 11,
      color: 'text.secondary',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    select: {
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      width: { xs: 150, sm: 240 },
    },
  }
}
