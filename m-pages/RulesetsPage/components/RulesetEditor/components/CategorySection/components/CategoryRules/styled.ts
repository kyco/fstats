export const ui = () => {
  return {
    // Below the subcategory, indented like its name
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      ml: 7.5,
      mb: 1,
      pl: 0.75,
      borderLeft: 2,
      borderColor: 'divider',
    },
    // The menu button is shown on hover (always on touch devices)
    row: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      minHeight: 32,
      pl: 0.75,
      pr: 0.5,
      borderRadius: '6px',
      fontSize: 13,
      '&:hover': { bgcolor: 'action.hover' },
      '@media (hover: hover)': {
        '&:not(:hover):not(:focus-within) .row-menu': { opacity: 0 },
      },
    },
    ref: {
      flexShrink: 0,
      width: 56,
      fontSize: 12,
      fontVariantNumeric: 'tabular-nums',
      color: 'text.secondary',
    },
    condition: {
      flexShrink: 0,
      fontSize: 12,
      color: 'text.secondary',
      whiteSpace: 'nowrap',
    },
    keyword: {
      flexGrow: 1,
      minWidth: 0,
      fontWeight: 500,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    // The name of a tag or library keyword, expanding to its library keywords
    toggle: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.25,
      flexGrow: 1,
      minWidth: 0,
      justifyContent: 'flex-start',
      textAlign: 'left',
    },
    // Underlined, it expands like a link opens
    toggleName: {
      minWidth: 0,
      fontWeight: 500,
      textDecoration: 'underline',
      textUnderlineOffset: 2,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    // Below the tag, aligned with its name
    expanded: {
      display: 'flex',
      flexDirection: 'column',
      ml: 14,
      mb: 0.5,
      pl: 0.75,
      borderLeft: 1,
      borderColor: 'divider',
    },
    expandedKeyword: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      minHeight: 28,
      fontSize: 12,
    },
    // Underlined, it expands like a link opens
    expandedName: {
      fontSize: 12,
      fontWeight: 500,
      textDecoration: 'underline',
      textUnderlineOffset: 2,
    },
    direction: {
      flexShrink: 0,
      fontSize: 12,
      color: 'text.secondary',
      whiteSpace: 'nowrap',
    },
    menuButton: {
      flexShrink: 0,
      transition: 'opacity 150ms',
      p: 0.5,
      fontSize: 16,
    },
    adds: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 0.5,
    },
    // Like "Add subcategory", aligned with the rows
    add: {
      fontSize: 12,
    },
    empty: {
      py: 0.75,
      fontSize: 13,
      color: 'text.secondary',
    },
  }
}
