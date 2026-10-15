import { sxListRowTitle } from '@/styles/styled'

export const ui = () => {
  return {
    // Like `DropdownMenu`
    paper: {
      width: 360,
      maxWidth: 'calc(100vw - 32px)',
      // Scrolls when taller than the window
      maxHeight: 'calc(100vh - 32px)',
      overflowY: 'auto',
      mt: 0.5,
      borderRadius: '6px',
      border: 1,
      borderColor: 'divider',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    },
    // Like the header of the transaction details
    // Close to where the category is from, into the padding of the editor below
    header: {
      px: 1.5,
      pt: 1.5,
      mb: -1,
    },
    title: {
      ...sxListRowTitle,
      fontWeight: 700,
    },
  }
}
