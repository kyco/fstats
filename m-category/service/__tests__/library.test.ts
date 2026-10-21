import { mapValues } from 'lodash'
import { describe, expect, it } from 'vitest'

import type { LibraryKeyword, LibraryPackDef, Transaction } from '@/types'
import { CategoryRuleDirection, CategoryRuleMatch, Country } from '@/types-enums'
import { HINT_GROUPS, HINTS, LIBRARY, toCategoryId } from '@/utils/Category'
import { BANKS } from '@/utils/Parser'

import {
  buildCategoryTree,
  createLibraryIndex,
  findLibraryMatch,
  getLibraryIndex,
  getLibraryKeywords,
  mapLibraryKeyword,
  toWords,
} from '..'
import deHints from '../../../public/locales/hints/de.json'
import enHints from '../../../public/locales/hints/en.json'

const toTransaction = (description: string, value = '-10.00'): Transaction => ({
  id: description,
  date: '2026-01-01T00:00:00+00:00',
  description,
  value,
  currency: 'EUR',
  category: null,
  extra: null,
})

const getBankOf = (country: Country) => BANKS.find((bank) => bank.country === country)!.id
const DE_BANK = getBankOf(Country.DE)

const recognise = (
  description: string,
  { value = '-10.00', bankId = DE_BANK }: { value?: string; bankId?: string } = {},
) =>
  findLibraryMatch({ transaction: toTransaction(description, value), index: getLibraryIndex(), bankId })?.libraryKeyword
    .id ?? null

describe('LIBRARY', () => {
  const libraryKeywords = getLibraryKeywords()

  it('should have unique, stable IDs', () => {
    const packIds = LIBRARY.map((pack) => pack.id)
    expect(new Set(packIds).size).toBe(packIds.length)

    const ids = libraryKeywords.map((libraryKeyword) => libraryKeyword.id)
    expect(new Set(ids).size).toBe(ids.length)
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9_]+\.[a-z0-9_]+$/))
  })

  it('should have valid hints, keywords and examples', () => {
    libraryKeywords.forEach((libraryKeyword) => {
      expect(HINTS).toContain(libraryKeyword.hint)
      expect(libraryKeyword.keywords.length).toBeGreaterThan(0)
      libraryKeyword.keywords.forEach((keyword) => {
        expect({ id: libraryKeyword.id, keyword, length: keyword.trim().length >= 3 }).toMatchObject({ length: true })
        expect(toWords(keyword).length).toBeGreaterThan(0)
      })
      expect(libraryKeyword.examples.length).toBeGreaterThan(0)
    })
  })

  it('should limit bank packs to existing banks', () => {
    const bankIds: string[] = BANKS.map((bank) => bank.id)
    LIBRARY.filter((pack: LibraryPackDef) => pack.bank).forEach((pack) => expect(bankIds).toContain(pack.bank))
  })

  it('should recognise every example as its own library keyword', () => {
    libraryKeywords.forEach((libraryKeyword) => {
      const value = libraryKeyword.direction === CategoryRuleDirection.IN ? '10.00' : '-10.00'
      const bankId =
        libraryKeyword.bank ?? (libraryKeyword.countries ? getBankOf(libraryKeyword.countries[0]) : undefined)

      libraryKeyword.examples.forEach((example) => {
        expect({ example, id: recognise(example, { value, bankId }) }).toEqual({ example, id: libraryKeyword.id })
      })
    })
  })

  it('should translate all hints', () => {
    const groups = HINT_GROUPS.map((group) => group.id).sort()
    ;[enHints, deHints].forEach(({ GROUPS, ...hints }) => {
      expect(Object.keys(hints).sort()).toEqual([...HINTS].sort())
      expect(Object.keys(GROUPS).sort()).toEqual(groups)
    })
  })
})

describe('findLibraryMatch', () => {
  it('should not match inside words or common words', () => {
    expect(recognise('T-Mobile Rechnung')).toBeNull()
    expect(recognise('Sparkasse Überweisung')).toBeNull()
    expect(recognise('Nettogehalt', { value: '3000.00' })).toBeNull()
    expect(recognise('Total amount due')).toBeNull()
    expect(recognise('Müller Hausverwaltung Miete')).toBe('global.rent')
  })

  it('should only match library keywords limited to countries for banks of those countries', () => {
    expect(recognise('Spar-Konto Einzahlung')).toBeNull()
    expect(recognise('SPAR GROENKLOOF', { bankId: getBankOf(Country.ZA) })).toBe('global.spar')
    expect(recognise('SPAR GROENKLOOF', { bankId: 'custom_0123' })).toBeNull()
  })

  it('should only match library keywords of a bank pack for its transactions', () => {
    expect(recognise('#INT PYMT FEE', { bankId: 'fnb' })).toBe('fnb.fees')
    expect(recognise('#INT PYMT FEE')).toBeNull()
  })

  it('should only match library keywords limited to a direction for it', () => {
    expect(recognise('Gehalt März', { value: '3000.00' })).toBe('global.salary')
    expect(recognise('Gehalt März')).toBeNull()
  })

  it('should prefer library keywords of the bank, then the more specific match type, then the longer keyword, then the ID', () => {
    const toLibraryKeyword = (
      id: string,
      keywords: string[],
      libraryKeyword: Partial<LibraryKeyword> = {},
    ): LibraryKeyword => ({
      id,
      name: id,
      hint: 'general_stores',
      keywords,
      examples: [keywords[0]],
      packId: 'test',
      match: CategoryRuleMatch.CONTAINS_WORD,
      direction: CategoryRuleDirection.ANY,
      ...libraryKeyword,
    })
    const index = createLibraryIndex([
      toLibraryKeyword('b.short', ['SHOP']),
      toLibraryKeyword('a.short', ['SHOP']),
      toLibraryKeyword('long', ['SHOP MALL']),
      toLibraryKeyword('start', ['SHOP'], { match: CategoryRuleMatch.STARTS_WITH }),
      toLibraryKeyword('bank', ['SHOP'], { bank: 'fnb' }),
    ])
    const match = (description: string, bankId?: string) =>
      findLibraryMatch({ transaction: toTransaction(description), index, bankId })?.libraryKeyword.id

    expect(match('SHOP MALL 1', 'fnb')).toBe('bank')
    expect(match('SHOP MALL 1')).toBe('start')
    expect(match('THE SHOP MALL')).toBe('long')
    expect(match('THE SHOP')).toBe('a.short')
  })
})

describe('mapLibraryKeyword', () => {
  const [libraryKeyword] = getLibraryKeywords([
    {
      id: 'test',
      libraryKeywords: [{ id: 'shop', name: 'Shop', hint: 'supermarket', keywords: ['SHOP'], examples: ['SHOP'] }],
    },
  ])
  const tree = buildCategoryTree([
    {
      id: toCategoryId('food'),
      color: 'orange',
      direction: 'out',
      children: ['groceries', 'eating_out', 'coffee'].map((id) => ({ id: toCategoryId(id) })),
    },
  ])
  const map = (hints: Record<string, string>, keywords: Record<string, string | null> = {}) =>
    mapLibraryKeyword({
      libraryKeyword,
      mappings: {
        hints: mapValues(hints, toCategoryId),
        keywords: mapValues(keywords, (id) => (id === null ? null : toCategoryId(id))),
      },
      tree,
    })

  it('should map by the library keyword, then its hint, skipping categories the rule set does not have', () => {
    expect(map({ supermarket: 'groceries' })).toEqual({
      category: 'groceries',
      mapping: { type: 'hint', hint: 'supermarket' },
    })
    expect(map({ bakery: 'groceries' })).toEqual({ category: null, mapping: { type: 'unmapped' } })
    expect(map({ supermarket: 'groceries' }, { 'test.shop': 'coffee' })).toEqual({
      category: 'coffee',
      mapping: { type: 'keyword' },
    })
    expect(map({ supermarket: 'groceries' }, { 'test.shop': null })).toEqual({
      category: null,
      mapping: { type: 'excluded' },
    })
    expect(map({ supermarket: 'rent' }, { 'test.shop': 'utilities' })).toEqual({
      category: null,
      mapping: { type: 'unmapped' },
    })
  })
})
