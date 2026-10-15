'use client'

import { ArrowDownward, ArrowUpward } from '@mui/icons-material'
import { Box, Divider, Grid, Typography } from '@mui/material'
import { useState } from 'react'

import type { NumberString, ParentCategoryWithTransactions, SortingPref } from '@/types'
import { Currency } from '@/types-enums'
import { getCurrencySymbol } from '@/utils/Currency'
import { useTranslation } from '@/lib/i18n'

import { COL_SPACING, COL1, COL2, COL3, getSortedCategories } from '../../actions'
import BreakdownRow from '../BreakdownRow'
import { ui } from './styled'

type BreakdownTableProps = {
  title: string
  emptyText: string
  transactionsGrouped: ParentCategoryWithTransactions[]
  total: NumberString
  currency: Currency
  showAll?: boolean
}

const Component = ({
  title,
  emptyText,
  transactionsGrouped,
  total,
  currency,
  showAll = false,
}: BreakdownTableProps) => {
  const { t } = useTranslation()
  const sx = ui()
  const [sortingPref, setSortingPref] = useState<SortingPref>('totalDesc')
  const sortedCategories = getSortedCategories(transactionsGrouped, sortingPref)
  const categoriesWithTransactions = sortedCategories.filter((category) => category.transactions.length)
  const categoriesToShow = showAll ? sortedCategories : categoriesWithTransactions

  return (
    <>
      <Grid container spacing={COL_SPACING} sx={{ mb: 0 }}>
        <Grid size={{ xs: COL1[0], sm: COL1[1] }}>
          <Box sx={sx.tableHeader} onClick={() => setSortingPref(sortingPref === 'asc' ? 'desc' : 'asc')}>
            <Box sx={sx.tableHeaderContent}>
              {title}
              {sortingPref === 'asc' ? <ArrowUpward sx={{ fontSize: 12 }} /> : null}
              {sortingPref === 'desc' ? <ArrowDownward sx={{ fontSize: 12 }} /> : null}
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: COL2[0], sm: COL2[1] }}>
          <Box
            sx={sx.totalHeader}
            onClick={() => setSortingPref(sortingPref === 'totalDesc' ? 'totalAsc' : 'totalDesc')}
          >
            <Box sx={sx.tableHeaderContent}>
              {t('MISC.TOTAL_WITH_CURRENCY', { currency: getCurrencySymbol(currency) })}
              {sortingPref === 'totalAsc' ? <ArrowUpward sx={{ fontSize: 12 }} /> : null}
              {sortingPref === 'totalDesc' ? <ArrowDownward sx={{ fontSize: 12 }} /> : null}
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: COL3[0], sm: COL3[1] }}>
          <Box sx={sx.percentHeader}>%</Box>
        </Grid>
      </Grid>

      <Divider sx={{ mt: 0.5, mb: 0.5 }} />

      {categoriesToShow.length ? (
        categoriesToShow.map((category) => {
          return (
            <BreakdownRow key={category.code} category={category} parentCategoryTotal={total} currency={currency} />
          )
        })
      ) : (
        <Typography variant="body2" noWrap sx={sx.emptyText}>
          {emptyText}
        </Typography>
      )}
    </>
  )
}

export default Component
