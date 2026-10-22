'use client'

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { useState } from 'react'

import type { RuleDialogValues } from '@/types'
import { CategoryRuleDirection, CategoryRuleMatch } from '@/types-enums'
import { useTranslation } from '@/lib/i18n'

import MenuSelect from '../MenuSelect'
import RuleMoreOptions from '../RuleMoreOptions'
import { ui } from './styled'

type RuleDialogProps = {
  title: string
  initial: RuleDialogValues
  /**
   * Above the fields, e.g. that other rule sets use the rule too.
   */
  note?: string
  /**
   * Below the rule's fields, e.g. the category to map it to.
   */
  children?: ReactNode
  onSave: (values: RuleDialogValues) => void
  onClose: () => void
}

/**
 * Adds or edits a keyword rule, with the fields of the rule form of the category editor (stats page): how and what it
 * matches, and the rarely changed options (case, amounts).
 */
const Component = ({ title, initial, note, children, onSave, onClose }: RuleDialogProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const [match, setMatch] = useState(initial.match)
  const [keyword, setKeyword] = useState(initial.keyword)
  const [ignoreCase, setIgnoreCase] = useState(initial.ignoreCase)
  const [amounts, setAmounts] = useState({
    in: initial.direction !== CategoryRuleDirection.OUT,
    out: initial.direction !== CategoryRuleDirection.IN,
  })
  // Shown once the keyword was changed (or saving was tried), not when the dialog opens empty
  const [isTouched, setIsTouched] = useState(false)
  const isEmpty = !keyword.trim()
  const canSave = !isEmpty && (amounts.in || amounts.out)
  const direction =
    amounts.in && amounts.out
      ? CategoryRuleDirection.ANY
      : amounts.in
        ? CategoryRuleDirection.IN
        : CategoryRuleDirection.OUT

  const renderField = (label: string, control: ReactNode) => (
    <Box sx={sx.field}>
      <Box sx={sx.label}>{label}</Box>
      {control}
    </Box>
  )

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setIsTouched(true)
          if (canSave) {
            onSave({ match, keyword: keyword.trim(), ignoreCase, direction })
          }
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent sx={sx.content}>
          {note ? (
            <Typography component="p" sx={sx.note}>
              {note}
            </Typography>
          ) : null}
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
                  autoFocus
                  size="small"
                  value={keyword}
                  placeholder={t('RULESETS_PAGE.KEYWORD_PLACEHOLDER')}
                  onChange={(event) => {
                    setKeyword(event.target.value)
                    setIsTouched(true)
                  }}
                  error={isTouched && isEmpty}
                  helperText={isTouched && isEmpty ? t('RULESETS_PAGE.KEYWORD_REQUIRED') : undefined}
                  slotProps={{ htmlInput: { 'aria-label': t('RULESETS_PAGE.KEYWORD') } }}
                  sx={sx.input}
                />
              </Box>
              {/* Ticked to match the case, ignored by default (banks write names differently, e.g. "REWE" and "Rewe") */}
              <FormControlLabel
                control={<Checkbox checked={!ignoreCase} onChange={(_, checked) => setIgnoreCase(!checked)} />}
                label={t('STATS_PAGE.CATEGORY_RULES.MATCH_CASE')}
                sx={sx.checkbox}
              />
            </>,
          )}
          {children}
          <RuleMoreOptions amounts={amounts} onAmountsChange={setAmounts} />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={onClose}>
            {t('STATS_PAGE.CATEGORY_RULES.CANCEL')}
          </Button>
          <Button type="submit" variant="contained" disabled={!amounts.in && !amounts.out}>
            {t('STATS_PAGE.CATEGORY_RULES.SAVE')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default Component
