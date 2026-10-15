import { listItemButtonClasses, listItemSecondaryActionClasses } from '@mui/material'

import { sxListRow, sxListRowTitle, sxSmallCheckbox } from '../../styled'

const sxSetupButton = {
  flexShrink: 0,
  minWidth: 0,
  py: 0,
  px: 1,
  fontSize: 12,
  lineHeight: 1.6,
} as const

export const ui = () => {
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
    name: sxListRowTitle,
    status: {
      flexShrink: 0,
      fontSize: 16,
    },
    setupButton: sxSetupButton,
    setupSpacer: {
      ...sxSetupButton,
      visibility: 'hidden',
    },
    bankChip: {
      maxWidth: '45%',
    },
  }
}
