export const ui = () => {
  return {
    item: (isActive: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      fontSize: 13,
      color: 'text.secondary',
      '&:hover': { color: 'text.primary' },
      ...(isActive ? { fontWeight: 700, color: 'text.primary' } : null),
    }),
    // Always as wide as the wider of the regular and bold label (either can be wider due to kerning), so selecting an
    // option doesn't shift the layout. The hidden copies and the text share one grid cell.
    label: {
      display: 'inline-grid',
      '& > *, &::before, &::after': { gridArea: '1 / 1' },
      '&::before, &::after': {
        content: 'attr(data-label)',
        visibility: 'hidden',
        userSelect: 'none',
        pointerEvents: 'none',
      },
      '&::before': { fontWeight: 400 },
      '&::after': { fontWeight: 700 },
    },
    radio: {
      fontSize: 16,
    },
  }
}
