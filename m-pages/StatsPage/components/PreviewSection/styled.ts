import { LAYOUT } from '@/common'

import { HEADER_SPACING, SCROLL_PADDING } from './actions'

export const ui = () => {
  return {
    section: {
      mb: 3,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      height: LAYOUT.SECTION_HEADER_HEIGHT,
      mb: `${HEADER_SPACING}px`,
    },
    // Sticks to the very top, covering the scroll container's padding
    stickyHeader: {
      position: 'sticky',
      top: -SCROLL_PADDING,
      zIndex: 2,
      boxSizing: 'content-box',
      mt: `${-SCROLL_PADDING}px`,
      mb: 0,
      pt: `${SCROLL_PADDING}px`,
      pb: `${HEADER_SPACING}px`,
      bgcolor: 'background.default',
    },
    title: {
      fontWeight: 'medium',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    chip: {
      ml: 1,
    },
    rowCount: {
      ml: 1,
      fontSize: 12,
      fontWeight: 400,
      color: 'text.secondary',
    },
  }
}
