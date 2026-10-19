import { describe, expect, it } from 'vitest'

import { CategoryRuleMatch } from '@/types-enums'

import { getPatternRanges, toKeywordHighlightPattern } from '../keyword'

const highlight = (text: string, keyword: string, match?: CategoryRuleMatch) => {
  return getPatternRanges(text, toKeywordHighlightPattern({ keyword, match })).map(([start, end]) =>
    text.slice(start, end),
  )
}

describe('toKeywordHighlightPattern', () => {
  it('should highlight each word of contained keywords', () => {
    expect(highlight('here is some text', 'text here')).toEqual(['here', 'text'])
    expect(highlight('Boxes', 'box')).toEqual(['Box'])
    expect(highlight('T-Mobile OBI', 'OBI', CategoryRuleMatch.CONTAINS_WORD)).toEqual(['OBI'])
  })

  it('should highlight the keyword at the start or the whole text', () => {
    expect(highlight('VISA NETTO VISA NETTO', 'visa netto', CategoryRuleMatch.STARTS_WITH)).toEqual(['VISA NETTO'])
    expect(highlight(' Rent ', 'rent', CategoryRuleMatch.EQUALS)).toEqual(['Rent'])
  })
})
