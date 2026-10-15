export const ui = () => {
  return {
    // On its own row below the text, closes the setup
    savedFile: {
      display: 'flex',
      mx: 'auto',
      mt: 0.5,
      fontWeight: 700,
      textDecoration: 'underline',
      wordBreak: 'break-all',
      '&:hover': { textDecoration: 'underline' },
    },
  }
}
