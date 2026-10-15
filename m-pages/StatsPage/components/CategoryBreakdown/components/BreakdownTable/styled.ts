export const ui = () => {
  const tableHeader = {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    height: '100%',
    fontSize: 12,
    fontWeight: 'medium',
    color: 'text.secondary',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  } as const

  return {
    tableHeader: tableHeader,
    totalHeader: {
      ...tableHeader,
      justifyContent: 'flex-end',
    },
    // Not sortable
    percentHeader: {
      ...tableHeader,
      justifyContent: 'flex-end',
      cursor: 'default',
    },

    tableHeaderContent: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
    },
    emptyText: {
      fontSize: 13,
      mb: 0,
      color: 'text.secondary',
      ml: 1,
      mt: 1,
    },
  }
}
