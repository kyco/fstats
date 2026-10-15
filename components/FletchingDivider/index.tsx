import type { SxProps, Theme } from '@mui/material'
import { Box } from '@mui/material'

import { STROKES } from './actions'
import { ui } from './styled'

type FletchingDividerProps = {
  sx?: SxProps<Theme>
}

/**
 * Divider for a stronger break than `Divider`, e.g. between sections of different currencies: a full width line with
 * three 45° strokes above and below it at both ends, from the edge to the line, like the fletching of an arrow.
 */
const Component = ({ sx: dividerSx }: FletchingDividerProps) => {
  const sx = ui()

  return (
    <Box role="separator" sx={[sx.divider, ...(Array.isArray(dividerSx) ? dividerSx : [dividerSx])]}>
      {(['start', 'end'] as const).flatMap((side) =>
        (['up', 'down'] as const).flatMap((direction) =>
          STROKES.map(({ offset, length }) => (
            <Box
              key={`${side}-${direction}-${offset}`}
              sx={sx.stroke(side, direction)}
              style={{ [side === 'start' ? 'left' : 'right']: offset - length, width: length }}
            />
          )),
        ),
      )}
    </Box>
  )
}

export default Component
