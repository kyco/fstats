import type { SvgIconComponent } from '@mui/icons-material'
import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from 'react'

import type { CategoryRuleField, CategoryRuleMatch, Currency } from '@/types-enums'

import type { NumberString } from './global'
import type { CategoryRuleDraft } from './services/category-rule'
import type { ParsedStatsFile, StatsFile } from './services/stats-file'
import type {
  Category,
  CategoryCode,
  ParentCategory,
  SourcedTransaction,
  StatsTransactions,
  Transaction,
} from './services/transaction'
import type { TextRange } from './utils'

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

export type StorageDeleteAction = 'files' | 'formats' | 'rules' | 'all'

export type StorageListTab = 'files' | 'formats' | 'rules'

// -------------------------------------------------------
// Stats page: workspace
// -------------------------------------------------------

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
  selectedTransaction: SelectedTransaction
  /**
   * Search of the transactions and CSV views, kept when switching views.
   */
  search: WorkspaceSearch
}

export type WorkspaceSearch = {
  value: string
  setValue: (value: string) => void
}

/**
 * What was entered in the category form, kept when it moves from the menu to the sidebar.
 */
export type CategoryEditorDraft = {
  category: CategoryCode | ''
  applyTo: 'transaction' | 'rule'
  field: CategoryRuleField
  match: CategoryRuleMatch
  keyword: string
  ignoreCase: boolean
  amounts: { in: boolean; out: boolean }
  saveTo: string
  newRulesetName: string
  copyBuiltIn: boolean
}

/**
 * The rule being created in the category form, previewed in the transactions table.
 */
export type CategoryRulePreview = {
  rule: CategoryRuleDraft
  /**
   * Chosen in the form, shown as the new category of the matches the rule changes.
   */
  category: CategoryCode | null
  isMyRules: boolean
  /**
   * The edited transaction.
   */
  editedId: string
}

/**
 * The transaction clicked in the transactions table (shown in the sidebar), the one whose category is changed in the
 * category editor menu, and the rule being created there, see `useSelectedTransaction`.
 */
export type SelectedTransaction = {
  transaction: SourcedTransaction | null
  /**
   * Selects the transaction, or deselects it when selected.
   */
  toggle: (transaction: SourcedTransaction) => void
  close: () => void
  /**
   * The menu is anchored to the element it was opened from, e.g. the category in the table.
   */
  editing: { transaction: SourcedTransaction; anchor: HTMLElement } | null
  edit: (transaction: SourcedTransaction, anchor: HTMLElement) => void
  closeEditor: () => void
  /**
   * Its matches are highlighted in the transactions table, with the categories they'd get.
   */
  rule: CategoryRulePreview | null
  setRule: (rule: CategoryRulePreview | null) => void
  /**
   * The form of the menu, moved to the sidebar (with the edited transaction selected), so the table can be scrolled.
   * The key changes with each move, so the sidebar starts over.
   */
  draft: { values: CategoryEditorDraft; key: number } | null
  moveToSidebar: (draft: CategoryEditorDraft) => void
  /**
   * The match of the rule highlighted in the table, which scrolls to it (unless `shouldScroll` is false). The key
   * changes so it scrolls again.
   */
  focusedMatch: { id: string; key: number; shouldScroll: boolean } | null
  focusMatch: (id: string, shouldScroll?: boolean) => void
  /**
   * Of the category form in the sidebar: while it's open, changing a category closes it (one form at a time), and with
   * changes, selecting a row or changing a category asks before discarding it.
   */
  setForm: (form: { isOpen: boolean; hasChanges: boolean }) => void
  /**
   * Runs the action, or while the category form has changes, asks first (`isAskingToDiscard`) and runs it on `discard`.
   */
  guard: (action: () => void) => void
  isAskingToDiscard: boolean
  discard: () => void
  keepEditing: () => void
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
  /**
   * Of `count`, those with money in (the others are money out).
   */
  inCount: number
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

export type ProfitLossRowVariant = 'category' | 'subcategory' | 'transaction' | 'total' | 'net' | 'rate'

/**
 * Incoming or outgoing amount of a cell's tooltip, signed like the cell.
 */
export type ProfitLossFlowLine = { labelKey: string; value: NumberString }

// -------------------------------------------------------
// Stats page: parser setup
// -------------------------------------------------------

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
  /**
   * Parts of the cell to highlight like search matches, e.g. those a rule matches.
   */
  getHighlights?: (rowIndex: number) => TextRange[]
}

/**
 * Option of a compact select in a toolbar menu style, see `MenuSelect`.
 */
export type MenuSelectOption = {
  value: string
  label: string
  /**
   * Next to the label, e.g. what the option does.
   */
  description?: string
  /**
   * Options are grouped under a subheader by it, in order.
   */
  group?: string
  /**
   * Before the label, e.g. a colour dot.
   */
  start?: ReactNode
}
