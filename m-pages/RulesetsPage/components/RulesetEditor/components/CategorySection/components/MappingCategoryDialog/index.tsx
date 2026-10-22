'use client'

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { useState } from 'react'

import type { CategoryId, MenuSelectOption } from '@/types'
import { MenuSelect } from '@/components'
import { toCategoryId } from '@/utils/Category'
import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type MappingCategoryDialogProps = {
  /**
   * Of the tag or library keyword, as shown.
   */
  name: string
  /**
   * E.g. "Money out only".
   */
  note: string
  initial: CategoryId
  options: MenuSelectOption[]
  onSave: (category: CategoryId) => void
  /**
   * Adds a category of that name and maps to it.
   */
  onCreate: (name: string) => void
  onClose: () => void
}

/**
 * Moves a tag or library keyword mapped to a category to another category of the rule set.
 */
const Component = ({ name, note, initial, options, onSave, onCreate, onClose }: MappingCategoryDialogProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const [category, setCategory] = useState<string>(initial)

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSave(toCategoryId(category))
        }}
      >
        <DialogTitle>{t('RULESETS_PAGE.LIBRARY.CATEGORY_OF', { name })}</DialogTitle>
        <DialogContent sx={sx.content}>
          <Typography component="p" sx={sx.note}>
            {note}
          </Typography>
          <MenuSelect
            title={t('RULESETS_PAGE.LIBRARY.CATEGORY_OF', { name })}
            value={category}
            options={options}
            onChange={setCategory}
            search={{
              placeholder: t('STATS_PAGE.CATEGORY_RULES.SEARCH_CATEGORIES'),
              noMatches: t('STATS_PAGE.CATEGORY_RULES.NO_MATCHING_CATEGORIES'),
            }}
            create={{ getLabel: (value) => t('STATS_PAGE.CATEGORY_RULES.CREATE_CATEGORY', { name: value }), onCreate }}
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
