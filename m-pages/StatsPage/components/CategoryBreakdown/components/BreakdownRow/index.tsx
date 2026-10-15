import { ButtonBase } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'

import type { NumberString, ParentCategoryWithTransactions } from '@/types'
import { Currency } from '@/types-enums'
import { PARENT_CATEGORY_COLORS } from '@/common'
import { Big } from '@/lib/w-big'

import { getSortedCategories } from '../../actions'
import BreakdownCells from '../BreakdownCells'
import { ui } from './styled'

type BreakdownRowProps = {
  category: ParentCategoryWithTransactions
  parentCategoryTotal: NumberString
  currency: Currency
}

const Component = ({ category, parentCategoryTotal, currency }: BreakdownRowProps) => {
  const theme = useTheme()
  const sx = ui(theme)
  const color = PARENT_CATEGORY_COLORS[category.code]
  const [expanded, setExpanded] = useState(false)
  const subcategories = getSortedCategories(Object.values(category.subcategories), 'totalDesc')

  return (
    <ButtonBase sx={sx.button} onClick={() => setExpanded(!expanded)}>
      <BreakdownCells
        label={category.label}
        total={category.total}
        parentCategoryTotal={parentCategoryTotal}
        currency={currency}
        color={color}
        size="md"
      />

      {expanded
        ? subcategories.map((subcategory) => (
            <BreakdownCells
              key={subcategory.code}
              label={subcategory.label}
              total={subcategory.total}
              parentCategoryTotal={Big(category.total).abs().toString()}
              currency={currency}
              color={color}
              size="sm"
            />
          ))
        : null}
    </ButtonBase>
  )
}

export default Component
