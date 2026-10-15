import { sxListRow, sxListRowTitle, sxSubheaderText } from '@/styles/styled'

export const ui = () => {
  return {
    // Like the cards of the sidebar (`StatsCard`)
    panel: {
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      overflow: 'hidden',
    },
    // Like the rows of the other cards (`StatsRow`), the amount below without a divider
    titleBar: {
      ...sxListRow,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      pl: 1.5,
      pr: 1,
    },
    title: {
      ...sxListRowTitle,
      fontWeight: 700,
    },
    // A large enough hit area around the small icon, without taking more space
    closeButton: {
      p: '8px',
      m: '-8px',
    },
    closeIcon: {
      fontSize: 16,
      color: 'text.secondary',
    },
    summarySection: {
      px: 1.5,
      pt: 0.5,
      pb: 1.5,
    },
    section: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      p: 1.5,
    },
    summary: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 1,
    },
    amount: {
      fontSize: 20,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
    },
    date: {
      fontSize: 12,
      color: 'text.secondary',
    },
    // Columns of the labels and values, shared by the sections (subgrids) so they line up
    grid: {
      display: 'grid',
      gridTemplateColumns: 'max-content minmax(0, 1fr)',
      columnGap: 2,
    },
    fullRow: {
      gridColumn: '1 / -1',
    },
    // Of the sections in the grid, with room to their fields
    heading: {
      ...sxSubheaderText,
      gridColumn: '1 / -1',
      mb: 0.5,
    },
    gridSection: {
      gridColumn: '1 / -1',
      display: 'grid',
      gridTemplateColumns: 'subgrid',
      rowGap: 1,
      p: 1.5,
    },
    // Labels and values in the columns of the grid, the values in full (e.g. long references)
    fields: {
      gridColumn: '1 / -1',
      display: 'grid',
      gridTemplateColumns: 'subgrid',
      rowGap: 0.5,
      m: 0,
      fontSize: 12,
    },
    fieldLabel: {
      color: 'text.secondary',
    },
    fieldValue: {
      m: 0,
      fontVariantNumeric: 'tabular-nums',
      overflowWrap: 'anywhere',
    },
    empty: {
      fontSize: 12,
      color: 'text.secondary',
    },
  }
}
