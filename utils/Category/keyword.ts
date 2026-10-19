import type { TextRange } from '@/types'
import { CategoryRuleMatch } from '@/types-enums'

const WORD_CHAR = /[\p{L}\p{N}]/u

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * The text, ending (and starting, unless `isLeading`) at a word boundary. Edges that aren't letters or digits (e.g.
 * '#INT PYMT FEE') need no boundary.
 */
const toWordPattern = (text: string, isLeading = false) => {
  const start = !isLeading && WORD_CHAR.test(text.at(0) ?? '') ? '(?<![\\p{L}\\p{N}])' : ''
  const end = WORD_CHAR.test(text.at(-1) ?? '') ? '(?![\\p{L}\\p{N}])' : ''
  return `${start}${escapeRegExp(text)}${end}`
}

/**
 * Matches when all patterns are found, in any order.
 */
const toAllPattern = (patterns: string[]) => {
  return `^${patterns.map((pattern) => `(?=[\\s\\S]*${pattern})`).join('')}`
}

type ToKeywordPatternProps = {
  keyword: string
  match?: CategoryRuleMatch
  ignoreCase?: boolean
}

/**
 * Pattern of the keyword, see `CategoryRuleMatch`. Contained keywords match when all their words are found, in any
 * order, e.g. 'here is text' matches "here is some text". Exact keywords match the whole text, e.g. 'rent' matches
 * " Rent " but not "Rent January". Whole-word and leading keywords end at a word boundary, e.g. 'OBI' doesn't match
 * "mobile".
 */
export const toKeywordPattern = ({
  keyword,
  match = CategoryRuleMatch.CONTAINS,
  ignoreCase = true,
}: ToKeywordPatternProps) => {
  const trimmed = keyword.trim()
  const words = trimmed.split(/\s+/)
  const flags = ignoreCase ? 'iu' : 'u'

  switch (match) {
    case CategoryRuleMatch.STARTS_WITH:
      return new RegExp(`^\\s*${toWordPattern(trimmed, true)}`, flags)
    case CategoryRuleMatch.EQUALS:
      return new RegExp(`^\\s*${escapeRegExp(trimmed)}\\s*$`, flags)
    case CategoryRuleMatch.CONTAINS_WORD:
      return new RegExp(toAllPattern(words.map((word) => toWordPattern(word))), flags)
    default:
      return new RegExp(toAllPattern(words.map(escapeRegExp)), flags)
  }
}

/**
 * Pattern of the parts of a text that the keyword matches (see `toKeywordPattern`), to highlight them: each word of
 * contained keywords, otherwise the keyword. Only meaningful for texts the keyword matches.
 */
export const toKeywordHighlightPattern = ({
  keyword,
  match = CategoryRuleMatch.CONTAINS,
  ignoreCase = true,
}: ToKeywordPatternProps) => {
  const trimmed = keyword.trim()
  // Longest first, so a word containing another one is highlighted in full
  const words = trimmed.split(/\s+/).sort((a, b) => b.length - a.length)
  const flags = ignoreCase ? 'giu' : 'gu'

  switch (match) {
    case CategoryRuleMatch.STARTS_WITH:
      return new RegExp(`(?<=^\\s*)${toWordPattern(trimmed, true)}`, flags)
    case CategoryRuleMatch.EQUALS:
      return new RegExp(`(?<=^\\s*)${escapeRegExp(trimmed)}(?=\\s*$)`, flags)
    case CategoryRuleMatch.CONTAINS_WORD:
      return new RegExp(words.map((word) => toWordPattern(word)).join('|'), flags)
    default:
      return new RegExp(words.map(escapeRegExp).join('|'), flags)
  }
}

/**
 * The ranges of the matches of the (global) pattern in the text, without empty ones.
 */
export const getPatternRanges = (text: string, pattern: RegExp): TextRange[] => {
  return [...text.matchAll(pattern)]
    .filter((match) => match[0].length)
    .map((match) => [match.index, match.index + match[0].length])
}
