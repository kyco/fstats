import { describe, expect, it } from 'vitest'

import { CategoryDirection } from '@/types-enums'
import { createRuleset, getLibraryKeywords, setKeywordMapping } from '@/m-category/service'
import { getTemplate, toCategoryId } from '@/utils/Category'

import { getMappedKeywords } from '../actions'

const standard = createRuleset({
  name: 'Standard',
  number: 1,
  now: '2026-01-01T00:00:00+00:00',
  template: getTemplate('default'),
})
const libraryKeywords = getLibraryKeywords()
const ids = (mapping: Parameters<typeof getMappedKeywords>[0]['mapping'], ruleset = standard) =>
  getMappedKeywords({ mapping, ruleset, libraryKeywords }).map((libraryKeyword) => libraryKeyword.id)

describe('getMappedKeywords', () => {
  const supermarket = { type: 'hint' as const, key: 'supermarket', direction: CategoryDirection.OUT }

  it('should list the library keywords of a hint', () => {
    expect(ids(supermarket)).toEqual(expect.arrayContaining(['de.rewe', 'gb.tesco']))
    expect(ids(supermarket)).not.toContain('de.bakery')
  })

  it('should leave out library keywords mapped on their own', () => {
    const ruleset = setKeywordMapping({
      direction: CategoryDirection.OUT,
      key: 'de.rewe',
      category: toCategoryId('general_shopping'),
    })(standard)

    expect(ids(supermarket, ruleset)).not.toContain('de.rewe')
    expect(ids({ type: 'keyword', key: 'de.rewe', direction: CategoryDirection.OUT }, ruleset)).toEqual(['de.rewe'])
  })
})
