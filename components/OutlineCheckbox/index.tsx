'use client'

import type { CheckboxProps } from '@mui/material'
import { Checkbox } from '@mui/material'

import { CheckBoxOutlineChecked, CheckBoxOutlineIndeterminate } from './icons'
import { ui } from './styled'

/**
 * Small checkbox with outlined icons and muted colors, for the rows of the date explorer and the filters.
 */
const Component = ({ sx: checkboxSx, ...props }: CheckboxProps) => {
  const sx = ui()

  return (
    <Checkbox
      size="small"
      checkedIcon={<CheckBoxOutlineChecked />}
      indeterminateIcon={<CheckBoxOutlineIndeterminate />}
      {...props}
      sx={{ ...sx.checkbox, ...checkboxSx }}
    />
  )
}

export default Component
