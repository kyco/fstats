export const ui = () => {
  return {
    section: {
      scrollMarginTop: 16,
      borderBottom: 1,
      borderColor: 'divider',
    },
    // Highlighted when linked
    row: (isTarget: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      borderRadius: '6px',
      bgcolor: isTarget ? 'action.selected' : 'transparent',
    }),
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      flexGrow: 1,
      minWidth: 0,
      minHeight: 38,
      px: 0.5,
      justifyContent: 'flex-start',
      textAlign: 'left',
      borderRadius: '6px',
      '&:hover': { bgcolor: 'action.hover' },
    },
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
    // Of the active rule set, dimmed when not mapped
    mapping: (isEmpty: boolean) => ({
      ml: 'auto',
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: 12,
      color: isEmpty ? 'text.disabled' : 'text.secondary',
    }),
    editButton: {
      flexShrink: 0,
      p: 0.5,
      fontSize: 16,
    },
    count: {
      flexShrink: 0,
      fontSize: 12,
      color: 'text.secondary',
      whiteSpace: 'nowrap',
    },
    // Below the cards, across the columns
    addRule: {
      gridColumn: '1 / -1',
      justifySelf: 'start',
      fontSize: 12,
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
