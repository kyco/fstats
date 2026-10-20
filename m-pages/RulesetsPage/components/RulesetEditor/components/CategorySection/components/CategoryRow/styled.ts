import type { Theme } from '@mui/material/styles'

import type { GradientColorsLightDark } from '@/types'
import { sxCategoryGradient } from '@/styles/styled'

export const ui = (theme: Theme) => {
  return {
    row: (isParent: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      minHeight: 34,
      pl: isParent ? 0.5 : 3.5,
      pr: 0.5,
      borderRadius: '6px',
      '&:hover': { bgcolor: 'action.hover' },
    }),
    dot: (color: GradientColorsLightDark) => ({
      flexShrink: 0,
      width: 14,
      height: 14,
      borderRadius: '50%',
      ...sxCategoryGradient(theme, color),
    }),
    // The name with what's next to it, a button expanding the rules of subcategories
    main: (isToggle: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      flexGrow: 1,
      minWidth: 0,
      minHeight: 34,
      justifyContent: 'flex-start',
      textAlign: 'left',
      cursor: isToggle ? 'pointer' : 'default',
    }),
    chevron: (isExpanded: boolean) => ({
      flexShrink: 0,
      fontSize: 18,
      color: 'text.secondary',
      transform: isExpanded ? 'rotate(90deg)' : 'none',
      transition: 'transform 150ms',
    }),
    chevronSpace: {
      flexShrink: 0,
      width: 18,
    },
    label: (isParent: boolean, isFixed: boolean) => ({
      minWidth: 0,
      fontSize: 13,
      fontWeight: isParent ? 500 : 400,
      color: isFixed ? 'text.secondary' : 'text.primary',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    // Marks internal transfers
    transfer: {
      flexShrink: 0,
      height: 20,
      fontSize: 11,
      '& .MuiChip-icon': { fontSize: 14 },
    },
    count: {
      flexShrink: 0,
      fontSize: 12,
      color: 'text.secondary',
      whiteSpace: 'nowrap',
    },
    fixed: {
      flexShrink: 0,
      minWidth: 84,
      textAlign: 'right',
      fontSize: 12,
      color: 'text.secondary',
    },
    actions: {
      display: 'flex',
      flexShrink: 0,
      justifyContent: 'flex-end',
      minWidth: 84,
    },
    moves: {
      display: 'flex',
    },
    action: {
      p: 0.5,
      fontSize: 16,
    },
  }
}
