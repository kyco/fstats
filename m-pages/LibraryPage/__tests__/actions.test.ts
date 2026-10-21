import { describe, expect, it } from 'vitest'

import { getLibraryKeywords } from '@/m-category/service'

import { getExpandedHints, toAnchorId } from '../actions'

describe('getExpandedHints', () => {
  it('should open a linked hint, or the hint of a linked library keyword', () => {
    expect(getExpandedHints({ hint: 'own_account_transfer', libraryKeyword: undefined })).toEqual([
      'own_account_transfer',
    ])

    const rewe = getLibraryKeywords().find((libraryKeyword) => libraryKeyword.id === 'de.rewe')
    expect(getExpandedHints({ hint: null, libraryKeyword: rewe })).toEqual(['supermarket'])
  })
})

describe('toAnchorId', () => {
  it('should be a valid DOM ID', () => {
    expect(toAnchorId('keyword', 'de.rewe')).toBe('keyword-de-rewe')
  })
})
