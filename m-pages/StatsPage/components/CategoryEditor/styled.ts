import type { Theme } from '@mui/material/styles'

import type { GradientColorsLightDark } from '@/types'
import { ColorMode } from '@/types-enums'
import { sxSmallCheckbox, sxSubheaderText } from '@/styles/styled'

export const ui = (theme: Theme) => {
  return {
    section: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 0.75,
      p: 1.5,
    },
    // Pressed while the form is open
    // The button and the box of the form below it, full width
    tabs: {
      alignSelf: 'stretch',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      mt: 0.5,
    },
    tab: {
      borderColor: 'divider',
      borderRadius: '6px',
    },
    // The form in a box below the button
    tabCard: {
      alignSelf: 'stretch',
      mt: 1,
      p: 1.5,
      border: 1,
      borderColor: 'divider',
      borderRadius: '6px',
    },
    chevron: (isOpen: boolean) => ({
      color: 'text.secondary',
      transform: isOpen ? 'rotate(180deg)' : 'none',
      transition: 'transform 150ms',
    }),
    // The fields full width
    form: {
      display: 'flex',
      flexDirection: 'column',
      alignSelf: 'stretch',
      gap: 2.5,
    },
    // From edge to edge of the menu, into the section padding
    menuDivider: {
      alignSelf: 'stretch',
      mx: -1.5,
      my: 0.75,
    },
    // From edge to edge of the menu
    actionsDivider: {
      alignSelf: 'stretch',
      mx: -1.5,
      mt: 0.75,
    },
    // The category, bold, on the line of where it's from
    current: {
      minWidth: 0,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.75,
      fontSize: 13,
      fontWeight: 600,
      color: 'text.primary',
    },
    body: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      p: 1.5,
    },
    source: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: 0.75,
      minHeight: 24,
      fontSize: 12,
      color: 'text.secondary',
    },
    sourceText: {
      flexBasis: '100%',
    },
    sourceAction: {
      minWidth: 0,
      py: 0,
      px: 0.5,
      fontSize: 12,
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 0.75,
      // The toggle keeps its width
      '& > .MuiToggleButtonGroup-root': { alignSelf: 'flex-start' },
    },
    // Like the headers of the filters
    label: sxSubheaderText,
    // As tall as the selects
    input: {
      '& .MuiInputBase-root': { height: 32, fontSize: 13 },
      '& .MuiInputBase-input': { px: 1 },
    },
    // Match type and keyword in a row
    condition: {
      display: 'flex',
      gap: 1,
      '& > .MuiTextField-root': { flexGrow: 1, minWidth: 0 },
    },
    matchSelect: {
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      // Fits the longest match type, e.g. "Matches exactly"
      width: 140,
    },
    // How many transactions the rule matches, a warning when not the edited one
    notice: (isMatch: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      mt: 0.75,
      px: 1.25,
      py: 0.75,
      borderRadius: '6px',
      fontSize: 12,
      color: isMatch ? 'info.main' : 'warning.main',
      bgcolor: `rgba(${isMatch ? theme.vars.palette.info.mainChannel : theme.vars.palette.warning.mainChannel} / 0.08)`,
    }),
    // Below another notice, only the gap of the field
    nextNotice: {
      mt: 0,
    },
    // After the count of the matches, asks to show them in the table
    matchesLink: {
      p: 0,
      ml: 0.75,
      border: 0,
      font: 'inherit',
      color: 'inherit',
      background: 'none',
      textDecoration: 'underline',
      textUnderlineOffset: '2px',
      cursor: 'pointer',
    },
    noticeText: {
      flexGrow: 1,
    },
    // Which match the table is scrolled to, with buttons to the previous and next one
    matchNav: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.25,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    matchNavButton: {
      p: 0.25,
      fontSize: 18,
    },
    // Asks before moving the form to the sidebar, a card below the count
    confirm: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      px: 1.25,
      py: 1,
      border: 1,
      borderColor: 'divider',
      borderRadius: '6px',
      fontSize: 12,
      color: 'text.secondary',
    },
    confirmActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 0.5,
    },
    // As small as the text, like the action next to where the category is from
    confirmButton: {
      minWidth: 0,
      py: 0,
      px: 1,
      fontSize: 12,
      lineHeight: '22px',
    },
    // Right below the toggle, like the notice below the keyword
    applyNotice: {
      mt: -1.25,
    },
    noticeIcon: {
      fontSize: 16,
    },
    dot: (color?: GradientColorsLightDark) => ({
      flexShrink: 0,
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: color ? color.light.start : theme.vars.palette.grey[400],
      [theme.getColorSchemeSelector(ColorMode.DARK)]: {
        backgroundColor: color ? color.dark.end : theme.vars.palette.grey[600],
      },
    }),
    // Where the rule is saved, below the fields
    saveTo: {
      mt: -1,
      fontSize: 12,
      color: 'text.secondary',
    },
    error: {
      fontSize: 12,
      color: 'error.main',
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 1,
    },
    // Only the box and its label are clickable, not the whole width
    checkbox: {
      alignSelf: 'flex-start',
      mx: 0,
      gap: 0.5,
      '& .MuiCheckbox-root': sxSmallCheckbox,
      '& .MuiFormControlLabel-label': { fontSize: 13 },
    },
  }
}
