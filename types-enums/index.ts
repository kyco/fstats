import { z } from 'zod'

// -------------------------------------------------------

export const ColorMode = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
} as const

export type ColorMode = (typeof ColorMode)[keyof typeof ColorMode]

// -------------------------------------------------------

/**
 * The user's chosen locale, under the hood determines the language across the app.
 */
export const UserLocale = {
  EN: 'en',
  DE: 'de',
} as const

export const zUserLocale = z.enum([UserLocale.EN, UserLocale.DE] as const)

export type UserLocale = z.infer<typeof zUserLocale>

// -------------------------------------------------------

/**
 * The status of a file, usually goes directly to "parsing" and when parsed to "parsed".
 */
export const StatsFileStatus = {
  PARSING: 'parsing',
  PARSED: 'parsed',
  ERROR: 'error',
} as const

export type StatsFileStatus = (typeof StatsFileStatus)[keyof typeof StatsFileStatus]

// -------------------------------------------------------

/**
 * Why a file has the "error" status.
 */
export const StatsFileErrorCode = {
  REJECTED: 'rejected', // Wrong file type or too large
  DUPLICATE: 'duplicate', // Same content as an existing file
  UNREADABLE: 'unreadable', // CSV could not be read
  UNSUPPORTED_FORMAT: 'unsupported_format', // No parser matched
  CONVERTIBLE_FORMAT: 'convertible_format', // No parser matched, but the format was detected, so it can be set up
  INVALID_DATA: 'invalid_data', // Parser matched, but parsing or validation failed
} as const

export const zStatsFileErrorCode = z.enum([
  StatsFileErrorCode.REJECTED,
  StatsFileErrorCode.DUPLICATE,
  StatsFileErrorCode.UNREADABLE,
  StatsFileErrorCode.UNSUPPORTED_FORMAT,
  StatsFileErrorCode.CONVERTIBLE_FORMAT,
  StatsFileErrorCode.INVALID_DATA,
] as const)

export type StatsFileErrorCode = z.infer<typeof zStatsFileErrorCode>

// -------------------------------------------------------

export const DateFormat = {
  DMY_LONG: 'd MMMM yyyy',
  DMY_SHORT: 'd MMM yyyy',
  MDY_LONG: 'MMMM d, yyyy',
  MDY_SHORT: 'MMM d, yyyy',
  DMY_SLASH: 'dd/MM/yyyy',
  DMY_DOT: 'dd.MM.yyyy',
  DMY_DASH: 'dd-MM-yyyy',
  YMD_SLASH: 'yyyy/MM/dd',
  YMD_DOT: 'yyyy.MM.dd',
  YMD_DASH: 'yyyy-MM-dd',
  YMD: 'yyyyMMdd',
} as const

export const zDateFormat = z.enum([
  DateFormat.DMY_LONG,
  DateFormat.DMY_SHORT,
  DateFormat.MDY_LONG,
  DateFormat.MDY_SHORT,
  DateFormat.DMY_SLASH,
  DateFormat.DMY_DOT,
  DateFormat.DMY_DASH,
  DateFormat.YMD_SLASH,
  DateFormat.YMD_DOT,
  DateFormat.YMD_DASH,
  DateFormat.YMD,
] as const)

export type DateFormat = z.infer<typeof zDateFormat>

// -------------------------------------------------------

export const Currency = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  CHF: 'CHF',
  SEK: 'SEK',
  BTC: 'BTC',
  CNY: 'CNY',
  RUB: 'RUB',
  JPY: 'JPY',
  INR: 'INR',
  ZAR: 'ZAR',
} as const

export const zCurrency = z.enum([
  Currency.USD,
  Currency.EUR,
  Currency.GBP,
  Currency.CHF,
  Currency.SEK,
  Currency.BTC,
  Currency.CNY,
  Currency.RUB,
  Currency.JPY,
  Currency.INR,
  Currency.ZAR,
] as const)

export type Currency = z.infer<typeof zCurrency>

// -------------------------------------------------------

/**
 * Country of a bank, ISO 3166-1 alpha-2.
 */
export const Country = {
  DE: 'DE',
  GB: 'GB',
  ZA: 'ZA',
} as const

export type Country = (typeof Country)[keyof typeof Country]

// -------------------------------------------------------

/**
 * Part of the persisted parser and bank account IDs.
 */
export const AccountType = {
  CURRENT: 'current',
  SAVINGS: 'savings',
  CREDIT_CARD: 'credit_card',
} as const

export type AccountType = (typeof AccountType)[keyof typeof AccountType]

// -------------------------------------------------------

export const SortOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]

// -------------------------------------------------------

/**
 * How the transactions of several currencies are shown on the stats page, in one table or one per currency.
 */
export const TransactionsLayout = {
  COMBINED: 'combined',
  SPLIT: 'split',
} as const

export type TransactionsLayout = (typeof TransactionsLayout)[keyof typeof TransactionsLayout]

// -------------------------------------------------------

/**
 * Which transactions the stats page shows by amount, all, income or expenses.
 */
/**
 * Money in and out shown by the amount filter (by the sign, unlike the income and expense categories).
 */
export const AmountFilter = {
  ALL: 'all',
  IN: 'in',
  OUT: 'out',
  NONE: 'none',
} as const

export type AmountFilter = (typeof AmountFilter)[keyof typeof AmountFilter]

// -------------------------------------------------------

/**
 * Why a view of the stats page is empty, see `getEmptyReason`.
 */
export const EmptyReason = {
  NO_FILES: 'noFiles',
  NO_SELECTION: 'noSelection',
  NO_TRANSACTIONS: 'noTransactions',
  NO_DATES: 'noDates',
  NO_MATCHES: 'noMatches',
} as const

export type EmptyReason = (typeof EmptyReason)[keyof typeof EmptyReason]

// -------------------------------------------------------

/**
 * Period of the columns of the profit and loss view.
 */
export const BreakdownPeriod = {
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
} as const

export type BreakdownPeriod = (typeof BreakdownPeriod)[keyof typeof BreakdownPeriod]

// -------------------------------------------------------

/**
 * Tag of a transaction in the transactions table that isn't counted in the stats.
 */
export const TransactionTag = {
  DUPLICATE: 'duplicate',
  DATE_EXCLUDED: 'dateExcluded',
} as const

export type TransactionTag = (typeof TransactionTag)[keyof typeof TransactionTag]

// -------------------------------------------------------

/**
 * Steps of the custom parser setup. The preview is confirmed first, most files are detected correctly, otherwise the
 * columns are fixed. The currency and number format are next to the preview.
 */
export const SetupStep = {
  REVIEW: 'review',
  FIX: 'fix',
  NAME: 'name',
} as const

export type SetupStep = (typeof SetupStep)[keyof typeof SetupStep]

// -------------------------------------------------------

/**
 * Tabs of the preview of the custom parser setup.
 */
export const SetupPreviewTab = {
  PREVIEW: 'preview',
  CSV: 'csv',
} as const

export type SetupPreviewTab = (typeof SetupPreviewTab)[keyof typeof SetupPreviewTab]

// -------------------------------------------------------

/**
 * Why a row of the file can't be the header row in the custom parser setup.
 */
export const HeaderRowProblem = {
  /**
   * Fewer than two, e.g. a title.
   */
  NAMES: 'names',
  /**
   * No row below it has as many cells.
   */
  COLUMN_COUNT: 'columnCount',
} as const

export type HeaderRowProblem = (typeof HeaderRowProblem)[keyof typeof HeaderRowProblem]

// -------------------------------------------------------

/**
 * What a category rule matches its keyword against: the description, or the category or parent category the file
 * comes with (e.g. "Groceries"), which is only used for matching, never as the category itself.
 */
export const CategoryRuleField = {
  DESCRIPTION: 'description',
  CATEGORY: 'category',
  PARENT_CATEGORY: 'parentCategory',
} as const

export const zCategoryRuleField = z.enum([
  CategoryRuleField.DESCRIPTION,
  CategoryRuleField.CATEGORY,
  CategoryRuleField.PARENT_CATEGORY,
] as const)

export type CategoryRuleField = z.infer<typeof zCategoryRuleField>

// -------------------------------------------------------

/**
 * How a category rule matches its keyword: all its words anywhere, in any order (also inside words, e.g. 'box' matches
 * "Boxes"), all its words as whole words (e.g. 'OBI' doesn't match "T-Mobile", used by the built-in rule sets), at the
 * start, or the whole text (e.g. 'rent' matches "Rent" but not "Rent January").
 */
export const CategoryRuleMatch = {
  CONTAINS: 'contains',
  CONTAINS_WORD: 'containsWord',
  STARTS_WITH: 'startsWith',
  EQUALS: 'equals',
} as const

export const zCategoryRuleMatch = z.enum([
  CategoryRuleMatch.CONTAINS,
  CategoryRuleMatch.CONTAINS_WORD,
  CategoryRuleMatch.STARTS_WITH,
  CategoryRuleMatch.EQUALS,
] as const)

export type CategoryRuleMatch = z.infer<typeof zCategoryRuleMatch>

// -------------------------------------------------------

/**
 * Which transactions a category rule applies to: all, money in (also zero amounts) or money out.
 */
export const CategoryRuleDirection = {
  ANY: 'any',
  IN: 'in',
  OUT: 'out',
} as const

export const zCategoryRuleDirection = z.enum([
  CategoryRuleDirection.ANY,
  CategoryRuleDirection.IN,
  CategoryRuleDirection.OUT,
] as const)

export type CategoryRuleDirection = z.infer<typeof zCategoryRuleDirection>

// -------------------------------------------------------

/**
 * Where the category of a transaction comes from, see `resolveCategory`. First match wins, in this order.
 */
export const CategorySource = {
  /**
   * Set for this transaction only.
   */
  OVERRIDE: 'override',
  /**
   * Set in the transaction data, i.e. the demo transactions.
   */
  PRESET: 'preset',
  /**
   * A rule of the active rule set.
   */
  RULE: 'rule',
  /**
   * A library entry recognised it, mapped to a category by the active rule set.
   */
  LIBRARY: 'library',
  NONE: 'none',
} as const

export type CategorySource = (typeof CategorySource)[keyof typeof CategorySource]

// -------------------------------------------------------

/**
 * Whether a parent category (and its subcategories) is for money in or out.
 */
export const CategoryDirection = {
  IN: 'in',
  OUT: 'out',
} as const

export const zCategoryDirection = z.enum([CategoryDirection.IN, CategoryDirection.OUT] as const)

export type CategoryDirection = z.infer<typeof zCategoryDirection>

// -------------------------------------------------------

/**
 * Colour of a parent category, see `CATEGORY_COLORS`. Stored in the user's rule sets, never rename them.
 */
export const zCategoryColor = z.enum([
  'green',
  'teal',
  'lightGreen',
  'lime',
  'cyan',
  'lightBlue',
  'blue',
  'indigo',
  'deepPurple',
  'purple',
  'pink',
  'red',
  'deepOrange',
  'orange',
  'amber',
  'brown',
  'blueGrey',
] as const)

export type CategoryColor = z.infer<typeof zCategoryColor>
