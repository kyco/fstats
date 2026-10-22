import { ui as keywordCardUi } from '../KeywordCard/styled'

// Like the library keyword cards, with a menu
export const ui = () => {
  return {
    ...keywordCardUi(),
    menuButton: {
      ml: 'auto',
      alignSelf: 'center',
      p: 0.5,
      fontSize: 16,
    },
    belongsTo: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      fontSize: 12,
      color: 'text.secondary',
    },
    menuIcon: {
      fontSize: 16,
      color: 'text.secondary',
    },
    delete: {
      color: 'error.main',
    },
  }
}
