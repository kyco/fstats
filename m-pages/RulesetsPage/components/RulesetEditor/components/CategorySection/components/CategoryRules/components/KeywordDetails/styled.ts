export const ui = () => {
  return {
    // Below the library keyword, aligned with its name
    details: {
      display: 'flex',
      flexDirection: 'column',
      ml: 3.5,
      mb: 0.75,
    },
    // Like the rows of rules
    row: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      minHeight: 26,
      fontSize: 12,
    },
    condition: {
      flexShrink: 0,
      color: 'text.secondary',
      whiteSpace: 'nowrap',
    },
    keyword: {
      minWidth: 0,
      fontWeight: 500,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    // Limits, e.g. "Money in only"
    footer: {
      pt: 0.25,
      fontSize: 11,
      color: 'text.secondary',
      overflowWrap: 'anywhere',
    },
  }
}
