import {
  GitHub,
  Help,
  HelpOutlineRounded,
  Home,
  HomeOutlined,
  Poll,
  PollOutlined,
  Settings,
  SettingsOutlined,
} from '@mui/icons-material'

import type { NavItem } from '@/types'
import { CONFIG, ROUTES } from '@/common'

export const NAV_ITEMS_TOP: NavItem[] = [
  { route: ROUTES.HOME, labelKey: 'NAVIGATION.HOME', icon: HomeOutlined, iconActive: Home },
  { route: ROUTES.STATS, labelKey: 'NAVIGATION.STATS', icon: PollOutlined, iconActive: Poll },
]

export const NAV_ITEMS_BOTTOM: NavItem[] = [
  { route: ROUTES.SETTINGS, labelKey: 'NAVIGATION.SETTINGS', icon: SettingsOutlined, iconActive: Settings },
  { route: ROUTES.ABOUT, labelKey: 'NAVIGATION.ABOUT', icon: HelpOutlineRounded, iconActive: Help },
  { route: CONFIG.GITHUB_URL, labelKey: 'NAVIGATION.GITHUB', icon: GitHub, iconActive: GitHub, isExternal: true },
]

/**
 * Routes rendered edge to edge, i.e. without the max width container.
 */
export const FULL_WIDTH_ROUTES: string[] = [ROUTES.STATS]
