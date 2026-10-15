export const ui = (isMobile: boolean) => {
  return {
    switch: {
      mb: 2,
      display: 'flex',
      gap: 0.5,
      alignItems: 'center',
    },

    info: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? 1.25 : 0.5,
    },
  }
}
