'use client'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'

import type { CategoryRuleset } from '@/types'
import { useCategoryRules, useMutateAddRuleset } from '@/m-category/service'
import { DEFAULT_TEMPLATE_ID, TEMPLATES } from '@/utils/Category'
import { useTranslation } from '@/lib/i18n'

import { getStartGroups, parseStart, toTemplateStart } from './actions'
import { ui } from './styled'

type NewRulesetDialogProps = {
  isOpen: boolean
  rulesets: CategoryRuleset[]
  onClose: () => void
  onCreated: (id: string) => void
}

/**
 * Creates a rule set from a template (e.g. to start over with the standard categories), as a copy of one of the user's
 * changed rule sets, or empty (no categories).
 */
const Component = ({ isOpen, rulesets, onClose, onCreated }: NewRulesetDialogProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const [start, setStart] = useState(toTemplateStart(DEFAULT_TEMPLATE_ID))
  // Suggested by the chosen start (e.g. "Standard") until changed
  const [name, setName] = useState<string | null>(null)
  const { mutateAsync: addRuleset, isPending } = useMutateAddRuleset()
  const { data: rules = [] } = useCategoryRules()
  const groups = getStartGroups({ templates: TEMPLATES, rulesets, rules, t })
  const options = groups.flatMap((group) => group.options)
  const shownName = name ?? options.find((option) => option.value === start)?.name ?? ''
  const canCreate = !!shownName.trim() && !isPending

  const close = () => {
    setName(null)
    onClose()
  }

  const create = async () => {
    const ruleset = await addRuleset({ name: shownName.trim(), ...parseStart(start) })
    setName(null)
    onCreated(ruleset.id)
  }

  return (
    <Dialog open={isOpen} onClose={close} fullWidth maxWidth="xs">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (canCreate) {
            create()
          }
        }}
      >
        <DialogTitle>{t('RULESETS_PAGE.NEW_RULESET')}</DialogTitle>
        <DialogContent>
          <RadioGroup value={start} onChange={(event) => setStart(event.target.value)}>
            {groups.map((group) => (
              <Box key={group.title} sx={sx.group}>
                <Typography component="p" sx={sx.groupTitle}>
                  {group.title}
                </Typography>
                {group.options.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio size="small" />}
                    label={
                      <>
                        <Box component="span" sx={sx.optionLabel}>
                          {option.label}
                        </Box>
                        {[option.counts, option.description].map((text) =>
                          text ? (
                            <Box key={text} component="span" sx={sx.optionDescription}>
                              {text}
                            </Box>
                          ) : null,
                        )}
                      </>
                    }
                    sx={sx.option}
                  />
                ))}
              </Box>
            ))}
          </RadioGroup>
          <TextField
            fullWidth
            size="small"
            label={t('RULESETS_PAGE.NAME')}
            value={shownName}
            onChange={(event) => setName(event.target.value)}
            sx={sx.name}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={close}>
            {t('STATS_PAGE.CATEGORY_RULES.CANCEL')}
          </Button>
          <Button type="submit" variant="contained" disabled={!canCreate} loading={isPending}>
            {t('RULESETS_PAGE.CREATE')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default Component
