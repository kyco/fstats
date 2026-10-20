'use client'

import { ArrowDropDown, Check, LabelOutlined, SettingsOutlined } from '@mui/icons-material'
import { Box, Button, Tooltip } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ROUTES } from '@/common'
import { DropdownMenu, DropdownMenuDivider, DropdownMenuItem } from '@/components'
import { useActiveRuleset } from '@/m-category/service'
import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

/**
 * Switches the rule set that decides the categories (also in demo mode), and links to the rule sets page to manage
 * them.
 */
const Component = () => {
  const sx = ui()
  const { t } = useTranslation()
  const router = useRouter()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const { ruleset: activeRuleset, rulesets, setActiveId } = useActiveRuleset()
  const title = t('STATS_PAGE.CATEGORY_RULES.TITLE')
  const label = activeRuleset?.name ?? t('STATS_PAGE.CATEGORY_RULES.NONE')

  return (
    <>
      <Tooltip title={title}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<LabelOutlined />}
          endIcon={<ArrowDropDown />}
          onClick={(event) => setAnchor(event.currentTarget)}
          aria-label={title}
          aria-haspopup="menu"
          aria-expanded={anchor ? true : undefined}
          sx={sx.button}
        >
          <Box component="span" sx={sx.buttonLabel}>
            {label}
          </Box>
        </Button>
      </Tooltip>
      <DropdownMenu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {rulesets.map((ruleset) => {
          const isActive = ruleset.id === activeRuleset?.id

          return (
            <DropdownMenuItem
              key={ruleset.id}
              onClick={() => {
                setActiveId(ruleset.id)
                setAnchor(null)
              }}
              role="menuitemradio"
              aria-checked={isActive}
              start={<Check sx={sx.check(isActive)} />}
              label={
                <Box component="span" sx={sx.name}>
                  {ruleset.name}
                </Box>
              }
            />
          )
        })}
        <DropdownMenuDivider />
        <DropdownMenuItem
          onClick={() => router.push(ROUTES.RULESETS)}
          start={<SettingsOutlined sx={sx.icon} />}
          label={t('STATS_PAGE.CATEGORY_RULES.MANAGE')}
        />
      </DropdownMenu>
    </>
  )
}

export default Component
