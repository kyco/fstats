import { describe, expect, it } from 'vitest'

import { filterBySearch, splitMatches, toSearchQuery, toSearchText } from '../utils'

describe('search', () => {
  const rows = [
    ['01.02.2024', 'Coffee Shop'],
    ['02.02.2024', 'Rent'],
  ]
  const searchTexts = rows.map(toSearchText)

  it('should filter rows case-insensitively', () => {
    expect(filterBySearch({ rows, searchTexts, query: toSearchQuery(' COFFEE ') })).toEqual([rows[0]])
  })

  it('should keep all rows without a query', () => {
    expect(filterBySearch({ rows, searchTexts, query: toSearchQuery('  ') })).toBe(rows)
  })

  it('should not match across cells', () => {
    expect(filterBySearch({ rows, searchTexts, query: toSearchQuery('2024rent') })).toEqual([])
  })

  it('should split matches into odd parts', () => {
    expect(splitMatches('Coffee coffee', 'coffee')).toEqual(['', 'Coffee', ' ', 'coffee', ''])
    expect(splitMatches('a.b', '.')).toEqual(['a', '.', 'b'])
    expect(splitMatches('Rent', '')).toEqual(['Rent'])
  })

  it('should merge the matches with other ranges', () => {
    expect(splitMatches('Coffee Shop', 'shop', [[0, 6]])).toEqual(['', 'Coffee', ' ', 'Shop', ''])
    expect(splitMatches('Coffee Shop', 'fee s', [[0, 6]])).toEqual(['', 'Coffee S', 'hop'])
  })

  it('should ignore accents and match ß as ss', () => {
    const names = [['Müller'], ['Straße'], ['Cafe']]
    const texts = names.map(toSearchText)

    expect(filterBySearch({ rows: names, searchTexts: texts, query: toSearchQuery('MULLER') })).toEqual([names[0]])
    expect(filterBySearch({ rows: names, searchTexts: texts, query: toSearchQuery('strasse') })).toEqual([names[1]])
    expect(filterBySearch({ rows: names, searchTexts: texts, query: toSearchQuery('café') })).toEqual([names[2]])
  })

  it('should highlight the original characters', () => {
    expect(splitMatches('Bäcker', toSearchQuery('a'))).toEqual(['B', 'ä', 'cker'])
    expect(splitMatches('Straße', toSearchQuery('ss'))).toEqual(['Stra', 'ß', 'e'])
    expect(splitMatches('Straße', toSearchQuery('s'))).toEqual(['', 'S', 'tra', 'ß', 'e'])
    expect(splitMatches('Cafe\u0301', toSearchQuery('cafe'))).toEqual(['', 'Cafe', '\u0301'])
  })
})
