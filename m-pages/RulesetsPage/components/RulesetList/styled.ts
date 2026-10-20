import { sxTile } from '@/styles/styled'

export const ui = () => {
  return {
    card: {
      borderRadius: 2,
      p: 3,
    },
    title: {
      display: 'block',
      mb: 2,
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    },
    item: {
      position: 'relative',
    },
    // Room for the menu button (and the badge of the active one) on the right
    itemButton: (isSelected: boolean, isActive: boolean) => ({
      ...sxTile(isSelected),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 0.25,
      width: '100%',
      pr: isActive ? 14 : 6,
    }),
    name: {
      minWidth: 0,
      fontSize: 14,
      fontWeight: 500,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    // Left of the menu button
    badge: {
      position: 'absolute',
      top: '50%',
      right: 48,
      transform: 'translateY(-50%)',
      fontWeight: 600,
    },
    menuButton: {
      position: 'absolute',
      top: '50%',
      right: 8,
      transform: 'translateY(-50%)',
    },
    menuIcon: {
      fontSize: 16,
      color: 'text.secondary',
    },
    delete: {
      color: 'error.main',
    },
    deleteIcon: {
      color: 'error.main',
    },
    meta: {
      fontSize: 12,
      color: 'text.secondary',
    },
    create: {
      mt: 2,
    },
  }
}
