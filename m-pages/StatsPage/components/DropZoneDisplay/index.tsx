'use client'

import type { SvgIconComponent } from '@mui/icons-material'
import { CloudUploadOutlined } from '@mui/icons-material'
import { Button, Divider, Link } from '@mui/material'
import NextLink from 'next/link'
import { useSearchParams } from 'next/navigation'

import { getDemoHref, MISC, WorkspaceView } from '@/common'
import { EmptyDisplay } from '@/components'
import { Trans, useTranslation } from '@/lib/i18n'

import { useWorkspace } from '../../context'
import { ui } from './styled'

type DropZoneDisplayProps = {
  icon?: SvgIconComponent
  title?: string
  /**
   * Translation key of the subtitle with the `files` and `link` components, see `STATS_PAGE.DROP_ZONE.CLICK_TO_SELECT`.
   */
  subtitleKey?: string
}

/**
 * Shown in place of the data or stats when there are no files. The whole page is the drop zone.
 */
const Component = ({
  icon = CloudUploadOutlined,
  title,
  subtitleKey = 'STATS_PAGE.DROP_ZONE.CLICK_TO_SELECT',
}: DropZoneDisplayProps) => {
  const { t } = useTranslation()
  const sx = ui()
  const searchParams = useSearchParams()
  const { onAddFiles, onAddFolder } = useWorkspace()

  // Don't also trigger the click of the whole display
  const renderLink = (onClick: () => void) => (
    <Link
      component="button"
      variant="body2"
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      sx={{ verticalAlign: 'baseline', mb: 0 }}
    />
  )

  return (
    <EmptyDisplay
      icon={icon}
      title={title ?? t('STATS_PAGE.DROP_ZONE.DROP_FILES_ANYWHERE')}
      subtitle={
        <Trans
          i18nKey={subtitleKey}
          values={{ dot: MISC.CENTER_DOT }}
          components={{ files: renderLink(onAddFiles), link: renderLink(onAddFolder) }}
        />
      }
      caption={t('STATS_PAGE.DROP_ZONE.FILE_RESTRICTIONS')}
      actions={
        <>
          <Divider sx={sx.divider}>{t('MISC.OR')}</Divider>
          <Button
            component={NextLink}
            href={getDemoHref({ searchParams, view: WorkspaceView.STATS })}
            variant="outlined"
          >
            {t('MISC.VIEW_DEMO')}
          </Button>
        </>
      }
      onClick={onAddFiles}
    />
  )
}

export default Component
