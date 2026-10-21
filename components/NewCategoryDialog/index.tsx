'use client'

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'

import type { CategoryId, CategoryTree } from '@/types'
import { CategoryDirection } from '@/types-enums'
import { CATEGORY_COLORS } from '@/common'
import { getCategoryLabel, getDirectionParents } from '@/m-category/service'
import { toCategoryId } from '@/utils/Category'
import { useTranslation } from '@/lib/i18n'

import MenuSelect from '../MenuSelect'
import SegmentedToggle from '../SegmentedToggle'
import { ui } from './styled'

type NewCategoryDialogProps = {
  /**
   * What the form starts with, e.g. what was searched for.
   */
  name: string
  /**
   * Of the rule set it's added to.
   */
  tree: CategoryTree
  /**
   * Of new parent categories, e.g. of the transaction. Its parent categories are listed first.
   */
  direction: CategoryDirection
  onSave: (values: { label: string; parentId: CategoryId | null }) => void
  onClose: () => void
}

/**
 * Adds a category while choosing one: a subcategory of a parent category, or a new parent category (with a subcategory
 * of the same name, which is assigned).
 */
const Component = ({ name, tree, direction, onSave, onClose }: NewCategoryDialogProps) => {
  const theme = useTheme()
  const sx = ui(theme)
  const { t } = useTranslation()
  const directions = [CategoryDirection.IN, CategoryDirection.OUT]
  const parents = (direction === CategoryDirection.IN ? directions : directions.toReversed()).flatMap((other) =>
    getDirectionParents(tree, other),
  )
  const [label, setLabel] = useState(name)
  const [type, setType] = useState<'category' | 'subcategory'>(parents.length ? 'subcategory' : 'category')
  const [parentId, setParentId] = useState('')
  // Shown once saving was tried
  const [isTouched, setIsTouched] = useState(false)
  const isSubcategory = type === 'subcategory'
  const isEmpty = !label.trim()
  const isMissingParent = isSubcategory && !parentId
  const directionLabel = (other: CategoryDirection) =>
    t(other === CategoryDirection.IN ? 'MISC.INCOME' : 'MISC.EXPENSES')

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          // Not the form of the category menu it's opened from
          event.stopPropagation()
          setIsTouched(true)
          if (!isEmpty && !isMissingParent) {
            onSave({ label: label.trim(), parentId: isSubcategory ? toCategoryId(parentId) : null })
          }
        }}
      >
        <DialogTitle>{t('COMPONENTS.NEW_CATEGORY_DIALOG.TITLE')}</DialogTitle>
        <DialogContent sx={sx.content}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label={t('RULESETS_PAGE.NAME')}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            error={isTouched && isEmpty}
            helperText={isTouched && isEmpty ? t('RULESETS_PAGE.NAME_REQUIRED') : undefined}
            required
            sx={sx.name}
          />

          <Box sx={sx.field}>
            <Typography component="p" sx={sx.label}>
              {t('COMPONENTS.NEW_CATEGORY_DIALOG.TYPE')}
            </Typography>
            <SegmentedToggle
              value={type}
              onChange={setType}
              options={[
                { value: 'subcategory', label: t('COMPONENTS.NEW_CATEGORY_DIALOG.SUBCATEGORY') },
                { value: 'category', label: t('COMPONENTS.NEW_CATEGORY_DIALOG.CATEGORY') },
              ]}
            />
          </Box>

          {isSubcategory ? (
            <Box sx={sx.field}>
              <Typography component="p" sx={sx.label}>
                {t('COMPONENTS.NEW_CATEGORY_DIALOG.PARENT')}
              </Typography>
              <MenuSelect
                title={t('COMPONENTS.NEW_CATEGORY_DIALOG.PARENT')}
                placeholder={t('COMPONENTS.NEW_CATEGORY_DIALOG.CHOOSE_PARENT')}
                value={parentId}
                options={parents.map((parent) => ({
                  value: parent.id,
                  label: getCategoryLabel({ id: parent.id, tree, t }),
                  group: directionLabel(parent.direction),
                  start: <Box component="span" sx={sx.dot(CATEGORY_COLORS[parent.color])} />,
                }))}
                onChange={setParentId}
                search={{
                  placeholder: t('STATS_PAGE.CATEGORY_RULES.SEARCH_CATEGORIES'),
                  noMatches: t('STATS_PAGE.CATEGORY_RULES.NO_MATCHING_CATEGORIES'),
                }}
              />
              {isTouched && isMissingParent ? (
                <Typography component="p" sx={sx.error}>
                  {t('COMPONENTS.NEW_CATEGORY_DIALOG.PARENT_REQUIRED')}
                </Typography>
              ) : null}
            </Box>
          ) : (
            <Typography component="p" sx={sx.hint}>
              {t('COMPONENTS.NEW_CATEGORY_DIALOG.CATEGORY_HINT', { direction: directionLabel(direction) })}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={onClose}>
            {t('STATS_PAGE.CATEGORY_RULES.CANCEL')}
          </Button>
          <Button type="submit" variant="contained">
            {t('COMPONENTS.NEW_CATEGORY_DIALOG.CREATE')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default Component
