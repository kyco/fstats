'use client'

import { EditOutlined, ExpandMore, InfoOutlined, WarningAmberOutlined } from '@mui/icons-material'
import { Box, Button, Checkbox, Divider, FormControlLabel, IconButton, TextField, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { isEqual } from 'lodash'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'

import type { CategoryEditorDraft, CategoryRulePreview, Transaction } from '@/types'
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
import {
  getCategoryPickerOptions,
  getFieldOptions,
  getRuleMatches,
  getSourceText,
  MATCH_STEPS,
  NEW_RULESET,
} from './actions'
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
  onRuleChange?: (rule: CategoryRulePreview | null) => void
  /**
   * What was entered before, e.g. in the menu before moving to the sidebar.
   */
  initialDraft?: CategoryEditorDraft
  /**
   * In the menu, "View" next to the count of the matches moves the form to the sidebar, so the table can be scrolled…
   */
  onMoveToSidebar?: (draft: CategoryEditorDraft) => void
  /**
   * …and there, its arrows scroll the table to the previous or next match.
   */
  onFocusMatch?: (transactionId: string) => void
  /**
   * The match the table is scrolled to, the edited transaction by default.
   */
  focusedMatchId?: string | null
  /**
   * Whether anything was changed in the form (also before moving it from the menu), e.g. to ask before discarding it.
   */
  onChangesChange?: (hasChanges: boolean) => void
}

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
  initialDraft,
  onMoveToSidebar,
  onFocusMatch,
  focusedMatchId,
  onChangesChange,
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
  // What the form starts with, unless moved from the menu. Compared with, to know whether anything was changed.
  const [defaults] = useState<CategoryEditorDraft>(() => ({
    category: '',
    applyTo: 'transaction',
    field: fieldOptions[0],
    match: CategoryRuleMatch.CONTAINS,
    keyword: transaction.description.trim(),
    ignoreCase: true,
    // Of the transaction, at least one is needed
    amounts: { in: isIncome, out: !isIncome },
    saveTo: checkedCustomId ?? MY_RULES_ID,
    newRulesetName: '',
    copyBuiltIn: false,
  }))
  const initial = initialDraft ?? defaults
  const [category, setCategory] = useState(initial.category)
  const [applyTo, setApplyTo] = useState(initial.applyTo)
  const [field, setField] = useState(initial.field)
  const [match, setMatch] = useState(initial.match)
  const [keyword, setKeyword] = useState(initial.keyword)
  const [ignoreCase, setIgnoreCase] = useState(initial.ignoreCase)
  const [amounts, setAmounts] = useState(initial.amounts)
  const [saveTo, setSaveTo] = useState(initial.saveTo)
  const [newRulesetName, setNewRulesetName] = useState(initial.newRulesetName)
  const [copyBuiltIn, setCopyBuiltIn] = useState(initial.copyBuiltIn)
  const draft: CategoryEditorDraft = {
    category,
    applyTo,
    field,
    match,
    keyword,
    ignoreCase,
    amounts,
    saveTo,
    newRulesetName,
    copyBuiltIn,
  }
  const hasChanges = !isEqual(draft, defaults)
  // In the sidebar, the match the table is scrolled to, starting at the edited (selected) one
  const focusedId = onFocusMatch ? (focusedMatchId ?? transaction.id) : null
  // In the menu, asks before moving to the sidebar
  const [isConfirmingMove, setIsConfirmingMove] = useState(false)
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

  const isMyRules = saveTo === MY_RULES_ID
  const preview = useMemo(
    () => (rule?.keyword ? { rule, category: category || null, isMyRules, editedId: transaction.id } : null),
    [rule, category, isMyRules, transaction.id],
  )

  useEffect(() => {
    onRuleChange?.(preview)
  }, [preview, onRuleChange])

  // -1 when it doesn't match (e.g. after changing the keyword)
  const focusedIndex = matches?.transactions.findIndex((other) => other.id === focusedId) ?? -1

  // Only when asked to, from none to the first (down) or last (up) one
  const focusMatch = (step: number) => {
    if (!matches?.count) {
      return
    }

    const index =
      focusedIndex < 0 ? (step > 0 ? 0 : matches.count - 1) : (focusedIndex + step + matches.count) % matches.count
    onFocusMatch?.(matches.transactions[index].id)
  }

  useEffect(() => {
    onChangesChange?.(hasChanges)
  }, [hasChanges, onChangesChange])

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
              {/* Also when not matching this transaction, the others it would change */}
              {matches?.count ? (
                <Box sx={sx.notice(true)}>
                  <InfoOutlined sx={sx.noticeIcon} />
                  <Box component="span" sx={sx.noticeText}>
                    <Trans
                      i18nKey="STATS_PAGE.CATEGORY_RULES.MATCH_COUNT"
                      count={matches.count}
                      values={{ count: matches.count }}
                      components={{ b: <strong /> }}
                    />
                    {/* In the menu, asks to move to the sidebar, to see the matches in the table */}
                    {onMoveToSidebar ? (
                      <Box
                        component="button"
                        type="button"
                        aria-expanded={isConfirmingMove}
                        onClick={() => setIsConfirmingMove((isShown) => !isShown)}
                        sx={sx.matchesLink}
                      >
                        {t('STATS_PAGE.CATEGORY_RULES.VIEW_MATCHES')}
                      </Box>
                    ) : null}
                  </Box>
                  {/* In the sidebar, scrolls the table through the matches */}
                  {onFocusMatch ? (
                    <Box sx={sx.matchNav}>
                      {focusedIndex >= 0 ? (
                        <span>
                          {t('STATS_PAGE.CATEGORY_RULES.MATCH_POSITION', {
                            index: focusedIndex + 1,
                            count: matches.count,
                          })}
                        </span>
                      ) : null}
                      {MATCH_STEPS.map(({ step, labelKey, Icon }) => (
                        <IconButton
                          key={step}
                          size="small"
                          color="inherit"
                          // Only to scroll to the single match
                          disabled={matches.count < 2 && focusedIndex === 0}
                          onClick={() => focusMatch(step)}
                          aria-label={t(labelKey)}
                          title={t(labelKey)}
                          sx={sx.matchNavButton}
                        >
                          <Icon fontSize="inherit" />
                        </IconButton>
                      ))}
                    </Box>
                  ) : null}
                </Box>
              ) : null}
              {/* Below the count, asks before moving the form to the sidebar */}
              {matches?.count && isConfirmingMove ? (
                <Box sx={sx.confirm}>
                  <span>{t('STATS_PAGE.CATEGORY_RULES.CONFIRM_MOVE')}</span>
                  <Box sx={sx.confirmActions}>
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => setIsConfirmingMove(false)}
                      sx={sx.confirmButton}
                    >
                      {t('STATS_PAGE.CATEGORY_RULES.CANCEL')}
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="info"
                      disableElevation
                      onClick={() => onMoveToSidebar?.(draft)}
                      sx={sx.confirmButton}
                    >
                      {t('STATS_PAGE.CATEGORY_RULES.CONTINUE_IN_SIDEBAR')}
                    </Button>
                  </Box>
                </Box>
              ) : null}
              {/* Close to the count above it */}
              {matches && trimmedKeyword && !matches.isMatch ? (
                <Box sx={{ ...sx.notice(false), ...(matches.count ? sx.nextNotice : null) }}>
                  <WarningAmberOutlined sx={sx.noticeIcon} />
                  {t('STATS_PAGE.CATEGORY_RULES.NO_MATCH')}
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
