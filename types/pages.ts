import type { SvgIconComponent } from '@mui/icons-material'
import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from 'react'

import type { AmountFilter, Currency } from '@/types-enums'
import type { BankAccountId } from '@/utils/Parser/registry'

import type { NumberString } from './global'
import type { CustomParserMapping } from './services/custom-parser'
import type { ParsedStatsFile, StatsFile } from './services/stats-file'
import type { Category, CategoryCode, ParentCategory, Transaction } from './services/transaction'

// -------------------------------------------------------
// Layout
// -------------------------------------------------------

/**
 * Link of the sidebar and the menu drawer.
 */
export type NavItem = {
  route: string
  labelKey: string
  icon: SvgIconComponent
  iconActive: SvgIconComponent
  isExternal?: boolean
}

// -------------------------------------------------------

/**
 * Option of the `OptionSwitcher` list.
 */
export type SwitcherOption<T extends string> = {
  value: T
  primary: ReactNode
  secondary?: ReactNode
  checked: boolean
}

// -------------------------------------------------------
// Settings page
// -------------------------------------------------------

export type StorageDeleteAction = 'files' | 'formats' | 'all'

export type StorageListTab = 'files' | 'formats'

// -------------------------------------------------------
// Stats page: workspace
// -------------------------------------------------------

export type TransactionFilter = {
  amount: AmountFilter
  /**
   * Category codes (or `NO_CATEGORY`) deselected in the filters.
   */
  excludedCategories: Set<string>
}

/**
 * Transactions of the checked parsed files: all (before the date explorer, in file order), without duplicates and on
 * the selected days of the date explorer. The single source of the transactions of the views and the sidebar, see
 * `useStatsTransactions`. Each view applies its `TransactionFilter` itself.
 */
export type StatsTransactions = CurrencyTransactions & {
  /**
   * Transactions also in an earlier file (e.g. overlapping statements), by reference.
   */
  duplicates: Set<Transaction>
  deselectedDays: Set<string>
  /**
   * Days with transactions that are deselected.
   */
  excludedDayCount: number
  /**
   * Per currency of the files, in file order. Also currencies of files without transactions.
   */
  byCurrency: Partial<Record<Currency, CurrencyTransactions>>
  /**
   * Counts of transactions out of `all` (e.g. filtered), see `getTransactionCounts`.
   */
  count: (transactions: Transaction[]) => TransactionCounts
}

export type CurrencyTransactions = {
  /**
   * Before the date explorer, with duplicates.
   */
  all: Transaction[]
  unique: Transaction[]
  /**
   * Unique, on selected days.
   */
  shown: Transaction[]
}

/**
 * The part of `StatsTransactions` that only depends on the files, so it is kept when (de)selecting days.
 */
export type CheckedTransactions = {
  all: Transaction[]
  unique: Transaction[]
  duplicates: Set<Transaction>
  byCurrency: Partial<Record<Currency, { all: Transaction[]; unique: Transaction[] }>>
}

export type TransactionCounts = {
  /**
   * Counted in the stats: without duplicates and those on deselected days.
   */
  count: number
  /**
   * On days deselected in the date explorer.
   */
  dateExcludedCount: number
  /**
   * Also in an earlier file (e.g. overlapping statements), on selected days.
   */
  duplicateCount: number
}

export type WorkspaceContextValue = {
  /**
   * Only the read-only demo file is shown, see `getDemoFile`.
   */
  isDemoMode: boolean
  onAddFiles: () => void
  onAddFolder: () => void
  dayFilter: DayFilter
  demoState: DemoState
  /**
   * Shared, so all components get the same (memoized) values.
   */
  files: FileHelper
  stats: StatsTransactions
}

/**
 * The user's files and which of them are checked, see `useFileHelper`.
 */
export type FileHelper = {
  files: StatsFile[]
  isLoadingFiles: boolean
  checkedFiles: StatsFile[]
  checkedIds: string[]
  selectedFiles: ParsedStatsFile[]
  isAllChecked: boolean
  isChecked: (fileId: string) => boolean
  toggleFile: (fileId: string) => void
  toggleAll: () => void
  setSelectedFileIds: Dispatch<SetStateAction<string[]>>
}

export type DemoState = {
  /**
   * View state of the demo by local storage key, see `useViewStorage`.
   */
  values: Record<string, unknown>
  setValues: Dispatch<SetStateAction<Record<string, unknown>>>
}

/**
 * A currency or all of them (`ALL_CURRENCIES`).
 */
export type SelectedCurrency = Currency | 'all'

export type DayFilter = {
  /**
   * Days (`yyyy-MM-dd`) deselected in the date explorer.
   */
  deselectedDays: Set<string>
  setDeselectedDays: (days: Set<string>) => void
}

// -------------------------------------------------------
// Stats page: filters
// -------------------------------------------------------

export type FilterOption = {
  key: string
  label: string
  /**
   * Transactions the option applies to, disabled without any.
   */
  count: number
  checked: boolean
  onChange: (checked: boolean) => void
}

export type CurrencyFilter = {
  /**
   * Shown currencies, one can be selected when there are several (hidden with one).
   */
  currencies: Currency[]
  value: SelectedCurrency
  onChange: (value: SelectedCurrency) => void
  /**
   * Shows all currencies without allowing a selection, e.g. in the split transactions layout.
   */
  disabled?: boolean
}

export type CategoryOption = {
  key: string
  label: string
  count: number
}

export type ParentCategoryOption = CategoryOption & {
  /**
   * Category filter keys toggled by it, its subcategories with transactions or itself without any.
   */
  keys: string[]
  children: CategoryOption[]
}

export type CategoryGroup = {
  key: string
  label: string
  parents: ParentCategoryOption[]
}

// -------------------------------------------------------
// Stats page: category breakdown
// -------------------------------------------------------

export type CategoryWithTransactions = Category & {
  label: string
  transactions: Transaction[]
  total: NumberString
}

export type ParentCategoryWithTransactions = Omit<ParentCategory, 'subcategories'> & {
  label: string
  subcategories: Record<CategoryCode, CategoryWithTransactions>
  transactions: Transaction[]
  total: NumberString
}

export type BreakdownCellsSize = 'md' | 'sm'

// -------------------------------------------------------
// Stats page: date explorer
// -------------------------------------------------------

export type DateMonth = {
  /**
   * `yyyy-MM`
   */
  key: string
  /**
   * `yyyy-MM-dd`, newest first.
   */
  days: string[]
}

export type DateYear = DateMonth & {
  months: DateMonth[]
}

export type DateRow = {
  type: 'year' | 'month' | 'day'
  /**
   * `yyyy`, `yyyy-MM` or `yyyy-MM-dd`
   */
  key: string
  days: string[]
}

// -------------------------------------------------------
// Stats page: profit and loss
// -------------------------------------------------------

export type AccountTransaction = Transaction & { bankAccountId: BankAccountId }

export type ProfitLossRow = {
  key: string
  label: string
  /**
   * By period key, periods without transactions are missing.
   */
  values: Record<string, NumberString>
  total: NumberString
  children: ProfitLossRow[]
  /**
   * Only rows of a single transaction.
   */
  date?: string
}

export type ProfitLoss = {
  currency: Currency
  /**
   * Period keys with transactions (or transfers), oldest first.
   */
  periods: string[]
  income: { rows: ProfitLossRow[]; total: ProfitLossRow }
  expenses: { rows: ProfitLossRow[]; total: ProfitLossRow }
  net: ProfitLossRow
  /**
   * Of the net result, per period (missing without income) and in total.
   */
  netMargin: { values: Record<string, NumberString>; total?: NumberString }
  transfers: { incoming: ProfitLossRow; outgoing: ProfitLossRow; net: ProfitLossRow; count: number }
}

export type ProfitLossRowVariant = 'category' | 'subcategory' | 'transaction' | 'total' | 'net' | 'rate'

// -------------------------------------------------------
// Stats page: parser setup
// -------------------------------------------------------

export type ColumnField =
  | 'date'
  | 'description'
  | 'moneyIn'
  | 'moneyOut'
  | 'balance'
  | 'reference'
  | 'transactionType'
  | 'category'
  | 'parentCategory'

/**
 * The form state, the connected header names per field. At most one, except for the amount fields.
 */
export type SetupDraft = {
  headerIndex: number
  bankName: string
  accountName: string
  currency: Currency
  dateFormat: string
  numberFormat: CustomParserMapping['numberFormat']
  columns: Record<ColumnField, string[]>
}

/**
 * The file parsed with the mapping of the setup, see `getPreview`.
 */
export type SetupPreviewResult = {
  transactions: Transaction[]
  error: string | null
}

/**
 * Position of the frame around the header row in the header row picker.
 */
export type HeaderRowFrame = { top: number; height: number }

export type FormatOption = {
  value: string
  /**
   * E.g. an example date in the format.
   */
  label: string
  /**
   * The values of the column can be read with it.
   */
  isMatch?: boolean
  /**
   * In the menu, after the label (e.g. the name of a currency).
   */
  description?: string
  /**
   * In the menu, aligned right (e.g. the symbol of a currency).
   */
  end?: string
  /**
   * On the button, the label by default.
   */
  buttonLabel?: string
}

// -------------------------------------------------------
// Stats page: column connector
// -------------------------------------------------------

export type ConnectorField = {
  key: string
  label: string
  isRequired: boolean
  /**
   * Below the label, e.g. that it can have several columns.
   */
  note?: string
  /**
   * In the row before the dot, e.g. the date format. Clicks on it don't select the row.
   */
  action?: ReactNode
  /**
   * In a chip on the row's bottom edge, e.g. that the date format doesn't match the column.
   */
  error?: string
}

export type ConnectorColumn = {
  name: string
  /**
   * Example value from the file.
   */
  sample: string
}

export type ConnectorLayout = {
  anchors: Record<string, ConnectorAnchor>
  /**
   * Height of the fields, also the height of the columns.
   */
  fieldsHeight: number
}

export type ConnectorSide = 'field' | 'column'

export type ConnectorEnd = { side: ConnectorSide; key: string }

export type ConnectorPoint = { x: number; y: number }

export type ConnectorAnchor = ConnectorPoint & {
  /**
   * The column is scrolled out of view, its line ends at the edge of the list.
   */
  isOutOfView: boolean
}

// -------------------------------------------------------
// Stats page: files and transactions
// -------------------------------------------------------

export type BankAccountOption = {
  value: string
  label: string
  fileIds: string[]
}

export type SourcedTransaction = Transaction & {
  /**
   * Name of the file the transaction is from.
   */
  source: string
  /**
   * Names of all files containing the transaction, in file order.
   */
  sources: string[]
  /**
   * The same transaction is also in an earlier file (e.g. overlapping statements).
   */
  isDuplicate: boolean
}

export type VirtualTableColumn = {
  label: string
  /**
   * Relative width, all columns always fit the table width.
   */
  width?: number
  /**
   * Width in px, overrides `width`. Use for icons. The widest relative column then takes the remaining space.
   */
  fixedWidth?: number
  /**
   * Only shown as the header's tooltip, e.g. for narrow columns.
   */
  hideLabel?: boolean
  align?: 'left' | 'center' | 'right'
  /**
   * Cell style, by value.
   */
  getStyle?: (value: string) => CSSProperties | undefined
  /**
   * Cell content, by value. Replaces the value and its tooltip.
   */
  renderCell?: (value: string, rowIndex: number) => ReactNode
}
