import { listItemButtonClasses, listItemSecondaryActionClasses } from '@mui/material'

import { sxListRow, sxListRowTitle, sxSmallCheckbox } from '@/styles/styled'

export const ui = () => {
  const setupButton = {
    flexShrink: 0,
    minWidth: 0,
    py: 0,
    px: 1,
    fontSize: 12,
    lineHeight: 1.6,
  } as const

  return {
    item: {
      [`& > .${listItemButtonClasses.root}`]: { pr: 1.25 },
      [`& > .${listItemSecondaryActionClasses.root}`]: { right: 10 },
    },
    row: {
      ...sxListRow,
      gap: 0.75,
      pl: 1,
      pr: 1.25,
      minWidth: 0,
    },
    checkbox: sxSmallCheckbox,
    name: (color: string, isChecked: boolean) => ({
      ...sxListRowTitle,
      color,
      fontWeight: isChecked ? 700 : 400,
    }),
    status: {
      flexShrink: 0,
      fontSize: 16,
    },
    setupButton: setupButton,
    setupSpacer: {
      ...setupButton,
      visibility: 'hidden',
    },
    bankChip: {
      maxWidth: '45%',
    },
  }
}
