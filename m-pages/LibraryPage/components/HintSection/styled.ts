export const ui = () => {
  return {
    section: {
      scrollMarginTop: 16,
      borderBottom: 1,
      borderColor: 'divider',
    },
    // Highlighted when linked
    header: (isTarget: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      width: '100%',
      minHeight: 38,
      px: 0.5,
      justifyContent: 'flex-start',
      textAlign: 'left',
      borderRadius: '6px',
      bgcolor: isTarget ? 'action.selected' : 'transparent',
      '&:hover': { bgcolor: 'action.hover' },
    }),
    chevron: (isExpanded: boolean) => ({
      flexShrink: 0,
      fontSize: 18,
      color: 'text.secondary',
      transform: isExpanded ? 'rotate(90deg)' : 'none',
      transition: 'transform 150ms',
    }),
    label: {
      fontSize: 13,
      fontWeight: 500,
    },
    id: {
      fontFamily: 'monospace',
      fontSize: 11,
      color: 'text.secondary',
    },
    count: {
      ml: 'auto',
      flexShrink: 0,
      fontSize: 12,
      color: 'text.secondary',
      whiteSpace: 'nowrap',
    },
    // Indented below the header, aligned with its label
    body: {
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      gap: 1,
      pl: 2.5,
      pt: 0.5,
      pb: 1.5,
    },
  }
}
