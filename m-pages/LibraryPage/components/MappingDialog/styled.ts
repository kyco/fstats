import { sxSubheaderText } from '@/styles/styled'

export const ui = () => {
  return {
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
    note: {
      fontSize: 13,
      color: 'text.secondary',
    },
    ruleset: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0.75,
    },
    rulesetName: {
      fontSize: 13,
      fontWeight: 500,
    },
    // Money out and in side by side
    directions: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
      gap: 1,
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
    },
    label: sxSubheaderText,
  }
}
