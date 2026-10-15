import { Grid, LinearProgress, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import type { BreakdownCellsSize, GradientColorsLightDark, NumberString } from '@/types'
import { Currency } from '@/types-enums'
import { useUserPreferences } from '@/m-user/service'
import { toFixedLocale, toFixedLocaleAmount } from '@/utils/Number'
import { getPercentage } from '@/utils/Stats'
import { Big } from '@/lib/w-big'

import { COL_SPACING, COL1, COL2, COL3, COL4 } from '../../actions'
import { ui } from './styled'

type BreakdownCellsProps = {
  label: string
  total: NumberString
  parentCategoryTotal: NumberString
  currency: Currency
  color: GradientColorsLightDark
  size: BreakdownCellsSize
}

const Component = ({ label, total: rawTotal, parentCategoryTotal, currency, color, size }: BreakdownCellsProps) => {
  const theme = useTheme()
  const sx = ui(theme, size)
  const { locale } = useUserPreferences()
  const total = Big(rawTotal).abs()
  const percentage = getPercentage(total, parentCategoryTotal)
  const totalDisplay = toFixedLocaleAmount({ value: total.toString(), currency, locale })
  const percentageDisplay = toFixedLocale({ value: percentage.toString(), round: 1, locale })
  const hasTotal = total.gt(0)

  return (
    <Grid container spacing={COL_SPACING} sx={sx.container}>
      <Grid size={{ xs: COL1[0], sm: COL1[1] }}>
        <Typography variant="body2" noWrap sx={{ ...sx.text(hasTotal), ...sx.label }}>
          {label}
        </Typography>
      </Grid>
      <Grid size={{ xs: COL2[0], sm: COL2[1] }}>
        <Typography variant="body2" align="right" sx={sx.text(hasTotal)}>
          {totalDisplay}
        </Typography>
      </Grid>
      <Grid size={{ xs: COL3[0], sm: COL3[1] }}>
        <Typography variant="body2" align="right" sx={sx.text(hasTotal)}>
          {percentageDisplay}%
        </Typography>
      </Grid>
      <Grid size={{ xs: COL4[0], sm: COL4[1] }} sx={{ alignSelf: 'center' }}>
        <LinearProgress variant="determinate" value={percentage.toNumber()} sx={sx.progress(hasTotal, color)} />
      </Grid>
    </Grid>
  )
}

export default Component
