export const ui = () => {
  return {
    card: {
      borderRadius: 2,
      p: { xs: 2, sm: 3 },
    },
    title: {
      mb: 1.5,
      fontSize: 20,
      fontWeight: 500,
    },
    description: {
      mb: 1.5,
      fontSize: 13,
      color: 'text.secondary',
    },
    toolbar: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 1.5,
      mt: 2.5,
      mb: 1.5,
    },
    search: {
      flexGrow: 1,
      minWidth: 200,
      '& .MuiInputBase-root': { height: 32, fontSize: 13 },
    },
    searchIcon: {
      fontSize: 18,
    },
    counts: {
      fontSize: 12,
      color: 'text.secondary',
    },
    sectionTitle: {
      mt: 2.5,
      mb: 1,
      fontSize: 12,
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: 'text.secondary',
    },
    addRule: {
      mb: 1,
    },
    note: {
      mb: 1,
      fontSize: 12,
      color: 'text.secondary',
    },
    rules: {
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      gap: 1,
    },
    group: {
      mb: 2,
    },
    groupTitle: {
      mt: 1,
      mb: 0.5,
      fontSize: 13,
      fontWeight: 600,
    },
    found: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    },
    empty: {
      py: 1,
      fontSize: 13,
      color: 'text.secondary',
    },
  }
}
