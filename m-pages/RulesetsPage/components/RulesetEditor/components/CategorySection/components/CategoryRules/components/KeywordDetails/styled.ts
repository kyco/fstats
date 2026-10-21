export const ui = () => {
  return {
    // Below the library keyword, aligned with its name
    details: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      ml: 3.5,
      mb: 1,
      pl: 0.75,
      borderLeft: 1,
      borderColor: 'divider',
    },
    line: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 0.5,
    },
    label: {
      mr: 0.5,
      fontSize: 12,
      color: 'text.secondary',
    },
    keyword: {
      px: 0.75,
      borderRadius: '4px',
      bgcolor: 'action.selected',
      fontFamily: 'monospace',
      fontSize: 11,
      lineHeight: '20px',
    },
    example: {
      fontFamily: 'monospace',
      fontSize: 11,
      color: 'text.secondary',
      overflowWrap: 'anywhere',
    },
  }
}
