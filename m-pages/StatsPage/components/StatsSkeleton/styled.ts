import { sxListRowTitle } from '@/styles/styled'

import { ui as statsListUi } from '../StatsList/styled'
import { ui as statsRowUi } from '../StatsRow/styled'

/**
 * The layout of the expanded stats row and its list, static and greyed out.
 */
export const ui = () => {
  const rowSx = statsRowUi()
  const listSx = statsListUi()

  return {
    item: rowSx.item,
    row: {
      ...rowSx.row,
      display: 'flex',
      alignItems: 'center',
    },
    title: {
      ...sxListRowTitle,
      color: 'text.disabled',
    },
    details: rowSx.details,
    count: listSx.count,
    listRow: listSx.row,
    label: listSx.label,
    value: listSx.value,
    totalRow: {
      ...listSx.row,
      ...listSx.totalRow,
      borderColor: 'divider',
    },
    totalLabel: {
      ...listSx.label,
      ...listSx.total,
    },
    totalValue: {
      ...listSx.value,
      ...listSx.total,
    },
  }
}
