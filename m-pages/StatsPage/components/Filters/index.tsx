'use client'

import { ArrowDownward, ArrowUpward, ChevronRight, InfoOutlined, TuneOutlined } from '@mui/icons-material'
import { Badge, Box, IconButton, Popover, Radio, Switch, Tooltip } from '@mui/material'
import { countBy, sumBy } from 'lodash'
import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

import type { CurrencyFilter, FilterOption, SelectedCurrency } from '@/types'
import { AmountFilter } from '@/types-enums'
import { getView, WorkspaceView } from '@/common'
import { OutlineCheckbox } from '@/components'
import { filterAmount, filterTransactions, toAmountFilter } from '@/m-transaction/service'
import { onRowKeyDown } from '@/utils/Event'
import { countIn, getCheckState, toggleKey, toggleKeys } from '@/utils/Set'
import { useTranslation } from '@/lib/i18n'

import { ALL_CURRENCIES } from '../../actions'
import { useStatsTransactions, useWorkspaceCategories, useWorkspaceFiles } from '../../context'
import { useTableOptions, useTransactionFilter } from '../../hooks'
import { getCategoryGroups } from './actions'
import { ui } from './styled'

type FiltersProps = {
  /**
   * Switches of the transactions table.
   */
  options: FilterOption[]
  currency?: CurrencyFilter
}

/**
 * Filters button on the right of the toolbar, with a panel of the currencies, switches for the transactions table, the
 * direction (same as the toolbar toggle, not in the breakdown) and the income and expense categories (of the shown files) as trees, styled like the date explorer. Marked while a filter is on. Disabled in
 * the CSV view and without checked files.
 */
const Component = ({ options, currency }: FiltersProps) => {
  const sx = ui()
  const { t } = useTranslation()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const view = getView(useSearchParams())
  const { checkedFiles } = useWorkspaceFiles()
  const { unique, shown } = useStatsTransactions()
  const { includeDateExcluded, includeDuplicates } = useTableOptions()
  const { amountFilter, setAmountFilter, excludedCategories: excluded, setExcludedCategories } = useTransactionFilter()
  // The profit and loss nets money in and out, so the amount filter doesn't apply
  const hasAmount = view !== WorkspaceView.BREAKDOWN
  const amount = hasAmount ? amountFilter : AmountFilter.ALL
  // The counted transactions (without duplicates, on selected days) matching the amount filter
  const transactions = useMemo(() => filterAmount(shown, amount), [shown, amount])
  const { tree } = useWorkspaceCategories()
  const groups = useMemo(() => getCategoryGroups({ transactions, tree, t }), [transactions, tree, t])
  // Those the view shows, also with the category filter
  const viewTransactions = view === WorkspaceView.TRANSACTIONS && includeDateExcluded ? unique : shown
  const currencyCounts = useMemo(
    () =>
      countBy(
        filterTransactions(viewTransactions, { amount, excludedCategories: excluded }),
        (transaction) => transaction.currency,
      ),
    [viewTransactions, amount, excluded],
  )
  const isInShown = amountFilter === AmountFilter.ALL || amountFilter === AmountFilter.IN
  const isOutShown = amountFilter === AmountFilter.ALL || amountFilter === AmountFilter.OUT
  const getAmountCount = (value: AmountFilter) =>
    hasAmount ? filterTransactions(viewTransactions, { amount: value, excludedCategories: excluded }).length : 0
  const amountOptions: FilterOption[] = [
    {
      key: 'in',
      label: t('STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.IN_TITLE'),
      count: getAmountCount(AmountFilter.IN),
      checked: isInShown,
      onChange: (checked) => setAmountFilter(toAmountFilter(checked, isOutShown)),
    },
    {
      key: 'out',
      label: t('STATS_PAGE.DATA_VIEW.AMOUNT_FILTER.OUT_TITLE'),
      count: getAmountCount(AmountFilter.OUT),
      checked: isOutShown,
      onChange: (checked) => setAmountFilter(toAmountFilter(isInShown, checked)),
    },
  ]
  // Shown (disabled) in all views, so the panel looks the same
  const hasTable = options.length > 0
  const tableOptions: FilterOption[] = hasTable
    ? options
    : [
        {
          key: 'dateExcluded',
          label: t('STATS_PAGE.DATA_VIEW.SHOW_DATE_EXCLUDED'),
          count: 0,
          checked: includeDateExcluded,
          onChange: () => undefined,
        },
        {
          key: 'duplicates',
          label: t('STATS_PAGE.DATA_VIEW.SHOW_DUPLICATES'),
          count: 0,
          checked: includeDuplicates,
          onChange: () => undefined,
        },
      ]
  const disabled = !checkedFiles.length || view === WorkspaceView.CSV
  const currencies = currency?.currencies ?? []
  // Hidden with a single currency
  const hasCurrencyChoice = currencies.length > 1
  const canSelectCurrency = hasCurrencyChoice && !currency?.disabled
  const selectedCurrency = canSelectCurrency ? currency?.value : ALL_CURRENCIES
  const currencyOptions: { value: SelectedCurrency; label: string; count: number }[] = hasCurrencyChoice
    ? [
        {
          value: ALL_CURRENCIES,
          label: t('STATS_PAGE.FILTERS.ALL_CURRENCIES'),
          count: sumBy(currencies, (value) => currencyCounts[value] ?? 0),
        },
        // Only "All" when disabled
        ...(canSelectCurrency
          ? currencies.map((value) => ({ value, label: value, count: currencyCounts[value] ?? 0 }))
          : []),
      ]
    : []
  const allKeys = groups.flatMap((group) => group.parents.flatMap((parent) => parent.keys))
  const isActive =
    selectedCurrency !== ALL_CURRENCIES ||
    amount !== AmountFilter.ALL ||
    options.some((option) => option.checked && option.count) ||
    countIn(excluded, allKeys) > 0

  const onToggle = (keys: string[]) => setExcludedCategories(toggleKeys(excluded, keys))

  const toggleExpanded = (key: string) => setExpanded(toggleKey(expanded, key))

  // With both money in and out, their counts are shown next to the count
  const renderCategoryRow = ({
    key,
    label,
    count,
    inCount,
    keys,
    start,
    isParent = false,
    onClick,
    rowSx,
    labelSx,
  }: {
    key: string
    label: ReactNode
    count: number
    inCount: number
    keys: string[]
    start?: ReactNode
    isParent?: boolean
    onClick?: () => void
    rowSx?: object
    labelSx?: object
  }) => {
    // Without transactions, parents can still be expanded. The check state shows the selection, whatever the counts
    const isDisabled = !count
    const state = getCheckState(countIn(excluded, keys), keys.length)
    const isDeselected = !state.checked && !state.indeterminate
    const onRowClick = onClick ?? (isDisabled ? undefined : () => onToggle(keys))

    return (
      <Box
        key={key}
        onClick={onRowClick}
        role="button"
        tabIndex={onRowClick ? 0 : -1}
        aria-disabled={isDisabled}
        onKeyDown={onRowKeyDown}
        sx={{ ...sx.row(!onRowClick), ...rowSx }}
      >
        {start}
        <OutlineCheckbox
          {...state}
          disabled={isDisabled}
          onClick={(event) => event.stopPropagation()}
          onChange={() => onToggle(keys)}
        />
        <Box component="span" sx={{ ...sx.categoryLabel(isDeselected || isDisabled, isParent), ...labelSx }}>
          {label}
        </Box>
        {inCount > 0 && inCount < count ? (
          <Tooltip title={t('STATS_PAGE.FILTERS.IN_OUT', { in: inCount, out: count - inCount })}>
            <Box component="span" sx={sx.flows}>
              <ArrowUpward sx={sx.flowIcon} />
              {inCount}
              <ArrowDownward sx={sx.flowIcon} />
              {count - inCount}
            </Box>
          </Tooltip>
        ) : null}
        <Box component="span" sx={isDisabled ? { ...sx.count, ...sx.emptyCount } : sx.count}>
          {count}
        </Box>
      </Box>
    )
  }

  type RenderSwitchRowProps = {
    /**
     * Enabled also without transactions, e.g. so a hidden direction can be shown again.
     */
    isAlwaysEnabled?: boolean
    /**
     * Doesn't apply to the view, shown without its count.
     */
    isInapplicable?: boolean
  }

  const renderSwitchRow = (option: FilterOption, { isAlwaysEnabled, isInapplicable }: RenderSwitchRowProps = {}) => {
    const isDisabled = isInapplicable || (!isAlwaysEnabled && !option.count)

    return (
      <Box
        key={option.key}
        onClick={isDisabled ? undefined : () => option.onChange(!option.checked)}
        role="switch"
        aria-checked={option.checked}
        aria-disabled={isDisabled}
        tabIndex={isDisabled ? -1 : 0}
        onKeyDown={onRowKeyDown}
        sx={sx.optionRow(isDisabled)}
      >
        <Switch size="small" checked={option.checked} disabled={isDisabled} tabIndex={-1} sx={sx.switch} />
        <Box component="span" sx={sx.label}>
          {option.label}
        </Box>
        {isInapplicable ? null : (
          <Box component="span" sx={sx.count}>
            {option.count}
          </Box>
        )}
      </Box>
    )
  }

  const renderRadioRow = ({
    key,
    label,
    count,
    checked,
    isDisabled = false,
    onSelect,
  }: {
    key: string
    label: string
    count: number
    checked: boolean
    isDisabled?: boolean
    onSelect: () => void
  }) => (
    <Box
      key={key}
      onClick={isDisabled ? undefined : onSelect}
      role="radio"
      aria-checked={checked}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      onKeyDown={onRowKeyDown}
      sx={sx.optionRow(isDisabled)}
    >
      <Radio size="small" checked={checked} disabled={isDisabled} tabIndex={-1} sx={sx.radio} />
      <Box component="span" sx={sx.label}>
        {label}
      </Box>
      <Box component="span" sx={sx.count}>
        {count}
      </Box>
    </Box>
  )

  return (
    <>
      <Tooltip
        title={
          !checkedFiles.length
            ? t('STATS_PAGE.NO_SELECTION.TITLE')
            : disabled
              ? t('STATS_PAGE.CSV_DISABLED')
              : t('STATS_PAGE.FILTERS.TITLE')
        }
      >
        {/* Disabled buttons don't fire hover events */}
        <Box component="span" sx={sx.button}>
          <IconButton
            size="small"
            disabled={disabled}
            onClick={(event) => setAnchor(event.currentTarget)}
            aria-label={t('STATS_PAGE.FILTERS.TITLE')}
            aria-haspopup="dialog"
            aria-expanded={anchor ? true : undefined}
          >
            <Badge variant="dot" color="primary" invisible={disabled || !isActive}>
              <TuneOutlined sx={sx.icon} />
            </Badge>
          </IconButton>
        </Box>
      </Tooltip>
      <Popover
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: sx.paper } }}
      >
        <Box sx={sx.columns}>
          <Box sx={sx.column}>
            {currencyOptions.length ? (
              <Box role="radiogroup" aria-label={t('STATS_PAGE.FILTERS.CURRENCY')} sx={sx.section}>
                <Box sx={sx.header}>{t('STATS_PAGE.FILTERS.CURRENCY')}</Box>
                {currencyOptions.map((option) =>
                  renderRadioRow({
                    key: option.value,
                    label: option.label,
                    count: option.count,
                    checked: option.value === selectedCurrency,
                    isDisabled: !canSelectCurrency,
                    onSelect: () => currency?.onChange(option.value),
                  }),
                )}
              </Box>
            ) : null}
            <Box sx={sx.section}>
              <Box sx={sx.header}>{t('STATS_PAGE.FILTERS.TABLE')}</Box>
              {hasTable ? null : (
                <Box sx={sx.sectionNote}>
                  <InfoOutlined sx={sx.noteIcon} />
                  {t('STATS_PAGE.FILTERS.TABLE_ONLY')}
                </Box>
              )}
              {tableOptions.map((option) => renderSwitchRow(option, { isInapplicable: !hasTable }))}
            </Box>
            <Box sx={sx.section}>
              <Box sx={sx.header}>{t('STATS_PAGE.FILTERS.AMOUNTS')}</Box>
              {hasAmount ? null : (
                <Box sx={sx.sectionNote}>
                  <InfoOutlined sx={sx.noteIcon} />
                  {t('STATS_PAGE.FILTERS.AMOUNTS_ONLY')}
                </Box>
              )}
              {amountOptions.map((option) =>
                renderSwitchRow(option, { isAlwaysEnabled: true, isInapplicable: !hasAmount }),
              )}
            </Box>
          </Box>
          {groups.map((group) => (
            <Box key={group.key} sx={sx.column}>
              {renderCategoryRow({
                key: group.key,
                label: group.label,
                count: sumBy(group.parents, 'count'),
                inCount: sumBy(group.parents, 'inCount'),
                keys: group.parents.flatMap((parent) => parent.keys),
                rowSx: sx.groupRow,
                labelSx: sx.groupLabel,
              })}
              <Box sx={sx.scroll}>
                {group.parents.flatMap((parent) => {
                  const isExpanded = expanded.has(parent.key)
                  const hasChildren = parent.children.length > 0

                  return [
                    renderCategoryRow({
                      key: parent.key,
                      label: parent.label,
                      count: parent.count,
                      inCount: parent.inCount,
                      keys: parent.keys,
                      isParent: hasChildren,
                      // Parents expand like the months of the date explorer, their checkbox toggles them
                      onClick: hasChildren ? () => toggleExpanded(parent.key) : undefined,
                      start: hasChildren ? (
                        <Box component="span" sx={sx.expandIcon}>
                          <ChevronRight style={{ transform: isExpanded ? 'rotate(90deg)' : undefined }} />
                        </Box>
                      ) : (
                        <Box sx={sx.expandSpacer} />
                      ),
                      rowSx: sx.parentRow,
                    }),
                    ...(isExpanded
                      ? parent.children.map((child) =>
                          renderCategoryRow({
                            key: child.key,
                            label: child.label,
                            count: child.count,
                            inCount: child.inCount,
                            keys: [child.key],
                            start: <Box sx={sx.expandSpacer} />,
                            rowSx: sx.childRow,
                          }),
                        )
                      : []),
                  ]
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  )
}

export default Component
