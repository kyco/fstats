export const ui = () => {
  return {
    // Like the format selects of the parser setup, full width
    button: {
      justifyContent: 'space-between',
      minWidth: 0,
      py: 0,
      pl: 1,
      pr: 0.5,
      fontSize: 13,
      lineHeight: '30px',
      borderColor: 'divider',
      '& .MuiButton-endIcon': { ml: 0.25 },
    },
    buttonLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      minWidth: 0,
    },
    text: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    placeholder: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: 'text.secondary',
    },
    description: {
      ml: 1,
      fontSize: 12,
      color: 'text.secondary',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    // Stays in view while the options scroll
    search: {
      position: 'sticky',
      top: 0,
      zIndex: 1,
      mt: -0.5,
      mb: 0.5,
      px: 1,
      py: 0.75,
      bgcolor: 'background.paper',
      borderBottom: 1,
      borderColor: 'divider',
    },
    searchField: {
      width: '100%',
      height: 28,
      fontSize: 13,
    },
    searchIcon: {
      mr: 0.75,
      fontSize: 16,
      color: 'text.secondary',
    },
    noMatches: {
      px: 1.5,
      py: 0.5,
      fontSize: 13,
      color: 'text.secondary',
    },
    // As wide as the button, long lists scroll. More specific than the paper styles of `DropdownMenu`.
    menu: (width?: number) => ({
      '& .MuiMenu-paper.MuiPaper-root': {
        width,
        maxWidth: 'none',
        maxHeight: 360,
      },
    }),
  }
}
