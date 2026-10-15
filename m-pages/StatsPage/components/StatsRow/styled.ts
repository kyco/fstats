import { sxListRow, sxListRowTitle } from '@/styles/styled'

export const ui = () => {
  return {
    item: {
      flexDirection: 'column',
      alignItems: 'stretch',
      // Extra space only separates rows, the last one ends at the card border
      '&:last-of-type .details': { pb: 1.25 },
    },
    row: {
      ...sxListRow,
      gap: 1,
      pl: 1.5,
      pr: 1,
    },
    // Right after the title, pushing the rest to the right
    chip: {
      mr: 'auto',
    },
    title: (hasChip: boolean, color: string, isBold: boolean) => ({
      ...sxListRowTitle,
      flexGrow: hasChip ? 0 : 1,
      color,
      fontWeight: isBold ? 700 : 400,
    }),
    // Greyed out like the transactions on deselected days in the table
    dateFiltered: {
      flexShrink: 0,
      fontSize: 15,
      color: 'text.primary',
      opacity: 0.4,
    },
    balance: {
      flexShrink: 0,
      fontSize: 13,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
    chevron: {
      flexShrink: 0,
      fontSize: 18,
      color: 'text.secondary',
      transition: 'transform 150ms',
    },
    collapse: {
      width: '100%',
    },
    details: {
      pl: 1.5,
      pr: 1.5,
      pt: 0.5,
      pb: 2,
      fontSize: 12,
    },
  }
}
