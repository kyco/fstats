import { describe, expect, it } from 'vitest'

import type { CategoryRule, CategoryRuleset } from '@/types'
import { CategoryDirection, CategoryRuleDirection, CategoryRuleField, CategoryRuleMatch } from '@/types-enums'
import { getTemplate, toCategoryId } from '@/utils/Category'

import {
  addCategory,
  addNamedCategory,
  addParentCategory,
  createCategoryId,
  createRuleset,
  getCategoryMappings,
  getCategoryRules,
  getNextNumber,
  isUnchangedTemplate,
  moveCategory,
  removeCategory,
  setHintMapping,
  setKeywordMapping,
  setRuleMapping,
  updateCategory,
} from '../ruleset'

const NOW = '2026-01-01T00:00:00+00:00'
const getParent = (ruleset: CategoryRuleset, id: string) => ruleset.categories.find((parent) => parent.id === id)!

const standard = createRuleset({ name: 'Personal', number: 1, now: NOW, template: getTemplate('default') })

const toRule = (id: string, number: number): CategoryRule => ({
  id,
  number,
  field: CategoryRuleField.DESCRIPTION,
  match: CategoryRuleMatch.CONTAINS,
  ignoreCase: true,
  keyword: 'REWE',
  direction: CategoryRuleDirection.OUT,
})

const rewe = toRule('rewe', 1)
const lidl = toRule('lidl', 2)

describe('createCategoryId', () => {
  it('should create random IDs, never like those of the templates', () => {
    expect(createCategoryId()).toMatch(/^c_[a-z2-9]{8}$/)
    expect(createCategoryId()).not.toBe(createCategoryId())
  })
})

describe('getNextNumber', () => {
  it('should count up from the highest number, never reusing one', () => {
    expect(getNextNumber([])).toBe(1)
    expect(getNextNumber([{ number: 1 }, { number: 4 }])).toBe(5)
  })
})

describe('createRuleset', () => {
  it('should copy a template or a rule set, or start empty', () => {
    expect(standard.categories.slice(0, 3).map((parent) => [parent.id, parent.direction])).toEqual([
      [toCategoryId('income'), CategoryDirection.IN],
      [toCategoryId('income_transfers'), CategoryDirection.IN],
      [toCategoryId('housing'), CategoryDirection.OUT],
    ])
    expect(getParent(standard, toCategoryId('transfers')).children).toEqual([
      { id: toCategoryId('transfers_out'), isTransfer: true },
    ])
    expect(standard.rules).toEqual({})
    expect(standard.mappings.out.hints).toMatchObject({
      telecom: toCategoryId('phone_internet'),
      mobile: toCategoryId('phone_internet'),
      card_settlement: toCategoryId('transfers_out'),
    })
    expect(standard.mappings.in.hints).toMatchObject({
      salary: toCategoryId('salary'),
      card_settlement: toCategoryId('transfers_in'),
    })

    // The user's rules are shared, copies map them like the original
    const withRule = setRuleMapping({ ruleId: rewe.id, category: toCategoryId('insurance') })(standard)
    const copy = createRuleset({ name: 'Copy', number: 2, now: NOW, copyOf: withRule })
    expect(copy.categories).toEqual(standard.categories)
    expect(copy.mappings).toEqual(standard.mappings)
    expect(copy.rules).toEqual({ [rewe.id]: toCategoryId('insurance') })

    expect(createRuleset({ name: 'Empty', number: 3, now: NOW })).toMatchObject({
      categories: [],
      rules: {},
      mappings: { in: { hints: {}, keywords: {} }, out: { hints: {}, keywords: {} } },
    })
  })
})

describe('category changes', () => {
  it('should add parent categories with a first subcategory, and subcategories', () => {
    const added = addParentCategory({ label: 'Pets', direction: CategoryDirection.OUT, color: 'pink' })(standard)
    const parent = added.categories.at(-1)!

    expect(parent).toMatchObject({ label: 'Pets', direction: CategoryDirection.OUT, color: 'pink' })
    expect(parent.children).toHaveLength(1)

    const withChild = addCategory({ parentId: parent.id, label: 'Vet' })(added)
    expect(withChild.categories.at(-1)!.children.map((child) => child.label)).toEqual(['Pets', 'Vet'])
  })

  it('should add a named category with a subcategory of the same name, returning its id', () => {
    const { id, update } = addNamedCategory({ ruleset: standard, label: 'Coffee', direction: CategoryDirection.OUT })
    const parent = update(standard).categories.at(-1)!

    expect(parent).toMatchObject({
      label: 'Coffee',
      direction: CategoryDirection.OUT,
      children: [{ id, label: 'Coffee' }],
    })
    expect(standard.categories.map((other) => other.color)).not.toContain(parent.color)
  })

  it('should add a named subcategory to a parent category, returning its id', () => {
    const { id, update } = addNamedCategory({
      ruleset: standard,
      label: 'Coffee',
      parentId: toCategoryId('bills'),
      direction: CategoryDirection.OUT,
    })

    expect(id).toMatch(/^c_/)
    expect(getParent(update(standard), toCategoryId('bills')).children.at(-1)).toEqual({ id, label: 'Coffee' })
    expect(update(standard).categories).toHaveLength(standard.categories.length)
  })

  it('should rename, clear the label of, mark as transfer and recolour categories', () => {
    const renamed = updateCategory({ id: toCategoryId('phone_internet'), label: ' Rent ' })(standard)
    expect(getParent(renamed, toCategoryId('bills')).children[0]).toEqual({
      id: toCategoryId('phone_internet'),
      label: 'Rent',
    })
    expect(
      getParent(updateCategory({ id: toCategoryId('phone_internet'), label: '' })(renamed), toCategoryId('bills'))
        .children[0],
    ).toEqual({
      id: toCategoryId('phone_internet'),
    })
    expect(
      getParent(
        updateCategory({ id: toCategoryId('phone_internet'), isTransfer: true })(renamed),
        toCategoryId('bills'),
      ).children[0],
    ).toEqual({
      id: toCategoryId('phone_internet'),
      label: 'Rent',
      isTransfer: true,
    })
    expect(
      getParent(
        updateCategory({ id: toCategoryId('transfers_out'), isTransfer: false })(standard),
        toCategoryId('transfers'),
      ).children[0],
    ).toEqual({
      id: toCategoryId('transfers_out'),
    })
    expect(
      getParent(updateCategory({ id: toCategoryId('bills'), color: 'red' })(standard), toCategoryId('bills')).color,
    ).toBe('red')
  })

  it('should delete categories with their rules and mappings', () => {
    const withRules = setRuleMapping({ ruleId: lidl.id, category: toCategoryId('phone_internet') })(
      setRuleMapping({ ruleId: rewe.id, category: toCategoryId('insurance') })(standard),
    )
    expect(getCategoryRules({ ruleset: withRules, rules: [rewe, lidl], id: toCategoryId('insurance') })).toEqual([rewe])
    expect(getCategoryRules({ ruleset: withRules, rules: [rewe, lidl], id: toCategoryId('bills') })).toEqual([
      lidl,
      rewe,
    ])
    expect(getCategoryMappings(withRules, toCategoryId('phone_internet'))).toEqual([
      { type: 'hint', key: 'telecom', direction: CategoryDirection.OUT },
      { type: 'hint', key: 'mobile', direction: CategoryDirection.OUT },
      { type: 'hint', key: 'internet', direction: CategoryDirection.OUT },
    ])

    const removed = removeCategory(toCategoryId('insurance'))(withRules)
    expect(getParent(removed, toCategoryId('bills')).children.map((child) => child.id)).not.toContain(
      toCategoryId('insurance'),
    )
    expect(removed.rules).toEqual({ [lidl.id]: toCategoryId('phone_internet') })
    expect(removed.mappings.out.hints).not.toHaveProperty('health_insurance')
    expect(removed.mappings.out.hints).toHaveProperty('telecom', toCategoryId('phone_internet'))

    const removedParent = removeCategory(toCategoryId('bills'))(withRules)
    expect(removedParent.categories.map((parent) => parent.id)).not.toContain(toCategoryId('bills'))
    expect(removedParent.rules).toEqual({})
    expect(Object.values(removedParent.mappings.out.hints)).not.toContain(toCategoryId('phone_internet'))
    expect(removedParent.mappings.out.hints).toHaveProperty('supermarket', toCategoryId('groceries'))
  })

  it('should map hints and library keywords, and remove their mappings', () => {
    const mapped = setKeywordMapping({ direction: CategoryDirection.OUT, key: 'de.rewe', category: null })(
      setHintMapping({
        direction: CategoryDirection.OUT,
        key: toCategoryId('salary'),
        category: toCategoryId('subscriptions'),
      })(standard),
    )
    expect(mapped.mappings.out).toMatchObject({
      hints: { salary: toCategoryId('subscriptions') },
      keywords: { 'de.rewe': null },
    })
    expect(mapped.mappings.in).toEqual(standard.mappings.in)

    const unmapped = setKeywordMapping({ direction: CategoryDirection.OUT, key: 'de.rewe', category: undefined })(
      setHintMapping({ direction: CategoryDirection.OUT, key: toCategoryId('salary'), category: undefined })(mapped),
    )
    expect(unmapped.mappings).toEqual(standard.mappings)
  })

  it('should move categories among their siblings', () => {
    const moved = moveCategory({ id: toCategoryId('insurance'), step: -1 })(standard)
    expect(
      getParent(moved, toCategoryId('bills'))
        .children.map((child) => child.id)
        .slice(0, 2),
    ).toEqual([toCategoryId('insurance'), toCategoryId('phone_internet')])
    // Parent categories only among those of the same direction
    expect(moveCategory({ id: toCategoryId('housing'), step: -1 })(standard).categories).toEqual(standard.categories)
  })

  it('should map rules and remove them from the rule set', () => {
    const mapped = setRuleMapping({ ruleId: rewe.id, category: toCategoryId('insurance') })(standard)
    expect(mapped.rules).toEqual({ [rewe.id]: toCategoryId('insurance') })
    expect(setRuleMapping({ ruleId: rewe.id, category: undefined })(mapped).rules).toEqual({})
  })
})

describe('isUnchangedTemplate', () => {
  it('should tell rule sets with the categories and mappings of a template, also renamed', () => {
    expect(isUnchangedTemplate({ ...standard, name: 'Renamed' })).toBe(true)
    expect(isUnchangedTemplate(updateCategory({ id: toCategoryId('insurance'), label: 'Rent' })(standard))).toBe(false)
    expect(
      isUnchangedTemplate(setRuleMapping({ ruleId: rewe.id, category: toCategoryId('insurance') })(standard)),
    ).toBe(false)
    expect(
      isUnchangedTemplate(
        setHintMapping({ direction: CategoryDirection.OUT, key: 'telecom', category: undefined })(standard),
      ),
    ).toBe(false)
    expect(isUnchangedTemplate(createRuleset({ name: 'Empty', number: 2, now: NOW }))).toBe(false)
  })
})
