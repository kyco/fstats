export const ui = () => {
  return {
    // Over the whole transaction details, the card at the top so it's in view
    overlay: {
      position: 'absolute',
      inset: 0,
      zIndex: 2,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      p: 1.5,
      pt: 6,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    card: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      width: '100%',
      maxWidth: 320,
      p: 2,
      borderRadius: '6px',
      bgcolor: 'background.paper',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    },
    title: {
      fontSize: 14,
      fontWeight: 700,
    },
    text: {
      fontSize: 12,
      color: 'text.secondary',
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 1,
      mt: 1,
    },
  }
}
