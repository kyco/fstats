'use client'

import { createSvgIcon } from '@mui/material/utils'

import { CHECK_PATH, DASH_PATH, OUTLINE_PATH } from './actions'

/**
 * Outlined versions of the checked and indeterminate checkbox icons, lighter than the filled defaults.
 */
export const CheckBoxOutlineChecked = createSvgIcon(
  <>
    <path d={OUTLINE_PATH} />
    <path d={CHECK_PATH} fill="none" stroke="currentColor" strokeWidth={2} />
  </>,
  'CheckBoxOutlineChecked',
)

export const CheckBoxOutlineIndeterminate = createSvgIcon(
  <>
    <path d={OUTLINE_PATH} />
    <path d={DASH_PATH} fill="none" stroke="currentColor" strokeWidth={2} />
  </>,
  'CheckBoxOutlineIndeterminate',
)
