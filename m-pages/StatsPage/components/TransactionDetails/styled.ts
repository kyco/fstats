import { sxSubheaderText } from '@/styles/styled'

export const ui = () => {
  return {
    // Like the cards of the sidebar (`StatsCard`)
    // Relative for the overlay asking to discard the category form
    panel: {
      position: 'relative',
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      overflow: 'hidden',
    },
    section: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      p: 1.5,
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
