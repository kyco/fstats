import { sxSubheaderText } from '@/styles/styled'

// Like the fields of the rule dialog
export const ui = () => {
  return {
    field: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 0.75,
    },
    label: sxSubheaderText,
    note: {
      fontSize: 12,
      color: 'text.secondary',
    },
    // Rule set name and its category select in a row
    mapping: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)',
      alignItems: 'center',
      gap: 1,
    },
    rulesetName: {
      fontSize: 13,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  }
}
