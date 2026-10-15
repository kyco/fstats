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
    // Right below the toggle, like the notice below the keyword
    applyNotice: {
      mt: -1.25,
    },
    noticeIcon: {
      fontSize: 16,
    },
    checkboxes: {
      display: 'flex',
      gap: 2,
    },
    checkbox: {
      mx: 0,
      gap: 0.5,
      '& .MuiCheckbox-root': sxSmallCheckbox,
      '& .MuiFormControlLabel-label': { fontSize: 13 },
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
    error: {
      fontSize: 12,
      color: 'error.main',
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 1,
    },
  }
}
