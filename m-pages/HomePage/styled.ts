import type { Theme } from '@mui/material/styles'

import { Color } from '@/styles/colors'
import { sxAccentColor, sxDark } from '@/styles/styled'

export const ui = (theme: Theme, isMobile: boolean) => {
  return {
    badges: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      columnGap: 3,
      rowGap: 1,
      listStyle: 'none',
      p: 0,
      m: 0,
      mt: isMobile ? 3 : 4,
    },

    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.75,
      fontSize: 13,
      color: 'text.secondary',
    },

    badgeIcon: {
      fontSize: 16,
    },

    section: {
      mt: isMobile ? 7 : 11,
    },

    sectionTitle: {
      textAlign: 'center',
      fontWeight: 700,
      mb: isMobile ? 3 : 4,
    },

    sectionSubtitle: {
      textAlign: 'center',
      color: 'text.secondary',
      maxWidth: 560,
      mx: 'auto',
      mt: isMobile ? -1.5 : -2,
      mb: isMobile ? 3 : 4,
    },

    cardTitle: {
      fontWeight: 700,
      fontSize: 18,
      mb: 0.75,
    },

    cardDescription: {
      color: 'text.secondary',
      fontSize: 14,
      lineHeight: 1.6,
      mb: 0,
    },

    centered: {
      display: 'flex',
      justifyContent: 'center',
    },

    link: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      fontSize: 15,
      fontWeight: 600,
      textDecoration: 'none',
      ...sxAccentColor(theme),
      '&:hover': { textDecoration: 'underline' },
    },

    linkIcon: {
      fontSize: 20,
    },

    steps: {
      listStyle: 'none',
      m: 0,
      p: 0,
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: isMobile ? 3 : 4,
      // 3 of 12 columns per step, centred
      maxWidth: isMobile ? 'none' : '75%',
      mx: 'auto',
    },

    step: {
      position: 'relative',
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'column',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 2,
      textAlign: isMobile ? 'left' : 'center',
      // Line connecting each step to the next one
      '&:not(:last-of-type)::after': {
        content: '""',
        position: 'absolute',
        backgroundColor: 'divider',
        ...(isMobile
          ? { left: 15, top: 40, bottom: -16, width: 2 }
          : { top: 15, left: 'calc(50% + 28px)', width: 'calc(100% - 56px + 32px)', height: 2 }),
      },
    },

    stepNumber: {
      flexShrink: 0,
      width: 32,
      height: 32,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: 14,
      backgroundColor: 'rgba(0,96,100,0.1)',
      color: Color.cyanDark,
      ...sxDark(theme, {
        backgroundColor: 'rgba(0,188,212,0.15)',
        color: Color.cyan,
      }),
    },

    bankList: {
      listStyle: 'none',
      m: 0,
      p: 0,
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      columnGap: 3,
      rowGap: 1.5,
      maxWidth: 640,
      mx: 'auto',
    },

    bankItem: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      fontSize: 15,
      fontWeight: 500,
    },

    missingBank: {
      textAlign: 'center',
      color: 'text.secondary',
      fontSize: 13,
      mt: 3,
    },

    inlineLink: {
      fontWeight: 600,
      textDecoration: 'none',
      ...sxAccentColor(theme),
      '&:hover': { textDecoration: 'underline' },
    },
  }
}
