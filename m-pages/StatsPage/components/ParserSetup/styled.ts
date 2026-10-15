import { ui as toolbarUi } from '../ViewToolbar/styled'

/**
 * Alerts in the steps and the preview, compact and the same size. Alerts are `body2`, which has a bottom margin in the
 * theme.
 */
export const sxCompactAlert = {
  mb: 0,
  py: 0.5,
  alignItems: 'center',
  fontSize: 14,
  '& .MuiAlert-icon': { py: 0, fontSize: 20 },
  '& .MuiAlert-message': { py: 0.75 },
} as const

export const ui = () => {
  return {
    // Same as the other views, so the toolbar doesn't change when switching
    toolbar: toolbarUi().toolbar,
    // Like the view switches of the other views' toolbars
    title: {
      flexGrow: 1,
      minWidth: 0,
      m: 0,
      fontSize: 13,
      fontWeight: 700,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    closeButton: {
      mr: -0.75,
    },
    closeIcon: {
      fontSize: 18,
    },
    // On its own row below the text, closes the setup
    savedFile: {
      display: 'flex',
      mx: 'auto',
      mt: 0.5,
      fontWeight: 700,
      textDecoration: 'underline',
      wordBreak: 'break-all',
      '&:hover': { textDecoration: 'underline' },
    },
    scroll: {
      flexGrow: 1,
      minHeight: 0,
      overflowY: 'auto',
      p: 2,
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      pb: 2,
      // The preview's margin is for sections of other files below it, the stepper follows more closely here
      '& > section': { mb: 1 },
      // Small fields place their empty label for their own height, the theme makes inputs taller (48px)
      '& .MuiInputLabel-sizeSmall:not(.MuiInputLabel-shrink)': { transform: 'translate(14px, 12px) scale(1)' },
    },
    // Subtle, it only shows the progress
    stepper: {
      mt: 1,
      mb: 2,
      // From border to border of the view, like the dividers between sections
      mx: -2,
      // Half as long as the connectors between steps, so the steps are spread evenly
      '&::before, &::after': {
        content: '""',
        flex: '0.5 1 0',
        borderTop: 1,
        borderColor: 'divider',
      },
      // Labels are `body2`, which has a bottom margin in the theme
      '& .MuiStepLabel-label': { m: 0, fontSize: 13, color: 'text.disabled' },
      // The current step stands out, the completed ones less, the next ones least
      '& .MuiStepLabel-label.Mui-completed': { color: 'text.secondary', fontWeight: 400 },
      '& .MuiStepLabel-label.Mui-active': { color: 'text.primary', fontWeight: 500 },
      '& .MuiStepLabel-iconContainer': { display: 'flex', pr: 0.75 },
      '& .MuiStepConnector-root': { flex: '1 1 0' },
      // Reached steps can be clicked, also the furthest one when going back, which isn't completed. More specific than
      // the colors above and of `StepIcon`.
      '& .MuiStepLabel-root[role="button"]': {
        cursor: 'pointer',
        '& .MuiStepLabel-label': { color: 'text.secondary' },
        '& .MuiStepLabel-iconContainer > span': { bgcolor: 'text.secondary' },
      },
      '& .MuiStepLabel-root[role="button"]:hover': {
        '& .MuiStepLabel-label': { color: 'text.primary' },
        '& .MuiStepLabel-iconContainer > span': { bgcolor: 'text.primary' },
      },
      '& .MuiStepConnector-line': { borderColor: 'divider' },
    },
    problem: sxCompactAlert,
    tabs: {
      minHeight: 32,
      mb: 1.5,
      borderBottom: 1,
      borderColor: 'divider',
    },
    // Of the parts of a step, e.g. the row with the column names
    tab: {
      minHeight: 32,
      py: 0.5,
      fontSize: 13,
      textTransform: 'none',
    },
  }
}
