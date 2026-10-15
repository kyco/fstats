'use client'

import { Box, Divider } from '@mui/material'
import NextLink from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'

import type { CurrencyFilter, FilterOption } from '@/types'
import { getView, getViewChange, getWorkspaceHref, WorkspaceView } from '@/common'
import { RadioItem } from '@/components'
import { useTranslation } from '@/lib/i18n'

import Filters from '../Filters'
import RulesetSelect from '../RulesetSelect'
import { ui } from './styled'

type ViewToolbarProps = {
  children?: ReactNode
  /**
   * On the right, next to the filters, e.g. a search field.
   */
  end?: ReactNode
  /**
   * Switches of the transactions table.
   */
  options?: FilterOption[]
  /**
   * Currencies in the filters, omitted where they don't apply.
   */
  currency?: CurrencyFilter
}

/**
 * Toolbar of the middle column: switches between the CSV, transactions, breakdown and stats views (raw to most summarised), followed by the view's own controls
 * and the filters.
 */
const Component = ({ children, end, options, currency }: ViewToolbarProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const activeView = getView(searchParams)
  const views = [
    { view: WorkspaceView.CSV, label: t('STATS_PAGE.VIEW.CSV') },
    { view: WorkspaceView.TRANSACTIONS, label: t('STATS_PAGE.VIEW.TRANSACTIONS') },
    { view: WorkspaceView.BREAKDOWN, label: t('STATS_PAGE.VIEW.BREAKDOWN') },
    { view: WorkspaceView.STATS, label: t('STATS_PAGE.VIEW.STATS') },
  ]

  return (
    <Box sx={sx.toolbar}>
      <Box component="nav" sx={sx.views}>
        {views.map(({ view, label }) => {
          const isActive = view === activeView

          return (
            <RadioItem
              key={view}
              component={NextLink}
              // Keeps e.g. demo mode when switching
              href={getWorkspaceHref(searchParams, getViewChange(view))}
              label={label}
              isActive={isActive}
              aria-current={isActive ? 'page' : undefined}
            />
          )
        })}
      </Box>
      {children ? <Divider orientation="vertical" flexItem sx={sx.divider} /> : null}
      {children}
      <Box sx={sx.spacer} />
      {end}
      {/* On every view, so the toolbar doesn't change when switching */}
      <RulesetSelect />
      <Filters options={options ?? []} currency={currency} />
    </Box>
  )
}

export default Component
