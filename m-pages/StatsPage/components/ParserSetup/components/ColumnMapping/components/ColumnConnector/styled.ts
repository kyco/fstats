import type { Theme } from '@mui/material/styles'

const DOT_SIZE = 10 // px

export const ui = () => {
  return {
    // Fields, the space for the lines, columns
    container: {
      position: 'relative',
      width: '100%',
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(48px, 120px) minmax(0, 1fr)',
      alignItems: 'start',
      // Clicking rows shouldn't select text
      userSelect: 'none',
    },
    // Placed explicitly, the lines in between are absolutely positioned and take no cell
    fields: {
      gridColumn: 1,
    },
    columns: {
      gridColumn: 3,
    },
    fieldGroups: {
      display: 'flex',
      flexDirection: 'column',
    },
    // Below the required fields
    optionalTitle: {
      mt: 2,
    },
    listTitle: {
      mb: 0.75,
      fontSize: 12,
      color: 'text.secondary',
    },
    list: {
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      // Clips the backgrounds of the first and last row to the rounded corners
      overflow: 'hidden',
      bgcolor: 'background.paper',
      transition: 'border-color 150ms, box-shadow 150ms',
    },
    // As tall as the fields, more columns scroll
    scrollList: (height: number) => ({
      height,
      overflowY: 'auto',
    }),
    // The rows of this list connect to the selected row
    targetList: {
      borderColor: 'primary.main',
      // Two more pixels of border as a shadow (3px in all), so the rows don't move, and a soft glow around it
      boxShadow: (theme: Theme) =>
        `0 0 0 2px ${theme.vars.palette.primary.main}, 0 0 0 5px rgba(${theme.vars.palette.primary.mainChannel} / 0.2)`,
    },
    // For the chip on the list's edge, the list itself clips its rows
    listFrame: {
      position: 'relative',
    },
    targetChip: {
      position: 'absolute',
      top: 0,
      left: '50%',
      zIndex: 3,
      transform: 'translate(-50%, -50%)',
      px: 1.25,
      py: 0.5,
      borderRadius: '12px',
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.2,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    },
    row: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      minHeight: 44,
      px: 1.5,
      py: 0.75,
      cursor: 'pointer',
      '&:not(:last-of-type)': { borderBottom: 1, borderColor: 'divider' },
      '&:hover': { bgcolor: 'action.hover' },
      '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: -2 },
    },
    selectedRow: {
      bgcolor: 'action.selected',
      // The name only, not the note or example
      '& [data-label]': { fontWeight: 700 },
    },
    inactiveRow: {
      color: 'text.disabled',
      '& [data-dot]': { opacity: 0.5 },
    },
    label: {
      flexGrow: 1,
      minWidth: 0,
      fontSize: 14,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    fieldText: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      minWidth: 0,
    },
    note: {
      fontSize: 12,
      color: 'text.secondary',
    },
    action: {
      display: 'flex',
      flexShrink: 0,
    },
    // On the row's bottom edge, like the chip of the list a row can be connected to
    errorChip: {
      position: 'absolute',
      top: '100%',
      right: 32,
      zIndex: 3,
      transform: 'translateY(-50%)',
      px: 1.25,
      py: 0.5,
      borderRadius: '12px',
      bgcolor: 'error.main',
      color: 'error.contrastText',
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.2,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    },
    // Required fields without a column
    missingLabel: {
      color: 'error.main',
      fontWeight: 700,
    },
    missingIcon: {
      flexShrink: 0,
      fontSize: 18,
    },
    // Compact, for the optional fields and the columns (files can have many). Names in a smaller font.
    compactRow: {
      minHeight: 30,
      py: 0.25,
      '& > span > span:first-of-type': { fontSize: 13 },
    },
    // Slightly taller than the columns, still compact
    optionalRow: {
      minHeight: 36,
    },
    columnText: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 1,
      flexGrow: 1,
      minWidth: 0,
    },
    columnName: {
      flexGrow: 0,
      flexShrink: 0,
      maxWidth: '60%',
      fontSize: 13,
    },
    sample: {
      flexShrink: 1,
      minWidth: 0,
      fontSize: 12,
      color: 'text.secondary',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    // Larger hit area than its icon, without making the compact row taller
    removeButton: {
      flexShrink: 0,
      p: 0.75,
      my: -0.5,
      mr: -0.75,
      fontSize: 16,
      color: 'text.secondary',
    },
    // Where the lines start, inside the row so the scrolling list doesn't clip it. Above the lines.
    dot: {
      position: 'relative',
      zIndex: 2,
      flexShrink: 0,
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: '50%',
      border: 2,
      borderColor: 'text.disabled',
      bgcolor: 'background.paper',
    },
    connectedDot: {
      borderColor: 'primary.main',
      bgcolor: 'primary.main',
    },
    missingDot: {
      borderColor: 'error.main',
    },
    lines: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      zIndex: 1,
      overflow: 'visible',
      pointerEvents: 'none',
      '& path': { fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
      color: 'primary.main',
      '& path.outOfView': { strokeDasharray: '4 4', opacity: 0.6 },
    },
  }
}
