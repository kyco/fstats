import { sxSubheaderText } from '@/styles/styled'

export const ui = () => {
  return {
    group: {
      display: 'flex',
      flexDirection: 'column',
      mb: 1.5,
    },
    groupTitle: {
      ...sxSubheaderText,
      mb: 0.5,
    },
    // Label and description below each other, the radio at the top
    option: {
      alignItems: 'flex-start',
      mx: 0,
      py: 0.5,
      '& .MuiRadio-root': { p: 0.5, mr: 1 },
      '& .MuiFormControlLabel-label': { display: 'flex', flexDirection: 'column', pt: 0.5 },
    },
    optionLabel: {
      fontSize: 14,
    },
    optionDescription: {
      fontSize: 12,
      color: 'text.secondary',
    },
    name: {
      mt: 1,
    },
  }
}
