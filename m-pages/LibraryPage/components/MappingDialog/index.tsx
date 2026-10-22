'use client'

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { useMemo, useState } from 'react'

import type { LibraryMappingTarget } from '@/types'
import { CategoryDirection } from '@/types-enums'
import { MenuSelect } from '@/components'
import {
  buildCategoryTree,
  getCategoryLabel,
  getCategoryOptions,
  useCategoryRulesets,
  useMutateUpdateRuleset,
} from '@/m-category/service'
import { useTranslation } from '@/lib/i18n'

import { DIRECTIONS, EXCLUDED, getMappingUpdates, getMappingValues, NOT_MAPPED, toMappingKey } from './actions'
import { ui } from './styled'

type MappingDialogProps = {
  target: LibraryMappingTarget
  onClose: () => void
}

/**
 * Chooses which category each rule set puts what a tag or library keyword recognises in, for money out and in. A
 * library keyword goes where its tag goes, unless moved elsewhere or left uncategorised.
 */
const Component = ({ target, onClose }: MappingDialogProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const { data: rulesets = [] } = useCategoryRulesets()
  const { mutateAsync: updateRuleset } = useMutateUpdateRuleset()
  const initial = useMemo(() => getMappingValues({ rulesets, target }), [rulesets, target])
  const [chosen, setChosen] = useState<Record<string, string>>({})
  const values = { ...initial, ...chosen }
  const treesById = useMemo(
    () => new Map(rulesets.map((ruleset) => [ruleset.id, buildCategoryTree(ruleset.categories)])),
    [rulesets],
  )

  const getOptions = (rulesetId: string, direction: CategoryDirection) => {
    const tree = treesById.get(rulesetId)
    const categories = tree ? getCategoryOptions({ tree, direction, t }) : []

    if (target.type === 'tag') {
      return [{ value: NOT_MAPPED, label: t('RULESETS_PAGE.LIBRARY.NOT_MAPPED') }, ...categories]
    }

    const ruleset = rulesets.find((other) => other.id === rulesetId)
    const tagCategory = target.tag ? ruleset?.mappings[direction].tags[target.tag] : undefined
    return [
      {
        value: NOT_MAPPED,
        label: t('RULESETS_PAGE.LIBRARY.LIKE_TAG', {
          category:
            tagCategory && tree
              ? getCategoryLabel({ id: tagCategory, tree, t })
              : t('RULESETS_PAGE.LIBRARY.NOT_MAPPED'),
        }),
      },
      { value: EXCLUDED, label: t('RULESETS_PAGE.LIBRARY.EXCLUDED') },
      ...categories,
    ]
  }

  const save = async () => {
    for (const { rulesetId, update } of getMappingUpdates({ rulesets, target, initial, chosen: values })) {
      await updateRuleset({ rulesetId, update })
    }
    onClose()
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          save()
        }}
      >
        <DialogTitle>{t('LIBRARY_PAGE.MAPPING_TITLE', { name: target.name })}</DialogTitle>
        <DialogContent sx={sx.content}>
          <Typography component="p" sx={sx.note}>
            {t(target.type === 'tag' ? 'LIBRARY_PAGE.MAPPING_TAG_NOTE' : 'LIBRARY_PAGE.MAPPING_KEYWORD_NOTE')}
          </Typography>
          {rulesets.map((ruleset) => (
            <Box key={ruleset.id} sx={sx.ruleset}>
              <Box sx={sx.rulesetName}>{ruleset.name}</Box>
              <Box sx={sx.directions}>
                {DIRECTIONS.map((direction) => {
                  const key = toMappingKey(ruleset.id, direction)
                  const label = t(
                    direction === CategoryDirection.OUT
                      ? 'RULESETS_PAGE.LIBRARY.MONEY_OUT'
                      : 'RULESETS_PAGE.LIBRARY.MONEY_IN',
                  )

                  return (
                    <Box key={direction} sx={sx.field}>
                      <Box sx={sx.label}>{label}</Box>
                      <MenuSelect
                        title={`${ruleset.name}: ${label}`}
                        value={values[key] ?? NOT_MAPPED}
                        options={getOptions(ruleset.id, direction)}
                        onChange={(value) => setChosen((prev) => ({ ...prev, [key]: value }))}
                        search={{
                          placeholder: t('STATS_PAGE.CATEGORY_RULES.SEARCH_CATEGORIES'),
                          noMatches: t('STATS_PAGE.CATEGORY_RULES.NO_MATCHING_CATEGORIES'),
                        }}
                      />
                    </Box>
                  )
                })}
              </Box>
            </Box>
          ))}
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
