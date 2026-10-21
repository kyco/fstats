'use client'

import { CheckCircle } from '@mui/icons-material'
import { Alert, Box, Card, Chip, Divider, Typography } from '@mui/material'
import { useMemo } from 'react'

import type { CategoryRuleset } from '@/types'
import { CategoryDirection } from '@/types-enums'
import type { RulesetUpdate } from '@/m-category/service'
import { buildCategoryTree, useMutateUpdateRuleset } from '@/m-category/service'
import { useTranslation } from '@/lib/i18n'

import CategorySection from './components/CategorySection'
import LibrarySection from './components/LibrarySection'
import { ui } from './styled'

type RulesetEditorProps = {
  ruleset: CategoryRuleset
  rulesets: CategoryRuleset[]
  isActive: boolean
}

/**
 * The name, categories, rules and library mappings of a rule set, changed in place.
 */
const Component = ({ ruleset, rulesets, isActive }: RulesetEditorProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const tree = useMemo(() => buildCategoryTree(ruleset.categories), [ruleset.categories])
  const { mutate: updateRuleset, error } = useMutateUpdateRuleset()

  const update = (change: RulesetUpdate) => updateRuleset({ rulesetId: ruleset.id, update: change })

  return (
    <Card sx={sx.card}>
      <Box sx={sx.header}>
        {/* Renamed and made active in the menu of the list */}
        <Typography component="h2" sx={sx.name}>
          {ruleset.name}
        </Typography>
        {isActive ? (
          <Chip size="small" color="success" icon={<CheckCircle />} label={t('RULESETS_PAGE.ACTIVE')} />
        ) : null}
      </Box>

      {error ? (
        <Alert severity="error" sx={sx.error}>
          {t('RULESETS_PAGE.SAVE_FAILED', { message: error.message })}
        </Alert>
      ) : null}

      <Divider sx={sx.divider} />

      <Typography component="p" sx={sx.hint}>
        {t('RULESETS_PAGE.RULES_DESCRIPTION')}
      </Typography>

      <Box sx={sx.sections}>
        <CategorySection
          ruleset={ruleset}
          rulesets={rulesets}
          tree={tree}
          direction={CategoryDirection.IN}
          title={t('MISC.INCOME')}
          onUpdate={update}
        />
        <CategorySection
          ruleset={ruleset}
          rulesets={rulesets}
          tree={tree}
          direction={CategoryDirection.OUT}
          title={t('MISC.EXPENSES')}
          onUpdate={update}
        />
        <LibrarySection ruleset={ruleset} tree={tree} onUpdate={update} />
      </Box>
    </Card>
  )
}

export default Component
