export const ui = () => {
  return {
    tiles: {
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
      gap: 2,
      width: { xs: '100%', md: `${(8 / 12) * 100}%` },
    },

    hint: {
      display: 'block',
      mt: 2,
    },
  }
}
