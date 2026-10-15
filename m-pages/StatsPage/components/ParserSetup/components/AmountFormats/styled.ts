import { sxCompactAlert } from '@/styles/styled'

export const ui = () => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
    },
    fields: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 3,
    },
    alert: sxCompactAlert,
    field: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      fontSize: 14,
    },
  }
}
