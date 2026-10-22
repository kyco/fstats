import { describe, expect, it } from 'vitest'

import type { CategoryRule } from '@/types'
import { CategoryRuleDirection, CategoryRuleField, CategoryRuleMatch } from '@/types-enums'
import { getLibraryKeywords } from '@/m-category/service'

import { belongsToTag, getExpandedTags, toAnchorId } from '../actions'

describe('getExpandedTags', () => {
  it('should open a linked tag, or the tag of a linked library keyword', () => {
    expect(getExpandedTags({ tag: 'own_account_transfer', libraryKeyword: undefined })).toEqual([
      'own_account_transfer',
    ])

    const rewe = getLibraryKeywords().find((libraryKeyword) => libraryKeyword.id === 'de.rewe')
    expect(getExpandedTags({ tag: null, libraryKeyword: rewe })).toEqual(['supermarket'])
  })
})

describe('toAnchorId', () => {
  it('should be a valid DOM ID', () => {
    expect(toAnchorId('keyword', 'de.rewe')).toBe('keyword-de-rewe')
  })
})

describe('belongsToTag', () => {
  const toRule = (library: CategoryRule['library']): CategoryRule => ({
    id: 'r1',
    number: 1,
    field: CategoryRuleField.DESCRIPTION,
    match: CategoryRuleMatch.CONTAINS,
    ignoreCase: true,
    keyword: 'FAMKASSE',
    direction: CategoryRuleDirection.ANY,
    library,
  })

  it('should be true for rules belonging to the tag or one of its library keywords', () => {
    expect(belongsToTag(toRule({ type: 'tag', key: 'benefits' }), 'benefits')).toBe(true)
    expect(belongsToTag(toRule({ type: 'keyword', key: 'de.rewe' }), 'supermarket')).toBe(true)
    expect(belongsToTag(toRule({ type: 'keyword', key: 'de.rewe' }), 'benefits')).toBe(false)
    expect(belongsToTag(toRule(undefined), 'benefits')).toBe(false)
  })
})
