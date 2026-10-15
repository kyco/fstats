import { CategoryRuleMatch } from '@/types-enums'

const WORD_CHAR = /[\p{L}\p{N}]/u

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

type ToKeywordPatternProps = {
  keyword: string
  match?: CategoryRuleMatch
  ignoreCase?: boolean
}

/**
 * Pattern of the keyword, see `CategoryRuleMatch`. Contained and leading keywords only match whole words, e.g. 'OBI'
 * doesn't match "mobile". Edges that aren't letters or digits (e.g. '#INT PYMT FEE') need no boundary.
 */
export const toKeywordPattern = ({
  keyword,
  match = CategoryRuleMatch.CONTAINS,
  ignoreCase = true,
}: ToKeywordPatternProps) => {
  const trimmed = keyword.trim()
  const escaped = escapeRegExp(trimmed)
  const start = WORD_CHAR.test(trimmed.at(0) ?? '') ? '(?<![\\p{L}\\p{N}])' : ''
  const end = WORD_CHAR.test(trimmed.at(-1) ?? '') ? '(?![\\p{L}\\p{N}])' : ''
  const flags = ignoreCase ? 'iu' : 'u'

  switch (match) {
    case CategoryRuleMatch.STARTS_WITH:
      return new RegExp(`^\\s*${escaped}${end}`, flags)
    case CategoryRuleMatch.EQUALS:
      return new RegExp(`^\\s*${escaped}\\s*$`, flags)
    default:
      return new RegExp(`${start}${escaped}${end}`, flags)
  }
}
