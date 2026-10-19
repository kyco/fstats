import type { ProfitLossRowVariant } from '@/types'

const LABEL_WIDTH = 240 // px

const INDENT: Record<ProfitLossRowVariant, number> = {
  category: 0,
  subcategory: 3.5,
  transaction: 3.5,
  total: 0,
  net: 0,
  rate: 0,
}

const cell = {
  px: 1,
  py: 0.5,
  fontSize: 13,
  lineHeight: 1.5,
  fontWeight: 400,
  whiteSpace: 'nowrap',
  borderBottom: 1,
  borderColor: 'divider',
} as const

// Stays in place when scrolling the periods horizontally
const stickyLabel = {
  position: 'sticky',
  left: 0,
  zIndex: 1,
  bgcolor: 'background.paper',
  textAlign: 'left',
} as const

export const ui = () => {
  return {
    scroll: {
      overflowX: 'auto',
      border: 1,
      borderColor: 'divider',
    },
    table: {
      minWidth: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      fontVariantNumeric: 'tabular-nums',
      // The card border replaces the last row's border
      '& tbody:last-of-type tr:last-of-type > *': { borderBottom: 0 },
      // A solid rule above the net rows, like an income statement
      '& tr:has(+ tr[data-variant="net"]) > *': { borderBottomColor: 'text.primary' },
      // The internal transfers are apart from the income statement above them
      '& tbody + tbody > tr:first-of-type > *': { pt: 3 },
    },
    header: {
      ...cell,
      fontSize: 12,
      fontWeight: 500,
      color: 'text.secondary',
      textAlign: 'right' as const,
    },
    headerLabel: {
      ...cell,
      ...stickyLabel,
      width: LABEL_WIDTH,
      minWidth: LABEL_WIDTH,
      maxWidth: LABEL_WIDTH,
      fontSize: 12,
      fontWeight: 500,
      color: 'text.secondary',
    },
    sectionCell: {
      ...cell,
      ...stickyLabel,
      pt: 2,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: 'text.secondary',
    },
    sectionNote: {
      ...cell,
      pt: 2,
      fontSize: 12,
      color: 'text.secondary',
    },
    row: {
      '&:hover > *': { bgcolor: 'action.hover' },
    },
    expandable: {
      cursor: 'pointer',
    },
    labelCell: (variant: ProfitLossRowVariant) => ({
      ...cell,
      ...stickyLabel,
      width: LABEL_WIDTH,
      minWidth: LABEL_WIDTH,
      maxWidth: LABEL_WIDTH,
      pl: 1 + INDENT[variant],
      fontWeight: variant === 'total' || variant === 'net' ? 700 : 400,
      fontSize: variant === 'subcategory' || variant === 'transaction' ? 12 : 13,
      color:
        variant === 'subcategory' || variant === 'transaction' || variant === 'rate'
          ? 'text.secondary'
          : 'text.primary',
    }),
    labelContent: (variant: ProfitLossRowVariant) => ({
      // The cell's width without its padding (8px per spacing unit)
      width: LABEL_WIDTH - (2 + INDENT[variant]) * 8,
      overflow: 'hidden',
    }),
    labelText: {
      display: 'block',
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    expandButton: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      maxWidth: '100%',
      ml: -0.5,
      font: 'inherit',
      color: 'inherit',
      textAlign: 'left',
      '&.Mui-focusVisible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 1, borderRadius: 0.5 },
    },
    chevron: {
      flexShrink: 0,
      fontSize: 16,
      color: 'text.secondary',
      transition: 'transform 150ms',
    },
    chevronIndent: {
      display: 'block',
      pl: 2,
    },
    amount: (variant: ProfitLossRowVariant) => ({
      ...cell,
      textAlign: 'right' as const,
      fontWeight: variant === 'total' || variant === 'net' ? 700 : 400,
      fontSize: variant === 'subcategory' || variant === 'transaction' ? 12 : 13,
    }),
  }
}
