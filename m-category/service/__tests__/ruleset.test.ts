import { describe, expect, it } from 'vitest'

import type { CategoryRuleset } from '@/types'
import { CategoryDirection, CategoryRuleDirection, CategoryRuleField, CategoryRuleMatch } from '@/types-enums'
import { getTemplate } from '@/utils/Category'

import {
  addCategory,
  addParentCategory,
  addRule,
  createCategoryCode,
  createRuleset,
  getCategoryRules,
  getNextNumber,
  isUnchangedTemplate,
  moveCategory,
  removeCategory,
  updateCategory,
} from '../ruleset'

const NOW = '2026-01-01T00:00:00+00:00'
const getParent = (ruleset: CategoryRuleset, code: string) => ruleset.categories.find((parent) => parent.code === code)!

const minimal = createRuleset({ name: 'Minimal', number: 1, now: NOW, template: getTemplate('minimal_germany') })

describe('createCategoryCode', () => {
  it('should create parent codes not used by the templates, and children prefixed by their parent', () => {
    expect(createCategoryCode()).toMatch(/^X[A-Z0-9]{6}$/)
    expect(createCategoryCode('HOU')).toMatch(/^HOU_[A-Z0-9]{6}$/)
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
    expect(minimal.categories.map((parent) => [parent.code, parent.direction])).toEqual([
      ['SIN', CategoryDirection.IN],
      ['TRI', CategoryDirection.IN],
      ['SOU', CategoryDirection.OUT],
      ['TRO', CategoryDirection.OUT],
    ])
    expect(getParent(minimal, 'TRO').children).toEqual([{ code: 'TRO_01', isTransfer: true }])
    expect(minimal.rules.map((rule) => rule.number)).toEqual(minimal.rules.map((_, index) => index + 1))

    const copy = createRuleset({ name: 'Copy', number: 2, now: NOW, copyOf: minimal })
    expect(copy.categories).toEqual(minimal.categories)
    expect(copy.rules.map((rule) => rule.id)).not.toContain(minimal.rules[0].id)

    expect(createRuleset({ name: 'Empty', number: 3, now: NOW })).toMatchObject({ categories: [], rules: [] })
  })
})

describe('category changes', () => {
  it('should add parent categories with a first subcategory, and subcategories', () => {
    const added = addParentCategory({ label: 'Pets', direction: CategoryDirection.OUT, color: 'pink' })(minimal)
    const parent = added.categories.at(-1)!

    expect(parent).toMatchObject({ label: 'Pets', direction: CategoryDirection.OUT, color: 'pink' })
    expect(parent.children).toHaveLength(1)

    const withChild = addCategory({ parentCode: parent.code, label: 'Vet' })(added)
    expect(withChild.categories.at(-1)!.children.map((child) => child.label)).toEqual(['Pets', 'Vet'])
  })

  it('should rename, clear the label of, mark as transfer and recolour categories', () => {
    const renamed = updateCategory({ code: 'SOU_01', label: ' Rent ' })(minimal)
    expect(getParent(renamed, 'SOU').children[0]).toEqual({ code: 'SOU_01', label: 'Rent' })
    expect(getParent(updateCategory({ code: 'SOU_01', label: '' })(renamed), 'SOU').children[0]).toEqual({
      code: 'SOU_01',
    })
    expect(getParent(updateCategory({ code: 'SOU_01', isTransfer: true })(renamed), 'SOU').children[0]).toEqual({
      code: 'SOU_01',
      label: 'Rent',
      isTransfer: true,
    })
    expect(getParent(updateCategory({ code: 'TRO_01', isTransfer: false })(minimal), 'TRO').children[0]).toEqual({
      code: 'TRO_01',
    })
    expect(getParent(updateCategory({ code: 'SOU', color: 'red' })(minimal), 'SOU').color).toBe('red')
  })

  it('should delete categories with their rules', () => {
    const rules = getCategoryRules(minimal, 'SOU_01')
    expect(rules.length).toBeGreaterThan(0)

    const removed = removeCategory('SOU_01')(minimal)
    expect(getParent(removed, 'SOU').children.map((child) => child.code)).not.toContain('SOU_01')
    expect(removed.rules).toHaveLength(minimal.rules.length - rules.length)

    const removedParent = removeCategory('SOU')(minimal)
    expect(removedParent.categories.map((parent) => parent.code)).toEqual(['SIN', 'TRI', 'TRO'])
    expect(getCategoryRules(minimal, 'SOU').length).toBe(minimal.rules.length - removedParent.rules.length)
  })

  it('should move categories among their siblings', () => {
    const moved = moveCategory({ code: 'SOU_02', step: -1 })(minimal)
    expect(
      getParent(moved, 'SOU')
        .children.map((child) => child.code)
        .slice(0, 2),
    ).toEqual(['SOU_02', 'SOU_01'])
    // Parent categories only among those of the same direction
    expect(moveCategory({ code: 'SOU', step: -1 })(minimal).categories).toEqual(minimal.categories)
  })

  it('should number added rules after the highest one', () => {
    const rule = {
      field: CategoryRuleField.DESCRIPTION,
      match: CategoryRuleMatch.CONTAINS,
      ignoreCase: true,
      keyword: 'REWE',
      direction: CategoryRuleDirection.OUT,
      category: 'SOU_01',
    }

    expect(addRule(rule)(minimal).rules.at(-1)!.number).toBe(minimal.rules.length + 1)
  })
})

describe('isUnchangedTemplate', () => {
  it('should tell rule sets with the categories and rules of a template, also renamed', () => {
    expect(isUnchangedTemplate({ ...minimal, name: 'Renamed' })).toBe(true)
    expect(isUnchangedTemplate(updateCategory({ code: 'SOU_01', label: 'Rent' })(minimal))).toBe(false)
    expect(isUnchangedTemplate({ ...minimal, rules: minimal.rules.slice(1) })).toBe(false)
    expect(isUnchangedTemplate(createRuleset({ name: 'Empty', number: 2, now: NOW }))).toBe(false)
  })
})
