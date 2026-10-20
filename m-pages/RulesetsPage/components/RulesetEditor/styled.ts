export const ui = () => {
  return {
    card: {
      borderRadius: 2,
      p: { xs: 2, sm: 3 },
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
    },
    name: {
      minWidth: 0,
      fontSize: 20,
      fontWeight: 500,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    error: {
      mt: 1.5,
    },
    divider: {
      my: 2,
    },
    hint: {
      mb: 3,
      fontSize: 13,
      color: 'text.secondary',
    },
    sections: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    },
  }
}
