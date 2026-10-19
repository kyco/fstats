export const ui = () => {
  const row = {
    display: 'flex',
    alignItems: 'center',
    gap: 0.25,
    height: 30,
    pr: 1.5,
    cursor: 'pointer',
    userSelect: 'none',
    '&:hover': { bgcolor: 'action.hover' },
  } as const

  const disabledRow = {
    cursor: 'default',
    color: 'text.disabled',
    '&:hover': { bgcolor: 'transparent' },
  } as const

  const label = {
    flexGrow: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const

  return {
    // On the right of the toolbar
    button: {
      mr: -0.75,
    },
    icon: {
      fontSize: 18,
    },
    // Like `DropdownMenu`, wide enough for the columns
    paper: {
      width: 'min(840px, calc(100vw - 32px))',
      mt: 0.5,
      borderRadius: '6px',
      border: 1,
      borderColor: 'divider',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    },
    // Options, money in and money out side by side in equal columns, stacked on small screens
    columns: {
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
      '& > * + *': {
        borderLeft: { xs: 0, sm: 1 },
        borderTop: { xs: 1, sm: 0 },
        // Responsive, so it's set after the responsive `border*` shorthands, which reset the color to `currentColor`
        borderColor: { xs: 'divider', sm: 'divider' },
      },
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      py: 0.5,
    },
    // Same height as the rows, so the columns line up
    header: {
      display: 'flex',
      alignItems: 'center',
      height: 30,
      px: 1.5,
      fontSize: 11,
      fontWeight: 'medium',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: 'text.secondary',
    },
    // Currencies above the switches
    // Why the options of a section don't apply to the view
    sectionNote: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 0.75,
      px: 1.5,
      mt: -0.5,
      mb: 0.5,
      fontSize: 12,
      color: 'text.disabled',
    },
    // Aligned with the first line of the note
    noteIcon: {
      flexShrink: 0,
      mt: '2px',
      fontSize: 14,
    },
    section: {
      display: 'flex',
      flexDirection: 'column',
      '& + *': { mt: 0.5 },
    },
    scroll: {
      maxHeight: { sm: 'min(480px, 60vh)' },
      overflowY: 'auto',
    },
    // Same as the rows of the date explorer
    row: (isDisabled: boolean) => ({
      ...row,
      ...(isDisabled ? disabledRow : null),
    }),
    optionRow: (isDisabled: boolean) => ({
      ...row,
      gap: 1,
      pl: 1.5,
      ...(isDisabled ? disabledRow : null),
    }),
    // Money in or out, on the left like the years of the date explorer
    groupRow: {
      pl: '4px',
    },
    groupLabel: {
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    },
    parentRow: {
      pl: '6px',
    },
    childRow: {
      pl: '28px',
    },
    label: label,
    categoryLabel: (isDeselected: boolean, isParent: boolean) => ({
      ...label,
      color: isDeselected ? 'text.disabled' : 'text.primary',
      // Deselected parents aren't emphasized, like deselected months
      fontWeight: isParent && !isDeselected ? 600 : 400,
    }),
    // Counts of money in and out of a category with both, next to its count
    flows: {
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      ml: 1,
      fontSize: 11,
      color: 'text.disabled',
      fontVariantNumeric: 'tabular-nums',
    },
    flowIcon: {
      fontSize: 11,
      '&:not(:first-of-type)': { ml: 0.5 },
    },
    count: {
      flexShrink: 0,
      ml: 1,
      fontSize: 12,
      color: 'text.secondary',
      fontVariantNumeric: 'tabular-nums',
    },
    emptyCount: {
      color: 'text.disabled',
    },
    expandIcon: {
      display: 'flex',
      flexShrink: 0,
      justifyContent: 'center',
      width: 22,
      color: 'text.secondary',
      '& .MuiSvgIcon-root': { fontSize: 18, transition: 'transform 150ms' },
    },
    expandSpacer: {
      flexShrink: 0,
      width: 22,
    },
    // Like `OutlineCheckbox`
    radio: {
      flexShrink: 0,
      p: 0.5,
      ml: -0.5,
      color: 'action.disabled',
      // The row handles the click
      pointerEvents: 'none',
      '& .MuiSvgIcon-root': { fontSize: 18 },
      '&.Mui-checked': { color: 'text.secondary' },
    },
    // Smaller than the small switch, to fit the compact rows
    switch: {
      width: 32,
      height: 20,
      p: 0.5,
      ml: -0.5,
      // The row handles the click
      pointerEvents: 'none',
      '& .MuiSwitch-switchBase': { p: 0.5 },
      '& .MuiSwitch-switchBase.Mui-checked': { transform: 'translateX(12px)' },
      '& .MuiSwitch-thumb': { width: 12, height: 12 },
    },
  }
}
