'use client'

import { EditOutlined, ExpandMore, InfoOutlined, WarningAmberOutlined } from '@mui/icons-material'
import { Box, Button, Checkbox, Divider, FormControlLabel, TextField, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'

import type { CategoryCode, CategoryRuleDraft, Transaction } from '@/types'
import { CategoryRuleDirection, CategoryRuleMatch, CategorySource } from '@/types-enums'
import { PARENT_CATEGORY_COLORS } from '@/common'
import { SegmentedToggle } from '@/components'
import {
  getCustomRulesets,
  getRuleFieldValue,
  getRuleRef,
  resolveCategory,
  useCategoryEngine,
  useCategoryRulesets,
  useCheckedRulesets,
  useMutateAddCategoryRule,
  useMutateAddCategoryRuleset,
  useMutateRemoveCategoryOverride,
  useMutateRemoveCategoryRule,
  useMutateSetCategoryOverride,
} from '@/m-category/service'
import { getSimilarTransactions } from '@/m-transaction/service'
import {
  DEFAULT_RULESET_ID,
  getBuiltInRuleset,
  getCategoryLabel,
  getParentCategoryCode,
  getUncategorisedCode,
  MY_RULES_ID,
} from '@/utils/Category'
import { isExpense } from '@/utils/Stats'
import { Trans, useTranslation } from '@/lib/i18n'

import { useStatsTransactions } from '../../context'
import { getCategoryPickerOptions, getFieldOptions, getRuleMatches, getSourceText, NEW_RULESET } from './actions'
import MenuSelect from './components/MenuSelect'
import { ui } from './styled'

type CategoryEditorProps = {
  transaction: Transaction
  /**
   * The current category with the form to change it (in the category editor menu), or only with a button opening it.
   */
  isEditing: boolean
  /**
   * The current category can't be changed or reset, e.g. in the read-only demo.
   */
  readOnly?: boolean
  /**
   * Shows a button toggling the form, which is then shown in its own section below, e.g. in
   * the transaction details. In the menu, the form is right below the current category instead.
   */
  onEdit?: (anchor: HTMLElement) => void
  /**
   * After saving or cancelling the form.
   */
  onClose?: () => void
  /**
   * The rule being created (`null` while changing the transaction only), so the table can highlight its matches.
   */
  onRuleChange?: (rule: CategoryRuleDraft | null) => void
}

type ApplyTo = 'transaction' | 'rule'

/**
 * The category of a transaction and where it's from. Changed for the transaction only or with a rule for all matching
 * transactions (like mail rules), saved to "My rules" or a custom rule set, while the table highlights the matches.
 */
const Component = ({
  transaction,
  isEditing,
  readOnly = false,
  onEdit,
  onClose,
  onRuleChange,
}: CategoryEditorProps) => {
  const theme = useTheme()
  const sx = ui(theme)
  const { t } = useTranslation()
  const { unique } = useStatsTransactions()
  const { engine } = useCategoryEngine()
  const { rulesetIds, checkRuleset } = useCheckedRulesets()
  const { data: rulesets = [] } = useCategoryRulesets()
  const customRulesets = getCustomRulesets(rulesets)
  const { mutateAsync: setOverride } = useMutateSetCategoryOverride()
  const { mutateAsync: removeOverride } = useMutateRemoveCategoryOverride()
  const { mutateAsync: addRule } = useMutateAddCategoryRule()
  const { mutateAsync: removeRule } = useMutateRemoveCategoryRule()
  const { mutateAsync: addRuleset } = useMutateAddCategoryRuleset()

  const isIncome = !isExpense(transaction)
  // Transactions with the same description (this one included), unchanged when changing this one only
  const similarCount = useMemo(() => getSimilarTransactions(unique, transaction).count, [unique, transaction])
  // Categories of the demo data are only in the transaction, already categorised otherwise
  const resolved = useMemo(
    () => resolveCategory({ transaction, engine, preset: readOnly ? transaction.category : null }),
    [transaction, engine, readOnly],
  )
  const categoryOptions = getCategoryPickerOptions(isIncome, t).map((option) => ({
    ...option,
    start: <Box component="span" sx={sx.dot(PARENT_CATEGORY_COLORS[getParentCategoryCode(option.value)])} />,
  }))
  const fieldOptions = getFieldOptions(transaction)
  // Saved to the first checked custom rule set by default, otherwise to "My rules"
  const checkedCustomId = customRulesets.find((ruleset) => rulesetIds.includes(ruleset.id))?.id
  // Built-in rules to start a new rule set with, the first checked or the default ones
  const builtIn =
    rulesetIds.map((id) => getBuiltInRuleset(id)).find((ruleset) => !!ruleset) ?? getBuiltInRuleset(DEFAULT_RULESET_ID)!

  // Chosen by the user, the current one isn't preselected
  const [category, setCategory] = useState<CategoryCode | ''>('')
  const [applyTo, setApplyTo] = useState<ApplyTo>('transaction')
  const [field, setField] = useState(fieldOptions[0])
  const [match, setMatch] = useState<CategoryRuleMatch>(CategoryRuleMatch.CONTAINS)
  const [keyword, setKeyword] = useState(transaction.description.trim())
  const [ignoreCase, setIgnoreCase] = useState(true)
  // Of the transaction by default, at least one is needed
  const [amounts, setAmounts] = useState({ in: isIncome, out: !isIncome })
  const [saveTo, setSaveTo] = useState(checkedCustomId ?? MY_RULES_ID)
  const [newRulesetName, setNewRulesetName] = useState('')
  const [copyBuiltIn, setCopyBuiltIn] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const direction =
    amounts.in && amounts.out
      ? CategoryRuleDirection.ANY
      : amounts.in
        ? CategoryRuleDirection.IN
        : CategoryRuleDirection.OUT
  const trimmedKeyword = keyword.trim()
  // Matches are shown (and highlighted) before a category is chosen, it's needed to save
  const rule = useMemo(
    () =>
      isEditing && applyTo === 'rule'
        ? {
            field,
            match,
            ignoreCase,
            keyword: trimmedKeyword,
            direction,
            category: category || getUncategorisedCode(transaction),
          }
        : null,
    [isEditing, applyTo, field, match, ignoreCase, trimmedKeyword, direction, category, transaction],
  )
  // Among the unique transactions of the checked files
  const matches = useMemo(
    () => (rule ? getRuleMatches({ rule, transaction, transactions: unique }) : null),
    [rule, transaction, unique],
  )

  useEffect(() => {
    onRuleChange?.(rule?.keyword ? rule : null)
  }, [rule, onRuleChange])
  const isNewRuleset = saveTo === NEW_RULESET
  const canSave =
    !isSaving &&
    !!category &&
    (applyTo === 'transaction' ||
      (!!trimmedKeyword && (amounts.in || amounts.out) && (!isNewRuleset || !!newRulesetName.trim())))

  const run = async (action: () => Promise<unknown>) => {
    setIsSaving(true)
    setError(null)
    try {
      await action()
      onClose?.()
    } catch (err) {
      setError(
        t('STATS_PAGE.CATEGORY_RULES.SAVE_FAILED', { message: err instanceof Error ? err.message : String(err) }),
      )
    } finally {
      setIsSaving(false)
    }
  }

  const save = () =>
    run(async () => {
      if (!rule) {
        await setOverride({ transactionId: transaction.id, category })
        return
      }

      const targetId = isNewRuleset
        ? (await addRuleset({ name: newRulesetName.trim(), copyFrom: copyBuiltIn ? builtIn.id : undefined })).id
        : saveTo
      await addRule({ rulesetId: targetId, rule })

      // Otherwise the override would still win over the new rule
      if (resolved.source === CategorySource.OVERRIDE) {
        await removeOverride(transaction.id)
      }

      // Rules only apply while their rule set (or "My rules") is checked
      checkRuleset(targetId)
    })

  const sourceAction =
    resolved.source === CategorySource.OVERRIDE
      ? {
          label: t('STATS_PAGE.CATEGORY_RULES.RESET'),
          confirm: t('STATS_PAGE.CATEGORY_RULES.CONFIRM_RESET'),
          action: () => removeOverride(transaction.id),
        }
      : resolved.rule
        ? {
            label: t('STATS_PAGE.CATEGORY_RULES.DELETE_RULE'),
            confirm: t('STATS_PAGE.CATEGORY_RULES.CONFIRM_DELETE_RULE', {
              rule: getRuleRef({ rulesetId: resolved.rule.rulesetId, number: resolved.rule.number, rulesets }),
              keyword: resolved.rule.keyword,
            }),
            action: () => removeRule({ rulesetId: resolved.rule!.rulesetId, ruleId: resolved.rule!.id }),
          }
        : null

  const renderField = (label: string, control: ReactNode) => (
    <Box sx={sx.field}>
      <Box sx={sx.label}>{label}</Box>
      {control}
    </Box>
  )

  const form = (
    <Box
      component="form"
      sx={sx.form}
      onSubmit={(event) => {
        event.preventDefault()
        if (canSave) {
          save()
        }
      }}
    >
      <MenuSelect
        title={t('STATS_PAGE.CATEGORY_RULES.NEW_CATEGORY')}
        placeholder={t('STATS_PAGE.CATEGORY_RULES.CHOOSE_CATEGORY')}
        value={category}
        options={categoryOptions}
        onChange={setCategory}
        search={{
          placeholder: t('STATS_PAGE.CATEGORY_RULES.SEARCH_CATEGORIES'),
          noMatches: t('STATS_PAGE.CATEGORY_RULES.NO_MATCHING_CATEGORIES'),
        }}
      />

      {renderField(
        t('STATS_PAGE.CATEGORY_RULES.APPLY_TO'),
        <SegmentedToggle
          value={applyTo}
          onChange={setApplyTo}
          options={[
            { value: 'transaction', label: t('STATS_PAGE.CATEGORY_RULES.THIS_TRANSACTION') },
            { value: 'rule', label: t('STATS_PAGE.CATEGORY_RULES.ALL_MATCHING') },
          ]}
        />,
      )}

      {/* Not all with the same description, which "this transaction" could be taken for */}
      {applyTo === 'transaction' ? (
        <Box sx={{ ...sx.notice(true), ...sx.applyNotice }}>
          <InfoOutlined sx={sx.noticeIcon} />
          <span>
            {similarCount > 1 ? (
              <Trans
                i18nKey="STATS_PAGE.CATEGORY_RULES.ONLY_THIS_SIMILAR"
                count={similarCount - 1}
                values={{ count: similarCount - 1 }}
                components={{ b: <strong /> }}
              />
            ) : (
              t('STATS_PAGE.CATEGORY_RULES.ONLY_THIS')
            )}
          </span>
        </Box>
      ) : null}

      {applyTo === 'rule' ? (
        <>
          {fieldOptions.length > 1
            ? renderField(
                t('STATS_PAGE.CATEGORY_RULES.FIELD'),
                <MenuSelect
                  title={t('STATS_PAGE.CATEGORY_RULES.FIELD')}
                  value={field}
                  options={fieldOptions.map((option) => ({
                    value: option,
                    label: t(`STATS_PAGE.CATEGORY_RULES.FIELDS.${option}`),
                    description: getRuleFieldValue(transaction, option),
                  }))}
                  onChange={(value) => {
                    const next = value as typeof field
                    setField(next)
                    setKeyword(getRuleFieldValue(transaction, next)?.trim() ?? '')
                  }}
                />,
              )
            : null}
          {renderField(
            t('STATS_PAGE.CATEGORY_RULES.CONDITION'),
            <>
              <Box sx={sx.condition}>
                <Box sx={sx.matchSelect}>
                  <MenuSelect
                    title={t('STATS_PAGE.CATEGORY_RULES.CONDITION')}
                    value={match}
                    options={Object.values(CategoryRuleMatch).map((value) => ({
                      value,
                      label: t(`STATS_PAGE.CATEGORY_RULES.MATCH_TYPES.${value}`),
                    }))}
                    onChange={(value) => setMatch(value as CategoryRuleMatch)}
                  />
                </Box>
                <TextField
                  size="small"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  error={!!matches && !!trimmedKeyword && !matches.isMatch}
                  slotProps={{ htmlInput: { 'aria-label': t('STATS_PAGE.CATEGORY_RULES.KEYWORD') } }}
                  sx={sx.input}
                />
              </Box>
              {matches && trimmedKeyword ? (
                <Box sx={sx.notice(matches.isMatch)}>
                  {matches.isMatch ? <InfoOutlined sx={sx.noticeIcon} /> : <WarningAmberOutlined sx={sx.noticeIcon} />}
                  {matches.isMatch ? (
                    <span>
                      <Trans
                        i18nKey="STATS_PAGE.CATEGORY_RULES.MATCH_COUNT"
                        count={matches.count}
                        values={{ count: matches.count }}
                        components={{ b: <strong /> }}
                      />
                    </span>
                  ) : (
                    t('STATS_PAGE.CATEGORY_RULES.NO_MATCH')
                  )}
                </Box>
              ) : null}
              <FormControlLabel
                control={<Checkbox checked={ignoreCase} onChange={(_, checked) => setIgnoreCase(checked)} />}
                label={t('STATS_PAGE.CATEGORY_RULES.IGNORE_CASE')}
                sx={sx.checkbox}
              />
            </>,
          )}
          {renderField(
            t('STATS_PAGE.CATEGORY_RULES.AMOUNTS'),
            <Box sx={sx.checkboxes}>
              {(['out', 'in'] as const).map((key) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={amounts[key]}
                      onChange={(_, checked) => setAmounts((prev) => ({ ...prev, [key]: checked }))}
                    />
                  }
                  label={t(`STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.${key.toUpperCase()}_TITLE`)}
                  sx={sx.checkbox}
                />
              ))}
            </Box>,
          )}
          {renderField(
            t('STATS_PAGE.CATEGORY_RULES.SAVE_TO'),
            <>
              <MenuSelect
                title={t('STATS_PAGE.CATEGORY_RULES.SAVE_TO')}
                value={saveTo}
                options={[
                  {
                    value: MY_RULES_ID,
                    label: t('STATS_PAGE.CATEGORY_RULES.MY_RULES'),
                    description: t('STATS_PAGE.CATEGORY_RULES.MY_RULES_DESCRIPTION'),
                  },
                  ...customRulesets.map((ruleset) => ({ value: ruleset.id, label: ruleset.name })),
                  { value: NEW_RULESET, label: t('STATS_PAGE.CATEGORY_RULES.NEW_RULESET') },
                ]}
                onChange={setSaveTo}
              />
              {isNewRuleset ? (
                <>
                  <TextField
                    size="small"
                    placeholder={t('STATS_PAGE.CATEGORY_RULES.RULESET_NAME')}
                    value={newRulesetName}
                    onChange={(event) => setNewRulesetName(event.target.value)}
                    slotProps={{ htmlInput: { 'aria-label': t('STATS_PAGE.CATEGORY_RULES.RULESET_NAME') } }}
                    sx={sx.input}
                    autoFocus
                  />
                  <FormControlLabel
                    control={<Checkbox checked={copyBuiltIn} onChange={(_, checked) => setCopyBuiltIn(checked)} />}
                    label={t('STATS_PAGE.CATEGORY_RULES.COPY_BUILT_IN', {
                      name: t(`STATS_PAGE.CATEGORY_RULES.RULESETS.${builtIn.id}`),
                    })}
                    sx={sx.checkbox}
                  />
                </>
              ) : null}
            </>,
          )}
        </>
      ) : null}

      {error ? <Typography sx={sx.error}>{error}</Typography> : null}

      {/* In the menu, the card of the transaction details frames them */}
      {onEdit ? null : <Divider sx={sx.actionsDivider} />}

      <Box sx={sx.actions}>
        <Button size="small" color="inherit" onClick={onClose}>
          {t('STATS_PAGE.CATEGORY_RULES.CANCEL')}
        </Button>
        <Button size="small" variant="contained" type="submit" disabled={!canSave} loading={isSaving}>
          {t('STATS_PAGE.CATEGORY_RULES.SAVE')}
        </Button>
      </Box>
    </Box>
  )

  const current = (
    <Box sx={sx.section}>
      <Box sx={sx.source}>
        <Box component="span" sx={sx.current}>
          <Box component="span" sx={sx.dot(PARENT_CATEGORY_COLORS[getParentCategoryCode(resolved.category)])} />
          {getCategoryLabel(resolved.category, t)}
        </Box>
        <span>·</span>
        <span>
          <Trans {...getSourceText({ resolved, rulesets, t })} components={{ b: <strong /> }} />
        </span>
        {sourceAction && !readOnly ? (
          <Button
            size="small"
            disabled={isSaving}
            onClick={() => (confirm(sourceAction.confirm) ? run(sourceAction.action) : undefined)}
            sx={sx.sourceAction}
          >
            {sourceAction.label}
          </Button>
        ) : null}
      </Box>

      {/* In the transaction details: a button, opening the form in a box below it */}
      {readOnly || !onEdit ? null : (
        <Box sx={sx.tabs}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<EditOutlined />}
            // Like the expandable rows of the sidebar cards
            endIcon={<ExpandMore sx={sx.chevron(isEditing)} />}
            aria-expanded={isEditing}
            onClick={(event) => (isEditing ? onClose?.() : onEdit(event.currentTarget))}
            sx={sx.tab}
          >
            {t('STATS_PAGE.CATEGORY_RULES.CHANGE_CATEGORY')}
          </Button>
          {isEditing ? <Box sx={sx.tabCard}>{form}</Box> : null}
        </Box>
      )}

      {/* In the menu, below where the category is from */}
      {readOnly || !isEditing || onEdit ? null : (
        <>
          <Divider sx={sx.menuDivider} />
          {form}
        </>
      )}
    </Box>
  )

  return current
}

export default Component
