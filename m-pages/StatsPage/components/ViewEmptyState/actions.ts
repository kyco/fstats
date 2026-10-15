import type { SvgIconComponent } from '@mui/icons-material'
import { ChecklistOutlined, DescriptionOutlined, EventBusyOutlined, FilterAltOffOutlined } from '@mui/icons-material'

import { EmptyReason } from '@/types-enums'

export const ICONS: Record<Exclude<EmptyReason, typeof EmptyReason.NO_FILES>, SvgIconComponent> = {
  [EmptyReason.NO_SELECTION]: ChecklistOutlined,
  [EmptyReason.NO_TRANSACTIONS]: DescriptionOutlined,
  [EmptyReason.NO_DATES]: EventBusyOutlined,
  [EmptyReason.NO_MATCHES]: FilterAltOffOutlined,
}

export const SUBTITLE_KEYS: Record<Exclude<EmptyReason, typeof EmptyReason.NO_FILES>, string> = {
  [EmptyReason.NO_SELECTION]: 'STATS_PAGE.NO_SELECTION.SUBTITLE',
  [EmptyReason.NO_TRANSACTIONS]: 'STATS_PAGE.NO_TRANSACTIONS.EMPTY_SUBTITLE',
  [EmptyReason.NO_DATES]: 'STATS_PAGE.NO_TRANSACTIONS.NO_DATES_SUBTITLE',
  [EmptyReason.NO_MATCHES]: 'STATS_PAGE.NO_TRANSACTIONS.NO_MATCHES_SUBTITLE',
}
