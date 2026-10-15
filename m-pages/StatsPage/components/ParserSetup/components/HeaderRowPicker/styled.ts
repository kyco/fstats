import type { HeaderRowFrame } from '@/types'

import { ROW_HEIGHT } from '../../../VirtualTable/actions'
import { VISIBLE_ROWS } from './actions'

export const ui = () => {
  return {
    // Positioned, for the frame of the selected row
    scroll: {
      position: 'relative',
      overflowY: 'auto',
      maxHeight: VISIBLE_ROWS * ROW_HEIGHT,
    },
    radio: {
      p: 0.25,
      '& .MuiSvgIcon-root': { fontSize: 18 },
    },
    frame: ({ top, height }: HeaderRowFrame) => ({
      position: 'absolute',
      left: 0,
      right: 0,
      top,
      height,
      zIndex: 2,
      border: 2,
      borderColor: 'primary.main',
      borderRadius: 1,
      pointerEvents: 'none',
    }),
  }
}
