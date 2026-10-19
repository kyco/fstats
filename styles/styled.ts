import { alpha } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

import { ColorMode } from '@/types-enums'
import { MISC } from '@/common'

import { Color } from './colors'

/**
 * Bordered, clickable tile, e.g. for settings options.
 */
export const sxTile = (isSelected = false) => {
  return {
    display: 'block',
    p: 2,
    textAlign: 'left',
    border: 1,
    borderColor: isSelected ? 'primary.main' : 'divider',
    borderRadius: 2,
    transition: 'border-color 0.2s',
    '&:hover': { borderColor: isSelected ? 'primary.main' : 'text.secondary' },
  }
}

/**
 * Translucent, blurred background, e.g. for the menu bar and drawers.
 */
export const sxGlass = (theme: Theme, opacity: number = MISC.GLASS_EFFECT) => {
  return {
    background: alpha(Color.white, opacity),
    [theme.getColorSchemeSelector(ColorMode.DARK)]: {
      background: alpha(Color.kycoGrey, opacity),
    },
    backdropFilter: 'blur(10px)',
  }
}

/**
 * Small uppercase heading of a group, e.g. in menus and sidebars.
 */
export const sxSubheaderText = {
  fontSize: 11,
  fontWeight: 'medium',
  lineHeight: 1.5,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'text.secondary',
} as const

/**
 * Tooltip like the chart tooltips (see `getBaseChartOptions`): a white box with a grey border like the cards. Pass as
 * `slotProps={{ tooltip: { sx: sxChartTooltip } }}`.
 */
export const sxChartTooltip = {
  bgcolor: 'background.paper',
  color: 'text.primary',
  border: 1,
  borderColor: 'divider',
  borderRadius: '6px',
  px: 1.25,
  py: 1,
  fontSize: 12,
  fontWeight: 400,
  lineHeight: 1.5,
  boxShadow: 'none',
} as const

/**
 * Compact list row, e.g. the file rows of the left column and the stats rows of the right column.
 */
export const sxListRow = {
  minHeight: 34,
  py: 0,
} as const

/**
 * Single line title of a list row, truncated.
 */
export const sxListRowTitle = {
  flexGrow: 1,
  minWidth: 0,
  m: 0,
  fontSize: 13,
  lineHeight: 1.4,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const

/**
 * Small checkbox with a small icon, e.g. in list rows and toolbars.
 */
export const sxSmallCheckbox = {
  p: 0.5,
  '& .MuiSvgIcon-root': { fontSize: 18 },
} as const

/**
 * Alerts in the steps and the preview, compact and the same size. Alerts are `body2`, which has a bottom margin in the
 * theme.
 */
export const sxCompactAlert = {
  mb: 0,
  py: 0.5,
  alignItems: 'center',
  fontSize: 14,
  '& .MuiAlert-icon': { py: 0, fontSize: 20 },
  '& .MuiAlert-message': { py: 0.75 },
} as const

/**
 * Styles applied only in dark mode (via CSS, so there's no flash before the colour scheme is known).
 */
export const sxDark = (theme: Theme, styles: Record<string, string>) =>
  theme.applyStyles('dark', styles) as Record<string, typeof styles>

/**
 * Cyan accent, lighter in dark mode.
 */
export const sxAccentColor = (theme: Theme) => ({
  color: Color.cyanDark,
  ...sxDark(theme, { color: Color.cyan }),
})

/**
 * Highlighted text (`<mark>`), e.g. search matches. Bold with dark text and slightly wider (without moving the text), so
 * it stands out on highlighted rows too.
 */
export const sxMark = (theme: Theme) => ({
  color: Color.amberDark,
  fontWeight: 600,
  backgroundColor: Color.amber,
  boxShadow: `0 0 0 1px ${Color.amber}`,
  borderRadius: '2px',
  ...theme.applyStyles('dark', {
    color: 'inherit',
    backgroundColor: Color.amberTranslucent,
    boxShadow: `0 0 0 1px ${Color.amberTranslucent}`,
  }),
})
