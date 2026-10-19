import { sxListRow, sxListRowTitle } from '@/styles/styled'

export const ui = () => {
  return {
    // Like the rows of the other cards (`StatsRow`), the amount below without a divider
    titleBar: {
      ...sxListRow,
      display: 'flex',
      // The close button stays at the top, with a wrapped title
      alignItems: 'flex-start',
      gap: 1,
      // Room around a wrapped title
      py: 0.75,
      pl: 1.5,
      pr: 1,
    },
    // The date above the description
    titleGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0.75,
      flexGrow: 1,
      minWidth: 0,
    },
    // Bold but grey, so it stands apart from the description
    date: {
      fontSize: 12,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
      color: 'text.secondary',
    },
    // In full, wrapped (e.g. long references)
    title: {
      ...sxListRowTitle,
      fontWeight: 700,
      whiteSpace: 'normal',
      overflowWrap: 'anywhere',
    },
    // A large enough hit area around the small icon, without taking more space
    // Centered on the first line (the date)
    closeButton: {
      p: '8px',
      m: '-8px',
      mt: '-7px',
    },
    closeIcon: {
      fontSize: 16,
      color: 'text.secondary',
    },
    // Below the description, without a divider
    summarySection: {
      px: 1.5,
      pt: 0.5,
      pb: 1.5,
    },
    amount: {
      fontSize: 20,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
    },
  }
}
