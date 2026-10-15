import { LAYOUT } from '@/common'

export const ui = () => {
  return {
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      // Fixed like the preview headers, so the titles line up when switching views
      height: LAYOUT.SECTION_HEADER_HEIGHT,
      mb: 1,
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
    caption: {
      ml: 1,
      fontSize: 12,
      fontWeight: 400,
      color: 'text.secondary',
    },
  }
}
