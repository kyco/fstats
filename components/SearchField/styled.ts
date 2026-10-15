export const ui = () => {
  return {
    // Same height as the segmented toggles
    field: {
      height: 28,
      width: 200,
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
