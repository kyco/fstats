export const ui = () => {
  return {
    tiles: {
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
      gap: 2,
    },
  }
}
