export const ui = () => {
  return {
    // Like `DropdownMenu`
    paper: {
      width: 360,
      maxWidth: 'calc(100vw - 32px)',
      // Scrolls when taller than the window
      maxHeight: 'calc(100vh - 32px)',
      overflowY: 'auto',
      mt: 0.5,
      borderRadius: '6px',
      border: 1,
      borderColor: 'divider',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    },
  }
}
