import type { Theme } from '@mui/material/styles'

import { ROW_HEIGHT } from './actions'

export const ui = () => {
  return {
    wrapper: (hasHeader: boolean, isScrollable: boolean) => ({
      border: 1,
      borderColor: 'divider',
      // The header row draws the top border, see `table`
      ...(hasHeader ? { borderTop: 0 } : null),
      ...(isScrollable ? { overflowX: 'auto' } : null),
    }),
    table: {
      // Fixed layout, so column widths don't change as rows are virtualized
      tableLayout: 'fixed',
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 12,
      // Fixed height, so content like the duplicate tag doesn't change it
      '& th, & td': {
        height: ROW_HEIGHT,
        px: 1,
        py: 0,
        verticalAlign: 'middle',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: 'left',
        borderBottom: 1,
        borderColor: 'divider',
      },
      // Collapsed borders don't move with sticky cells, so they are drawn as shadows, including the wrapper's top
      // border which would scroll away. Also when not sticky, so the header row is always the same height.
      '& th': {
        position: 'sticky',
        zIndex: 1,
        // Plus the two borders drawn inside, so it's as tall as a row with its border
        height: ROW_HEIGHT + 2,
        borderBottom: 0,
        boxShadow: (theme: Theme) =>
          `inset 0 1px 0 ${theme.vars.palette.divider}, inset 0 -1px 0 ${theme.vars.palette.divider}`,
        fontWeight: 'medium',
        // Opaque, so rows don't show through a sticky header
        bgcolor: 'background.default',
        backgroundImage: (theme: Theme) =>
          `linear-gradient(${theme.vars.palette.action.hover}, ${theme.vars.palette.action.hover})`,
      },
      '& tr.spacer td': {
        height: 'auto',
        p: 0,
        border: 0,
      },
      '& tbody tr:last-of-type td': {
        borderBottom: 0,
      },
      '& tbody tr:not(.spacer):hover': {
        bgcolor: 'action.hover',
      },
      // Search matches
      '& mark': (theme: Theme) => ({
        color: 'inherit',
        backgroundColor: '#fde68a',
        borderRadius: '2px',
        ...theme.applyStyles('dark', { backgroundColor: 'rgba(250, 204, 21, 0.4)' }),
      }),
    },
  }
}
