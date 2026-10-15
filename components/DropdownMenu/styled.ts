export const ui = () => {
  return {
    menu: {
      '& .MuiMenu-paper': {
        minWidth: 180,
        maxWidth: 300,
        borderRadius: '6px',
        border: 1,
        borderColor: 'divider',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
      '& .MuiMenu-list': {
        py: 0.5,
      },
    },
  }
}
