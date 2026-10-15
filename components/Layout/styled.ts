import { LAYOUT } from '@/common'

export const ui = () => {
  return {
    content: (expanded: boolean) => ({
      pl: `${expanded ? LAYOUT.SIDEBAR_WIDTH_EXPANDED : LAYOUT.SIDEBAR_WIDTH}px`,
      transition: 'padding-left 0.2s',
      '@media print': { pl: 0 },
    }),

    drawerHeader: {
      mt: 1,
      py: 2,
      px: 4,
    },
  }
}
