'use client'

import { Button, Checkbox, CircularProgress, ListItem, ListItemButton, Tooltip, Typography } from '@mui/material'
import NextLink from 'next/link'
import { useSearchParams } from 'next/navigation'

import type { StatsFile } from '@/types'
import { StatsFileStatus } from '@/types-enums'
import { getSetupChange, getWorkspaceHref } from '@/common'
import { isConvertible, isError, isParsed, isUnknown } from '@/m-stats-file/service'
import { useTranslation } from '@/lib/i18n'

import { getFileFormat, getFileNameColor } from '../../actions'
import FileStatusIcon from '../FileStatusIcon'
import TextChip from '../TextChip'
import { ui } from './styled'

type FileRowProps = {
  file: StatsFile
  isChecked: boolean
  onToggle: (fileId: string) => void
  disabled?: boolean
}

const Component = ({ file, isChecked, onToggle, disabled = false }: FileRowProps) => {
  const sx = ui()
  // Re-render on language change, the format label is translated
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const format = getFileFormat(file)

  const showSetup = isConvertible(file) && !disabled
  const setupLabel = t('STATS_PAGE.PARSER_SETUP.SET_UP')

  return (
    <ListItem
      disablePadding
      divider
      sx={sx.item}
      secondaryAction={
        showSetup ? (
          <Tooltip title={format.value}>
            <Button
              component={NextLink}
              href={getWorkspaceHref(searchParams, getSetupChange(file.id))}
              size="small"
              color="info"
              variant="outlined"
              sx={sx.setupButton}
            >
              {setupLabel}
            </Button>
          </Tooltip>
        ) : null
      }
    >
      <ListItemButton onClick={() => onToggle(file.id)} disabled={disabled} sx={sx.row}>
        <Checkbox size="small" checked={isChecked} tabIndex={-1} disableRipple sx={sx.checkbox} />
        <Typography
          sx={{ ...sx.name, color: getFileNameColor(file), fontWeight: isChecked ? 700 : 400 }}
          title={file.file.name}
        >
          {file.file.name}
        </Typography>
        {file.status === StatsFileStatus.PARSING ? (
          <CircularProgress size={12} sx={sx.status} />
        ) : isUnknown(file) || isError(file) ? (
          <Tooltip title={format.value}>
            <FileStatusIcon file={file} sx={sx.status} />
          </Tooltip>
        ) : null}
        {isParsed(file) ? (
          <TextChip title={format.value} sx={sx.bankChip}>
            {format.value}
          </TextChip>
        ) : null}
        {showSetup ? (
          <Button component="span" aria-hidden size="small" variant="outlined" sx={sx.setupSpacer}>
            {setupLabel}
          </Button>
        ) : null}
      </ListItemButton>
    </ListItem>
  )
}

export default Component
