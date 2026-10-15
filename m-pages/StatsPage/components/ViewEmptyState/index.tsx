'use client'

import type { SvgIconComponent } from '@mui/icons-material'

import { EmptyReason } from '@/types-enums'
import { EmptyDisplay } from '@/components'
import { useTranslation } from '@/lib/i18n'

import { EMPTY_REASON_TITLE_KEYS } from '../../actions'
import DropZoneDisplay from '../DropZoneDisplay'
import { ICONS, SUBTITLE_KEYS } from './actions'

type ViewEmptyStateProps = {
  reason: EmptyReason
  /**
   * Of the drop zone shown without files, see `DropZoneDisplay`.
   */
  dropZone?: { icon: SvgIconComponent; title: string; subtitleKey: string }
}

/**
 * Shown in place of the middle column's view, see `getEmptyReason`.
 */
const Component = ({ reason, dropZone }: ViewEmptyStateProps) => {
  const { t } = useTranslation()

  if (reason === EmptyReason.NO_FILES) {
    return <DropZoneDisplay {...dropZone} />
  }

  return (
    <EmptyDisplay icon={ICONS[reason]} title={t(EMPTY_REASON_TITLE_KEYS[reason])} subtitle={t(SUBTITLE_KEYS[reason])} />
  )
}

export default Component
