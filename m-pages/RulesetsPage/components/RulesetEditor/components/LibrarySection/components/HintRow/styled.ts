export const ui = () => {
  return {
    row: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      minHeight: 38,
      pl: 0.5,
      pr: 0.5,
      borderRadius: '6px',
      '&:hover': { bgcolor: 'action.hover' },
    },
    main: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      flexGrow: 1,
      minWidth: 0,
      minHeight: 34,
      justifyContent: 'flex-start',
      textAlign: 'left',
    },
    chevron: (isExpanded: boolean) => ({
      flexShrink: 0,
      fontSize: 18,
      color: 'text.secondary',
      transform: isExpanded ? 'rotate(90deg)' : 'none',
      transition: 'transform 150ms',
    }),
    label: {
      minWidth: 0,
      fontSize: 13,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    count: {
      flexShrink: 0,
      fontSize: 12,
      color: 'text.secondary',
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
