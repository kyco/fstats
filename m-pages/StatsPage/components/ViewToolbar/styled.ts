export const ui = () => {
  return {
    // Same height as the file toolbar of the left column
    toolbar: {
      flexShrink: 0,
      display: 'flex',
      // Always a single row, the search field and then the rule set select shrink instead
      flexWrap: 'nowrap',
      overflow: 'hidden',
      alignItems: 'center',
      gap: 1,
      minHeight: 40,
      px: 2,
      py: 0.5,
      borderBottom: 1,
      borderColor: 'divider',
    },
    views: {
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    },
    // Pushes the end controls and table options to the right
    spacer: {
      flexGrow: 1,
    },
    divider: {
      mx: 0.5,
      my: 0.5,
    },
  }
}
