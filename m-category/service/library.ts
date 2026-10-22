import type { TFunction } from 'i18next'
import { maxBy, pick } from 'lodash'

import type {
  CategoryId,
  CategoryMappings,
  CategoryRule,
  CategoryTree,
  CompiledLibraryKeyword,
  LibraryIndex,
  LibraryKeyword,
  LibraryMapping,
  LibraryMatch,
  LibraryMatchResult,
  LibraryPackDef,
  LibraryRef,
  Transaction,
} from '@/types'
import { CategoryRuleDirection, CategoryRuleMatch } from '@/types-enums'
import { CONFIG } from '@/common'
import { LIBRARY, toKeywordHighlightPattern, toKeywordPattern } from '@/utils/Category'
import { getBankCountry } from '@/utils/Parser'
import { isExpense } from '@/utils/Stats'

import { hasCategory } from './tree'

const MATCH_RANKS: Record<LibraryMatch, number> = {
  [CategoryRuleMatch.EQUALS]: 3,
  [CategoryRuleMatch.STARTS_WITH]: 2,
  [CategoryRuleMatch.CONTAINS_WORD]: 1,
}

/**
 * Lower-case words (letters and digits) of a text, e.g. ['google', 'cloud'] for "GOOGLE*CLOUD".
 */
export const toWords = (text: string) => {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
}

/**
 * The library keywords of the packs, with their full IDs (e.g. 'de.rewe') and defaults.
 */
export const getLibraryKeywords = (packs: readonly LibraryPackDef[] = LIBRARY): LibraryKeyword[] => {
  return packs.flatMap((pack) =>
    pack.libraryKeywords.map(
      ({ match = CategoryRuleMatch.CONTAINS_WORD, direction = CategoryRuleDirection.ANY, ...libraryKeyword }) => ({
        ...libraryKeyword,
        id: `${pack.id}.${libraryKeyword.id}`,
        packId: pack.id,
        ...(pack.bank ? { bank: pack.bank } : {}),
        match,
        direction,
      }),
    ),
  )
}

const compileLibraryKeyword = (libraryKeyword: LibraryKeyword): CompiledLibraryKeyword => {
  const { match } = libraryKeyword

  return {
    libraryKeyword,
    patterns: libraryKeyword.keywords.map((keyword) => ({
      keyword,
      pattern: toKeywordPattern({ keyword, match }),
      highlightPattern: toKeywordHighlightPattern({ keyword, match }),
      rank: MATCH_RANKS[match],
      length: keyword.trim().length,
    })),
  }
}

/**
 * Library keywords indexed by the longest word of each of their keywords: keywords match whole words, so a description
 * can only match when it has that word. Only those library keywords are tested, not the whole library.
 */
export const createLibraryIndex = (libraryKeywords: LibraryKeyword[]): LibraryIndex => {
  const compiled = libraryKeywords.map(compileLibraryKeyword)
  const byToken = new Map<string, CompiledLibraryKeyword[]>()

  compiled.forEach((item) => {
    const words = new Set(item.patterns.map(({ keyword }) => maxBy(toWords(keyword), (word) => word.length)))
    words.forEach((word) => {
      if (word) {
        byToken.set(word, [...(byToken.get(word) ?? []), item])
      }
    })
  })

  return { libraryKeywords: compiled, byToken }
}

let libraryIndex: LibraryIndex | null = null
let libraryKeywordsById: Map<string, LibraryKeyword> | null = null

/**
 * Of the whole library, compiled once.
 */
export const getLibraryIndex = () => {
  libraryIndex ??= createLibraryIndex(getLibraryKeywords())
  return libraryIndex
}

/**
 * Of the whole library, by its full ID (e.g. 'de.rewe').
 */
export const getLibraryKeyword = (id: string) => {
  libraryKeywordsById ??= new Map(
    getLibraryIndex().libraryKeywords.map((item) => [item.libraryKeyword.id, item.libraryKeyword]),
  )
  return libraryKeywordsById.get(id)
}

const compareStrings = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

/**
 * Negative when `a` is the better match: of the transaction's bank, then the more specific match type, then the longer
 * keyword, then by ID (so the result never depends on the order of the library).
 */
const compareMatches = (a: LibraryMatchResult, b: LibraryMatchResult) => {
  return (
    Number(!!b.libraryKeyword.bank) - Number(!!a.libraryKeyword.bank) ||
    b.pattern.rank - a.pattern.rank ||
    b.pattern.length - a.pattern.length ||
    compareStrings(a.libraryKeyword.id, b.libraryKeyword.id) ||
    compareStrings(a.pattern.keyword, b.pattern.keyword)
  )
}

type FindLibraryMatchProps = {
  transaction: Transaction
  index: LibraryIndex
  /**
   * Of the transaction, for library keywords of bank packs and those limited to countries. Without, those never match.
   */
  bankId?: string
}

/**
 * The library keyword recognising the transaction, see `compareMatches`.
 */
export const findLibraryMatch = ({ transaction, index, bankId }: FindLibraryMatchProps): LibraryMatchResult | null => {
  const country = bankId ? getBankCountry(bankId) : undefined
  const isIncome = !isExpense(transaction)
  const candidates = new Set(toWords(transaction.description).flatMap((word) => index.byToken.get(word) ?? []))
  let best: LibraryMatchResult | null = null

  for (const { libraryKeyword, patterns } of candidates) {
    const { bank, countries, direction } = libraryKeyword
    const isApplicable =
      (!bank || bank === bankId) &&
      (!countries || (!!country && countries.includes(country))) &&
      (direction === CategoryRuleDirection.ANY || (direction === CategoryRuleDirection.IN) === isIncome)

    if (!isApplicable) {
      continue
    }

    for (const pattern of patterns) {
      const match = { libraryKeyword, pattern }
      if (pattern.pattern.test(transaction.description) && (!best || compareMatches(match, best) < 0)) {
        best = match
      }
    }
  }

  return best
}

type MapLibraryKeywordProps = {
  libraryKeyword: LibraryKeyword
  /**
   * Of the rule set, for the direction of the transaction.
   */
  mappings: CategoryMappings
  tree: CategoryTree
}

/**
 * The category the rule set maps the library keyword to: by itself, otherwise by its tag. Categories the rule set
 * doesn't have are skipped.
 */
export const mapLibraryKeyword = ({
  libraryKeyword,
  mappings,
  tree,
}: MapLibraryKeywordProps): { category: CategoryId | null; mapping: LibraryMapping } => {
  if (libraryKeyword.id in mappings.keywords) {
    const category = mappings.keywords[libraryKeyword.id]

    if (category === null) {
      return { category: null, mapping: { type: 'excluded' } }
    }

    if (hasCategory(tree, category)) {
      return { category, mapping: { type: 'keyword' } }
    }
  }

  const { tag } = libraryKeyword
  const category = mappings.tags[tag]

  return category && hasCategory(tree, category)
    ? { category, mapping: { type: 'tag', tag } }
    : { category: null, mapping: { type: 'unmapped' } }
}

type MapLibraryRefProps = {
  library: LibraryRef
  /**
   * Of the rule set, for the direction of the transaction.
   */
  mappings: CategoryMappings
  tree: CategoryTree
}

/**
 * The category the rule set maps the tag or library keyword to (see `mapLibraryKeyword`), e.g. of a rule belonging to
 * it. `null` when it doesn't, or it no longer exists.
 */
export const mapLibraryRef = ({ library, mappings, tree }: MapLibraryRefProps): CategoryId | null => {
  if (library.type === 'tag') {
    const category = mappings.tags[library.key]
    return category && hasCategory(tree, category) ? category : null
  }

  const libraryKeyword = getLibraryKeyword(library.key)
  return libraryKeyword ? mapLibraryKeyword({ libraryKeyword, mappings, tree }).category : null
}

/**
 * Library keywords by their tag.
 */
export const groupKeywordsByTag = (libraryKeywords: LibraryKeyword[]) => {
  const groups = new Map<string, LibraryKeyword[]>()
  libraryKeywords.forEach((libraryKeyword) =>
    groups.set(libraryKeyword.tag, [...(groups.get(libraryKeyword.tag) ?? []), libraryKeyword]),
  )
  return groups
}

type SearchLibraryKeywordsProps = {
  libraryKeywords: LibraryKeyword[]
  query: string
  t: TFunction
}

/**
 * Library keywords whose name, keywords, ID or tag contain the query, ignoring case.
 */
export const searchLibraryKeywords = ({ libraryKeywords, query, t }: SearchLibraryKeywordsProps) => {
  const needle = query.trim().toLowerCase()

  return libraryKeywords.filter((libraryKeyword) =>
    [libraryKeyword.name, libraryKeyword.id, ...libraryKeyword.keywords, t(libraryKeyword.tag, { ns: 'tags' })].some(
      (text) => text.toLowerCase().includes(needle),
    ),
  )
}

/**
 * GitHub issue form (`.github/ISSUE_TEMPLATE/new-library-keyword.yml`) prefilled with one of the user's rules, so it can
 * be added to the library. Only the rule, no transactions, the user reviews it before submitting.
 */
export const getRuleIssueHref = (rule: CategoryRule) => {
  const url = new URL(`${CONFIG.GITHUB_URL}/issues/new`)
  url.searchParams.set('template', 'new-library-keyword.yml')
  url.searchParams.set('title', `Library keyword: ${rule.keyword}`)
  url.searchParams.set('keyword', rule.keyword)
  if (rule.library) {
    url.searchParams.set('tag', rule.library.key)
  }
  url.searchParams.set(
    'rule',
    JSON.stringify(pick(rule, ['keyword', 'match', 'ignoreCase', 'direction', 'field', 'library']), null, 2),
  )
  url.searchParams.set('version', CONFIG.APP_VERSION)
  return url.toString()
}
