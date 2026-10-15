import { sxTile } from '@/styles/styled'

export const ui = () => {
  return {
    // Icon on the left of the title and the current value
    tile: {
      ...sxTile(),
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      width: '100%',
    },

    iconCircle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: 40,
      height: 40,
      borderRadius: '50%',
      bgcolor: 'action.hover',
      color: 'secondary.main',
      '& svg': { fontSize: 22 },
    },

    text: {
      flexGrow: 1,
      minWidth: 0,
    },

    tileTitle: {
      display: 'block',
      color: 'text.secondary',
      lineHeight: 1.4,
    },

    value: {
      fontSize: 15,
      fontWeight: 500,
      color: 'text.primary',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    chevron: {
      flexShrink: 0,
      fontSize: 20,
      color: 'text.secondary',
    },
  }
}
