import { sxSmallCheckbox } from '@/styles/styled'

export const ui = () => {
  return {
    toolbar: {
      position: 'sticky',
      top: 0,
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 0.25,
      minHeight: 40,
      pl: 1,
      pr: 0.5,
      bgcolor: 'background.default',
      borderBottom: 1,
      borderColor: 'divider',
    },
    select: {
      display: 'flex',
      alignItems: 'center',
    },
    checkbox: sxSmallCheckbox,
    // The item handles the click
    menuCheckbox: {
      ...sxSmallCheckbox,
      p: 0,
      ml: -0.25,
      pointerEvents: 'none',
    },
    selectMenuButton: {
      p: 0,
      ml: -0.5,
      color: 'text.secondary',
    },
    actionButton: {
      p: 0.75,
      color: 'text.secondary',
      '& .MuiSvgIcon-root': { fontSize: 18 },
    },
    divider: {
      mx: 0.5,
      my: 1.25,
    },
    count: {
      flexGrow: 1,
      minWidth: 0,
      ml: 0.5,
      color: 'text.secondary',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  }
}
