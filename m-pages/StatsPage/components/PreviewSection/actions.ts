import { LAYOUT } from '@/common'

// Padding of the scroll container, the sticky header covers it
export const SCROLL_PADDING = 16 // px

export const HEADER_SPACING = 8 // px

/**
 * Where content below a sticky header (e.g. a table header row) sticks, relative to the scroll container's content.
 */
export const STICKY_HEADER_OFFSET = LAYOUT.SECTION_HEADER_HEIGHT + HEADER_SPACING // px
