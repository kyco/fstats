import { sxSubheaderText } from '@/styles/styled'

export const ui = () => {
  return {
    title: {
      ...sxSubheaderText,
      mb: 1,
    },
    description: {
      mb: 2,
      fontSize: 13,
      color: 'text.secondary',
    },
    toolbar: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 1.5,
      mb: 1.5,
    },
    search: {
      flexGrow: 1,
      minWidth: 200,
      '& .MuiInputBase-root': { height: 32, fontSize: 13 },
    },
    searchIcon: {
      fontSize: 18,
    },
    // A heading with its hints
    group: {
      py: 0.5,
      borderBottom: 1,
      borderColor: 'divider',
    },
    groupTitle: {
      mt: 0.5,
      mb: 0.25,
      fontSize: 12,
      fontWeight: 600,
      color: 'text.secondary',
    },
    empty: {
      py: 1,
      fontSize: 13,
      color: 'text.secondary',
    },
  }
}
