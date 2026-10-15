import { sxCompactAlert } from '@/styles/styled'

export const ui = () => {
  return {
    // In place of the rows: covers the table's bottom border (drawn below the header row already) and continues its
    // side borders
    body: {
      mt: '-1px',
      p: 1.5,
      border: 1,
      borderTop: 0,
      borderColor: 'divider',
      bgcolor: 'background.default',
    },
    alert: sxCompactAlert,
  }
}
