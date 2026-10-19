'use client'

import { ExpandMore } from '@mui/icons-material'
import { Box, ButtonBase } from '@mui/material'
import type { ReactNode } from 'react'
import { Fragment, useState } from 'react'

import type { NumberString, ProfitLoss, ProfitLossRow, ProfitLossRowVariant } from '@/types'
import type { BreakdownPeriod } from '@/types-enums'
import { MISC } from '@/common'
import { useUserPreferences } from '@/m-user/service'
import { getCurrencySymbol } from '@/utils/Currency'
import { toDisplayDate } from '@/utils/Date'
import { toFixedLocale, toFixedLocaleAmount } from '@/utils/Number'
import { toggleKey } from '@/utils/Set'
import { useTranslation } from '@/lib/i18n'
import { Big } from '@/lib/w-big'

import { getAmountColor } from '../../../../actions'
import { getPeriodLabel } from '../../actions'
import { EMPTY_AMOUNT } from './actions'
import { ui } from './styled'

type ProfitLossTableProps = {
  profitLoss: ProfitLoss
  period: BreakdownPeriod
}

/**
 * Income statement with one column per period and the total, like a profit and loss sheet.
 */
const Component = ({ profitLoss, period }: ProfitLossTableProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const { locale, dateFormat } = useUserPreferences()
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const { currency, periods, income, expenses, net, netMargin, transfers } = profitLoss
  const columnCount = periods.length + 2

  const toggle = (key: string) => setExpandedKeys((prev) => toggleKey(prev, key))

  const formatAmount = (value: NumberString | undefined) => {
    return value === undefined || Big(value).eq(0) ? EMPTY_AMOUNT : toFixedLocaleAmount({ value, currency, locale })
  }

  const formatPercent = (value: NumberString | undefined) => {
    return value === undefined ? EMPTY_AMOUNT : `${toFixedLocale({ value, round: 1, locale })}%`
  }

  const renderAmount = (value: NumberString | undefined, key: string, variant: ProfitLossRowVariant) => (
    <Box
      component="td"
      key={key}
      sx={{ ...sx.amount(variant), color: value ? getAmountColor(value) : 'text.disabled' }}
    >
      {variant === 'rate' ? formatPercent(value) : formatAmount(value)}
    </Box>
  )

  const renderRow = (row: ProfitLossRow, variant: ProfitLossRowVariant, parentKey = ''): ReactNode => {
    const key = `${parentKey}${row.key}`
    const isExpandable = row.children.length > 0
    const isExpanded = expandedKeys.has(key)
    const childVariant = row.children[0]?.date ? 'transaction' : 'subcategory'
    const label = row.date
      ? `${toDisplayDate({ date: row.date, locale, formatTo: dateFormat })} ${MISC.CENTER_DOT} ${row.label}`
      : row.label

    return (
      <Fragment key={key}>
        {/* The whole row toggles, the button's clicks (also by keyboard) bubble up to it */}
        <Box
          component="tr"
          data-variant={variant}
          onClick={isExpandable ? () => toggle(key) : undefined}
          sx={{ ...sx.row, ...(isExpandable ? sx.expandable : {}) }}
        >
          <Box component="th" scope="row" sx={sx.labelCell(variant)} title={label}>
            {/* Fixed width, so long descriptions are truncated rather than widening the cell */}
            <Box sx={sx.labelContent(variant)}>
              {isExpandable ? (
                <ButtonBase aria-expanded={isExpanded} disableRipple sx={sx.expandButton}>
                  <ExpandMore sx={{ ...sx.chevron, transform: isExpanded ? 'none' : 'rotate(-90deg)' }} />
                  <Box component="span" sx={sx.labelText}>
                    {label}
                  </Box>
                </ButtonBase>
              ) : (
                // Aligned with the labels after the chevrons
                <Box component="span" sx={{ ...sx.labelText, ...(variant === 'category' ? sx.chevronIndent : {}) }}>
                  {label}
                </Box>
              )}
            </Box>
          </Box>
          {periods.map((periodKey) => renderAmount(row.values[periodKey], periodKey, variant))}
          {renderAmount(row.total, 'total', variant)}
        </Box>
        {isExpandable && isExpanded ? row.children.map((child) => renderRow(child, childVariant, `${key}/`)) : null}
      </Fragment>
    )
  }

  const renderSection = (title: string, note?: string) => (
    <Box component="tr">
      <Box component="th" scope="rowgroup" sx={sx.sectionCell}>
        {title}
      </Box>
      <Box component="td" colSpan={columnCount - 1} sx={sx.sectionNote}>
        {note}
      </Box>
    </Box>
  )

  return (
    <Box sx={sx.scroll}>
      <Box component="table" sx={sx.table}>
        <thead>
          <tr>
            <Box component="th" scope="col" sx={sx.headerLabel}>
              {getCurrencySymbol(currency)}
            </Box>
            {periods.map((periodKey) => (
              <Box component="th" scope="col" key={periodKey} sx={sx.header}>
                {getPeriodLabel({ key: periodKey, period, locale })}
              </Box>
            ))}
            <Box component="th" scope="col" sx={sx.header}>
              {t('MISC.TOTAL')}
            </Box>
          </tr>
        </thead>
        <tbody>
          {renderSection(t('MISC.INCOME'))}
          {income.rows.map((row) => renderRow(row, 'category'))}
          {renderRow(income.total, 'total')}

          {renderSection(t('MISC.EXPENSES'))}
          {expenses.rows.map((row) => renderRow(row, 'category'))}
          {renderRow(expenses.total, 'total')}

          {renderRow(net, 'net')}
          <Box component="tr" sx={sx.row}>
            <Box component="th" scope="row" sx={sx.labelCell('rate')}>
              {t('STATS_PAGE.PROFIT_LOSS.NET_MARGIN')}
            </Box>
            {periods.map((periodKey) => renderAmount(netMargin.values[periodKey], periodKey, 'rate'))}
            {renderAmount(netMargin.total, 'total', 'rate')}
          </Box>
        </tbody>
        {transfers.count ? (
          <tbody>
            {renderSection(
              t('STATS_PAGE.PROFIT_LOSS.TRANSFERS'),
              t('STATS_PAGE.PROFIT_LOSS.TRANSFERS_NOTE', { count: transfers.count }),
            )}
            {transfers.incoming.children.length ? renderRow(transfers.incoming, 'category') : null}
            {transfers.outgoing.children.length ? renderRow(transfers.outgoing, 'category') : null}
            {renderRow(transfers.net, 'total')}
          </tbody>
        ) : null}
      </Box>
    </Box>
  )
}

export default Component
