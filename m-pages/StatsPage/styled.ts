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
  }
}
