import { sxSmallCheckbox, sxSubheaderText } from '@/styles/styled'

// Like the rule form of the category editor (stats page)
export const ui = () => {
  return {
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2.5,
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 0.75,
    },
    label: sxSubheaderText,
    // Match type and keyword in a row
    condition: {
      display: 'flex',
      alignItems: 'flex-start',
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
    // As tall as the select
    input: {
      '& .MuiInputBase-root': { height: 32, fontSize: 13 },
      '& .MuiInputBase-input': { px: 1 },
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
