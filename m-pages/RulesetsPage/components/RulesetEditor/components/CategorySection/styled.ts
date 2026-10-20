import { sxSubheaderText } from '@/styles/styled'

export const ui = () => {
  return {
    title: {
      ...sxSubheaderText,
      mb: 1,
    },
    parent: {
      py: 0.5,
      borderBottom: 1,
      borderColor: 'divider',
    },
    // Below the subcategories, aligned with their names
    addChild: {
      ml: 2.5,
      mb: 0.5,
      fontSize: 12,
    },
    menuIcon: {
      fontSize: 16,
      color: 'text.secondary',
    },
    delete: {
      color: 'error.main',
    },
    add: {
      mt: 1,
    },
  }
}
