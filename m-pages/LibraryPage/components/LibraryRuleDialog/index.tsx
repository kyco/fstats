'use client'

import { Box, Typography } from '@mui/material'
import { omit, pick } from 'lodash'
import { useMemo, useState } from 'react'

import type { CategoryRule, LibraryRef as LibraryRefValue, RuleDialogValues } from '@/types'
import { CategoryDirection, CategoryRuleDirection, CategoryRuleField, CategoryRuleMatch } from '@/types-enums'
import { LibraryRef, MenuSelect, RuleDialog } from '@/components'
import {
  buildCategoryTree,
  getCategoryOptions,
  getLibraryKeywords,
  setRuleMapping,
  useCategoryRulesets,
  useMutateAddCategoryRule,
  useMutateUpdateCategoryRule,
  useMutateUpdateRuleset,
} from '@/m-category/service'
import { TAGS, toCategoryId } from '@/utils/Category'
import { useTranslation } from '@/lib/i18n'

import { getLibraryRefName, getLibraryRefSummary } from '../../actions'
import {
  fromLibraryRefValue,
  getChangedMappings,
  getLibraryRefOptions,
  getRuleMappings,
  NO_LIBRARY,
  NOT_MAPPED,
  toLibraryRefValue,
} from './actions'
import { ui } from './styled'

type LibraryRuleDialogProps = {
  /**
   * Edited, otherwise a new one is added.
   */
  rule?: CategoryRule
  /**
   * What a new rule belongs to, e.g. added to a tag.
   */
  library?: LibraryRefValue
  /**
   * Rule sets using the rule, which an edit changes too.
   */
  useCount?: number
  onSaved: (rule: CategoryRule) => void
  onClose: () => void
}

const INITIAL: RuleDialogValues = {
  match: CategoryRuleMatch.CONTAINS,
  keyword: '',
  ignoreCase: true,
  direction: CategoryRuleDirection.ANY,
}

/**
 * Adds a rule to the user's library or edits one: what it belongs to in the library (it then goes where that goes), and
 * its category in each rule set (or none).
 */
const Component = ({ rule, library, useCount = 0, onSaved, onClose }: LibraryRuleDialogProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const { data: rulesets = [] } = useCategoryRulesets()
  const { mutateAsync: addRule } = useMutateAddCategoryRule()
  const { mutateAsync: updateRule } = useMutateUpdateCategoryRule()
  const { mutateAsync: updateRuleset } = useMutateUpdateRuleset()
  const libraryKeywords = useMemo(() => getLibraryKeywords(), [])
  const libraryOptions = useMemo(
    () =>
      getLibraryRefOptions({ tags: TAGS, libraryKeywords, t }).map((option) => ({
        ...option,
        start: <LibraryRef type={option.value.startsWith('tag:') ? 'tag' : 'keyword'} />,
      })),
    [libraryKeywords, t],
  )
  const [belongsTo, setBelongsTo] = useState(toLibraryRefValue(rule?.library ?? library))
  const chosenLibrary = fromLibraryRefValue(belongsTo)
  const libraryName = chosenLibrary ? getLibraryRefName(chosenLibrary, t) : null
  const initial = useMemo(() => getRuleMappings(rulesets, rule?.id), [rulesets, rule?.id])
  const [chosen, setChosen] = useState<Record<string, string>>({})
  const mappings = { ...initial, ...chosen }
  const treesById = useMemo(
    () => new Map(rulesets.map((ruleset) => [ruleset.id, buildCategoryTree(ruleset.categories)])),
    [rulesets],
  )

  // Without a category of its own: where what it belongs to goes, otherwise not used
  const getNotMappedLabel = (rulesetId: string) => {
    const ruleset = rulesets.find((other) => other.id === rulesetId)
    const tree = treesById.get(rulesetId)
    if (!chosenLibrary || !libraryName || !ruleset || !tree) {
      return t('RULESETS_PAGE.LIBRARY.NOT_MAPPED')
    }

    const summary = getLibraryRefSummary({ ruleset, tree, library: chosenLibrary, t })
    return t('LIBRARY_PAGE.LIKE_LIBRARY', {
      name: libraryName,
      category: summary ?? t('RULESETS_PAGE.LIBRARY.NOT_MAPPED'),
    })
  }

  const save = async (values: RuleDialogValues) => {
    const withLibrary = chosenLibrary ? { library: chosenLibrary } : {}
    const saved = rule
      ? await updateRule({ rule: { ...omit(rule, 'library'), ...values, ...withLibrary } })
      : await addRule({ rule: { ...values, field: CategoryRuleField.DESCRIPTION, ...withLibrary } })

    for (const [rulesetId, category] of getChangedMappings({ initial, chosen: mappings })) {
      await updateRuleset({
        rulesetId,
        update: setRuleMapping({ ruleId: saved.id, category: category ? toCategoryId(category) : undefined }),
      })
    }
    onSaved(saved)
  }

  return (
    <RuleDialog
      title={t(rule ? 'RULESETS_PAGE.EDIT_RULE' : 'RULESETS_PAGE.ADD_RULE')}
      initial={rule ? pick(rule, ['match', 'keyword', 'ignoreCase', 'direction']) : INITIAL}
      note={useCount ? t('LIBRARY_PAGE.EDIT_RULE_SHARED', { count: useCount }) : undefined}
      onSave={save}
      onClose={onClose}
    >
      <Box sx={sx.field}>
        <Box sx={sx.label}>{t('LIBRARY_PAGE.BELONGS_TO')}</Box>
        <MenuSelect
          title={t('LIBRARY_PAGE.BELONGS_TO')}
          value={belongsTo}
          options={[{ value: NO_LIBRARY, label: t('LIBRARY_PAGE.BELONGS_TO_NOTHING') }, ...libraryOptions]}
          onChange={setBelongsTo}
          search={{
            placeholder: t('RULESETS_PAGE.LIBRARY.SEARCH'),
            noMatches: t('RULESETS_PAGE.LIBRARY.NO_MATCHES'),
          }}
        />
        {libraryName ? (
          <Typography component="p" sx={sx.note}>
            {t('LIBRARY_PAGE.BELONGS_TO_NOTE', { name: libraryName })}
          </Typography>
        ) : null}
      </Box>

      {rulesets.length ? (
        <Box sx={sx.field}>
          <Box sx={sx.label}>{t('LIBRARY_PAGE.CATEGORIES_BY_RULESET')}</Box>
          {rulesets.map((ruleset) => {
            const tree = treesById.get(ruleset.id)

            return (
              <Box key={ruleset.id} sx={sx.mapping}>
                <Box component="span" sx={sx.rulesetName} title={ruleset.name}>
                  {ruleset.name}
                </Box>
                <MenuSelect
                  title={t('LIBRARY_PAGE.CATEGORY_IN', { name: ruleset.name })}
                  value={mappings[ruleset.id] ?? NOT_MAPPED}
                  options={[
                    { value: NOT_MAPPED, label: getNotMappedLabel(ruleset.id) },
                    ...(tree ? getCategoryOptions({ tree, direction: CategoryDirection.OUT, t }) : []),
                  ]}
                  onChange={(value) => setChosen((prev) => ({ ...prev, [ruleset.id]: value }))}
                  search={{
                    placeholder: t('STATS_PAGE.CATEGORY_RULES.SEARCH_CATEGORIES'),
                    noMatches: t('STATS_PAGE.CATEGORY_RULES.NO_MATCHING_CATEGORIES'),
                  }}
                />
              </Box>
            )
          })}
        </Box>
      ) : null}
    </RuleDialog>
  )
}

export default Component
