import { sxSmallCheckbox } from '@/styles/styled'

export const ui = () => {
  return {
    // Like the format selects of the parser setup
    // Shrinks once the search field of the toolbar can't, the name is cut off. Its share while the search field shrinks
    // is below a pixel fraction, which would already show the ellipsis.
    button: {
      flexShrink: 0.01,
      // Still shows the start of the name next to the icons
      minWidth: 80,
      maxWidth: 200,
      py: 0,
      pl: 1,
      pr: 0.5,
      fontSize: 12,
      lineHeight: '24px',
      borderColor: 'divider',
      '& .MuiButton-startIcon': { mr: 0.5, '& > svg': { fontSize: 16 } },
      '& .MuiButton-endIcon': { ml: 0.25 },
    },
    buttonLabel: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    option: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      width: '100%',
    },
    name: {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    // The item handles the click
    checkbox: {
      ...sxSmallCheckbox,
      p: 0,
      ml: -0.25,
      pointerEvents: 'none',
    },
    deleteButton: {
      ml: 'auto',
      my: -0.5,
      p: 0.25,
    },
    deleteIcon: {
      fontSize: 16,
    },
  }
}
