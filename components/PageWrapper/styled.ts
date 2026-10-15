import { LAYOUT } from '@/common'

export const ui = (isMobile: boolean) => {
  return {
    wrapper: {
      pt: 4,
      pb: 12,
      maxWidth: '100%',
      minHeight: isMobile ? `calc(100vh - ${LAYOUT.NAV_HEIGHT_MOBILE + LAYOUT.NAV_BORDER}px)` : '100vh',

      '@media print': {
        maxWidth: 'none',
        overflowX: 'visible',
        p: 0,
      },
    },
  }
}
