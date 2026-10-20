'use client'

import { ExpandMore } from '@mui/icons-material'
import { Box, ButtonBase, Checkbox, FormControlLabel, Typography } from '@mui/material'
import { useState } from 'react'

import type { RuleAmounts } from '@/types'
import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type RuleMoreOptionsProps = {
  /**
   * Both by default, e.g. a refund of an expense stays in its category.
   */
  amounts: RuleAmounts
  onAmountsChange: (amounts: RuleAmounts) => void
}

/**
 * Options of a keyword rule that are rarely changed, collapsed unless one is (e.g. when editing a rule): limiting it to
 * money in or out.
 */
const Component = ({ amounts, onAmountsChange }: RuleMoreOptionsProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(() => !amounts.in || !amounts.out)

  return (
    <Box sx={sx.wrapper}>
      <ButtonBase aria-expanded={isOpen} onClick={() => setIsOpen((prev) => !prev)} sx={sx.toggle}>
        <ExpandMore sx={sx.chevron(isOpen)} />
        {t('STATS_PAGE.CATEGORY_RULES.MORE_OPTIONS')}
      </ButtonBase>

      {isOpen ? (
        <Box sx={sx.options}>
          <Box>
            <Box sx={sx.label}>{t('STATS_PAGE.CATEGORY_RULES.AMOUNTS')}</Box>
            <Box sx={sx.checkboxes}>
              {(['out', 'in'] as const).map((key) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={amounts[key]}
                      onChange={(_, checked) => onAmountsChange({ ...amounts, [key]: checked })}
                    />
                  }
                  label={t(`STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.${key.toUpperCase()}_TITLE`)}
                  sx={sx.checkbox}
                />
              ))}
            </Box>
            <Typography component="p" sx={sx.hint}>
              {t('STATS_PAGE.CATEGORY_RULES.AMOUNTS_HINT')}
            </Typography>
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}

export default Component
