export const ui = () => {
  return {
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      // Distance of the content from the top, on top of its own padding
      pt: 13,
    },
    // Slightly padded, so the hover effect starts just before the pointer reaches the content
    content: (isClickable: boolean) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      maxWidth: 560,
      px: 3,
      py: 3,
      textAlign: 'center',
      ...(isClickable && {
        cursor: 'pointer',
        '&:hover .empty-icon-circle': { bgcolor: 'action.selected', transform: 'scale(1.08)' },
        '&:hover .empty-icon': { color: 'primary.main' },
      }),
    }),
    iconCircle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 80,
      height: 80,
      mb: 1,
      borderRadius: '50%',
      bgcolor: 'action.hover',
      transition: 'background-color 0.2s, transform 0.2s',
    },
    icon: {
      fontSize: 40,
      color: 'text.secondary',
      transition: 'color 0.2s',
    },
    subtitle: {
      maxWidth: 320,
    },
    actions: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      // Same as the space above the first action: content padding plus margin
      gap: 6,
      mt: 3,
    },
  }
}
