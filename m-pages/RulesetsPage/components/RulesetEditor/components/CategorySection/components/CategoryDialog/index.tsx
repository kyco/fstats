'use client'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'

import type { CategoryDialogValues } from '@/types'
import { zCategoryColor } from '@/types-enums'
import { CATEGORY_COLORS } from '@/common'
import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type CategoryDialogProps = {
  title: string
  /**
   * What the form starts with. A `color` shows the colours (parent categories), an `isTransfer` the transfer switch
   * (subcategories).
   */
  initial: CategoryDialogValues
  onSave: (values: CategoryDialogValues) => void
  onClose: () => void
}

/**
 * Adds or edits a (parent) category: its name, and the colour of parent categories or whether a subcategory is an
 * internal transfer.
 */
const Component = ({ title, initial, onSave, onClose }: CategoryDialogProps) => {
  const theme = useTheme()
  const sx = ui(theme)
  const { t } = useTranslation()
  const [label, setLabel] = useState(initial.label)
  const [color, setColor] = useState(initial.color)
  const [isTransfer, setIsTransfer] = useState(initial.isTransfer)
  // Shown once the name was changed (or saving was tried), not when the dialog opens empty
  const [isTouched, setIsTouched] = useState(false)
  const isEmpty = !label.trim()

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setIsTouched(true)
          if (!isEmpty) {
            onSave({ label: label.trim(), color, isTransfer })
          }
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent sx={sx.content}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label={t('RULESETS_PAGE.NAME')}
            value={label}
            onChange={(event) => {
              setLabel(event.target.value)
              setIsTouched(true)
            }}
            error={isTouched && isEmpty}
            helperText={isTouched && isEmpty ? t('RULESETS_PAGE.NAME_REQUIRED') : undefined}
            required
            sx={sx.name}
          />

          {color ? (
            <Box>
              <Typography component="p" sx={sx.label}>
                {t('RULESETS_PAGE.COLOR')}
              </Typography>
              <Box role="radiogroup" aria-label={t('RULESETS_PAGE.COLOR')} sx={sx.colors}>
                {zCategoryColor.options.map((option) => (
                  <Box
                    key={option}
                    component="button"
                    type="button"
                    role="radio"
                    aria-checked={option === color}
                    aria-label={option}
                    onClick={() => setColor(option)}
                    sx={sx.swatch(CATEGORY_COLORS[option], option === color)}
                  />
                ))}
              </Box>
            </Box>
          ) : null}

          {isTransfer !== undefined ? (
            <Box>
              <FormControlLabel
                control={<Switch checked={isTransfer} onChange={(_, checked) => setIsTransfer(checked)} />}
                label={t('RULESETS_PAGE.TRANSFER_SWITCH')}
                sx={sx.switch}
              />
              <Typography component="p" sx={sx.hint}>
                {t('RULESETS_PAGE.TRANSFER_DESCRIPTION')}
              </Typography>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={onClose}>
            {t('STATS_PAGE.CATEGORY_RULES.CANCEL')}
          </Button>
          <Button type="submit" variant="contained">
            {t('STATS_PAGE.CATEGORY_RULES.SAVE')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default Component
