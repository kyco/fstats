import type { BoxProps } from '@mui/material'
import { Box } from '@mui/material'

import { ui } from './styled'

/**
 * Small outlined label, e.g. the currency next to a title or the bank of a file. Cut off with an ellipsis when too
 * narrow, so pass the full text as `title`.
 */
const Component = ({ sx: chipSx, ...props }: Omit<BoxProps<'span'>, 'component'>) => {
  const sx = ui()
  return <Box component="span" {...props} sx={{ ...sx.chip, ...chipSx }} />
}

export default Component
