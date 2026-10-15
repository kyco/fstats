export const ui = () => {
  return {
    // Fills the viewport: the demo banner on top, the columns below it
    dropzone: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    },
    container: {
      display: 'flex',
      flexGrow: 1,
      minHeight: 0,
      width: '100%',
    },
    // Each column has its own scroll container, below its toolbar if it has one
    column: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      height: '100%',
      overflow: 'auto',
    },
    divider: {
      position: 'relative',
      zIndex: 1,
      flexShrink: 0,
      width: '1px',
      cursor: 'col-resize',
      bgcolor: 'divider',
      touchAction: 'none',
      // Wider hit zone, centered on the line
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: -3,
        right: -3,
      },
      '&:hover::before, &:active::before': { bgcolor: 'action.hover' },
    },
  }
}
