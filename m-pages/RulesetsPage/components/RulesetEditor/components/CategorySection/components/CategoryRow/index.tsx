'use client'

import { ArrowDownward, ArrowUpward, ChevronRight, MoreHoriz, SwapHoriz } from '@mui/icons-material'
import { Box, ButtonBase, Chip, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'

import type { CategoryColor } from '@/types-enums'
import { CATEGORY_COLORS } from '@/common'
import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

type CategoryRowProps = {
  label: string
  isParent?: boolean
  /**
   * Of parent categories.
   */
  color?: CategoryColor
  ruleCount: number
  /**
   * Of subcategories: internal transfers, excluded from profit and loss.
   */
  isTransfer?: boolean
  /**
   * The system categories can't be changed.
   */
  isFixed?: boolean
  /**
   * Shows or hides the subcategories of a parent category, or the rules of a subcategory, below it.
   */
  onToggle?: () => void
  isExpanded?: boolean
  /**
   * Opens the menu to edit or delete it.
   */
  onMenu: (anchor: HTMLElement) => void
  onMove: (step: -1 | 1) => void
  canMoveUp: boolean
  canMoveDown: boolean
}

/**
 * A (parent) category, moved with its arrows, edited or deleted in its menu.
 */
const Component = ({
  label,
  isParent = false,
  color,
  ruleCount,
  isTransfer = false,
  isFixed = false,
  onToggle,
  isExpanded = false,
  onMenu,
  onMove,
  canMoveUp,
  canMoveDown,
}: CategoryRowProps) => {
  const theme = useTheme()
  const sx = ui(theme)
  const { t } = useTranslation()

  // Native titles, many rows are shown
  const renderAction = (title: string, icon: ReactNode, onClick: () => void, disabled = false) => (
    <IconButton size="small" title={title} aria-label={title} onClick={onClick} disabled={disabled} sx={sx.action}>
      {icon}
    </IconButton>
  )

  return (
    <Box sx={sx.row(isParent)}>
      {/* Parent categories expand to their subcategories, subcategories to their rules */}
      <Box
        component={onToggle ? ButtonBase : 'span'}
        {...(onToggle ? { onClick: onToggle, 'aria-expanded': isExpanded } : {})}
        sx={sx.main(!!onToggle)}
      >
        {/* Fixed ones keep the space, so the names are aligned */}
        {onToggle ? <ChevronRight sx={sx.chevron(isExpanded)} /> : <Box component="span" sx={sx.chevronSpace} />}
        {isParent && color ? <Box component="span" sx={sx.dot(CATEGORY_COLORS[color])} /> : null}
        <Box component="span" sx={sx.label(isParent, isFixed)}>
          {label}
        </Box>

        {isTransfer ? (
          <Chip
            component="span"
            size="small"
            icon={<SwapHoriz />}
            label={t('RULESETS_PAGE.TRANSFER')}
            title={t('RULESETS_PAGE.TRANSFER_DESCRIPTION')}
            sx={sx.transfer}
          />
        ) : null}

        <Box component="span" sx={sx.count}>
          {ruleCount
            ? t('RULESETS_PAGE.RULE_COUNT', { count: ruleCount })
            : onToggle
              ? t('RULESETS_PAGE.NO_RULES_SHORT')
              : null}
        </Box>
      </Box>

      {isFixed ? (
        <Box component="span" title={t('RULESETS_PAGE.FIXED_HINT')} sx={sx.fixed}>
          {isParent ? t('RULESETS_PAGE.FIXED') : null}
        </Box>
      ) : (
        <Box sx={sx.actions}>
          <Box sx={sx.moves}>
            {renderAction(t('RULESETS_PAGE.MOVE_UP'), <ArrowUpward fontSize="inherit" />, () => onMove(-1), !canMoveUp)}
            {renderAction(
              t('RULESETS_PAGE.MOVE_DOWN'),
              <ArrowDownward fontSize="inherit" />,
              () => onMove(1),
              !canMoveDown,
            )}
          </Box>
          <IconButton
            size="small"
            title={t('RULESETS_PAGE.ACTIONS')}
            aria-label={t('RULESETS_PAGE.ACTIONS_NAMED', { name: label })}
            aria-haspopup="menu"
            onClick={(event) => onMenu(event.currentTarget)}
            sx={sx.action}
          >
            <MoreHoriz fontSize="inherit" />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}

export default Component
