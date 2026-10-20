import { sxSmallCheckbox, sxSubheaderText } from '@/styles/styled'

export const ui = () => {
  return {
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    // Like a text button, the chevron before it
    toggle: {
      gap: 0.25,
      ml: -0.5,
      px: 0.5,
      py: 0.25,
      borderRadius: '4px',
      fontSize: 13,
      color: 'text.secondary',
      '&:hover': { color: 'text.primary' },
    },
    chevron: (isOpen: boolean) => ({
      fontSize: 18,
      transform: isOpen ? 'none' : 'rotate(-90deg)',
      transition: 'transform 150ms',
    }),
    options: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      mt: 1,
    },
    label: {
      ...sxSubheaderText,
      mb: 0.5,
    },
    checkboxes: {
      display: 'flex',
      gap: 2,
    },
    // Only the box and its label are clickable, not the whole width
    checkbox: {
      alignSelf: 'flex-start',
      mx: 0,
      gap: 0.5,
      '& .MuiCheckbox-root': sxSmallCheckbox,
      '& .MuiFormControlLabel-label': { fontSize: 13 },
    },
    hint: {
      mt: 0.5,
      fontSize: 12,
      lineHeight: 1.5,
      color: 'text.secondary',
    },
  }
}
