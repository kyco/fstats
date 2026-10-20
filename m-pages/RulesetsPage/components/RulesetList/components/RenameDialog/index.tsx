'use client'

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { useState } from 'react'

import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type RenameDialogProps = {
  name: string
  onSave: (name: string) => void
  onClose: () => void
}

/**
 * Renames a rule set, the name is required.
 */
const Component = ({ name: initialName, onSave, onClose }: RenameDialogProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const [name, setName] = useState(initialName)
  const isEmpty = !name.trim()

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!isEmpty) {
            onSave(name.trim())
          }
        }}
      >
        <DialogTitle>{t('RULESETS_PAGE.RENAME_RULESET')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            required
            size="small"
            label={t('RULESETS_PAGE.NAME')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={isEmpty}
            helperText={isEmpty ? t('RULESETS_PAGE.NAME_REQUIRED') : undefined}
            sx={sx.name}
          />
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
