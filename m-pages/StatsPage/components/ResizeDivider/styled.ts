export const ui = () => {
  return {
    divider: (axis: 'x' | 'y') =>
      ({
        position: 'relative',
        zIndex: 1,
        flexShrink: 0,
        ...(axis === 'x' ? { width: '1px', cursor: 'col-resize' } : { height: '1px', cursor: 'row-resize' }),
        bgcolor: 'divider',
        touchAction: 'none',
        // Wider hit zone, centered on the line
        '&::before': {
          content: '""',
          position: 'absolute',
          ...(axis === 'x' ? { top: 0, bottom: 0, left: -3, right: -3 } : { left: 0, right: 0, top: -3, bottom: -3 }),
        },
        '&:hover::before, &:active::before': { bgcolor: 'action.hover' },
      }) as const,
  }
}
