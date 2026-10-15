export const ui = () => {
  return {
    // Same height as the segmented toggles. Shrinks first in a toolbar (before e.g. selects whose text would be cut off),
    // to about its icon and placeholder.
    field: {
      flex: '0 1000 200px',
      minWidth: 80,
      height: 28,
      pl: 0.75,
      pr: 0.25,
      gap: 0.5,
      fontSize: 12,
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      '&.Mui-focused': { borderColor: 'text.secondary' },
      '&.Mui-disabled': { opacity: 0.5 },
    },
    icon: {
      fontSize: 16,
      color: 'text.secondary',
    },
    clear: {
      p: 0.25,
    },
  }
}
