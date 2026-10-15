import { BreakdownPeriod } from '@/types-enums'
import type { UserLocale } from '@/types-enums'
import { toDisplayDate } from '@/utils/Date'
import { i18n } from '@/lib/i18n'

export const getBreakdownPeriodOptions = () => [
  { value: BreakdownPeriod.MONTH, label: i18n.t('STATS_PAGE.PROFIT_LOSS.PERIOD.MONTH') },
  { value: BreakdownPeriod.QUARTER, label: i18n.t('STATS_PAGE.PROFIT_LOSS.PERIOD.QUARTER') },
  { value: BreakdownPeriod.YEAR, label: i18n.t('STATS_PAGE.PROFIT_LOSS.PERIOD.YEAR') },
]

type GetPeriodLabelProps = {
  key: string
  period: BreakdownPeriod
  locale: UserLocale
}

export const getPeriodLabel = ({ key, period, locale }: GetPeriodLabelProps) => {
  switch (period) {
    case BreakdownPeriod.YEAR:
      return key
    case BreakdownPeriod.QUARTER:
      return `${key.slice(5)} ${key.slice(0, 4)}`
    default:
      return toDisplayDate({ date: `${key}-01`, locale, formatFrom: 'yyyy-MM-dd', formatTo: 'MMM yyyy' })
  }
}
