export const ui = () => {
  return {
    group: (disabled = false) => ({
      height: 28,
      opacity: disabled ? 0.5 : 1,
    }),
    button: {
      px: 1.25,
      py: 0,
      fontSize: 12,
      textTransform: 'none',
    },
    tooltipWrapper: {
      display: 'inline-flex',
    },
  }
}
