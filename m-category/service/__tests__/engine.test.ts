import { omit } from 'lodash'
import { describe, expect, it } from 'vitest'

import type { CategoryId, CategoryOverride, CategoryRule, CategoryRuleset, Transaction } from '@/types'
import {
  CategoryDirection,
  CategoryRuleDirection,
  CategoryRuleField,
  CategoryRuleMatch,
  CategorySource,
} from '@/types-enums'
import { DEFAULT_TEMPLATE_ID, getTemplate, toCategoryId } from '@/utils/Category'

import {
  compileRule,
  createCategoryEngine,
  createRuleset,
  getKeywordMappingEffect,
  getLibraryDescriptionMatches,
  getNewRuleEffect,
  getRuleRef,
  resolveCategory,
} from '..'

const NOW = '2026-01-01T00:00:00+00:00'

const toTransaction = (description: string, value = '-10.00', extra: Transaction['extra'] = null): Transaction => ({
  id: `${description}|${value}`,
  date: NOW,
  description,
  value,
  currency: 'EUR',
  category: null,
  extra,
})

type TestRule = CategoryRule & { category: CategoryId }

const toRule = (keyword: string, category: CategoryId, rule: Partial<CategoryRule> = {}): TestRule => ({
  id: `${keyword}|${category}`,
  number: 1,
  field: CategoryRuleField.DESCRIPTION,
  match: CategoryRuleMatch.CONTAINS,
  ignoreCase: true,
  direction: CategoryRuleDirection.ANY,
  keyword,
  category,
  ...rule,
})

const fromTemplate = (templateId: string) => {
  return createRuleset({ name: templateId, number: 1, now: NOW, template: getTemplate(templateId) })
}

/**
 * The rule set mapping the user's rules to their categories, and the rules.
 */
const withRules = (base: CategoryRuleset, rules: TestRule[]) => ({
  ruleset: { ...base, rules: Object.fromEntries(rules.map((rule) => [rule.id, rule.category])) },
  rules: rules.map((rule) => omit(rule, 'category')),
})

const standard = fromTemplate(DEFAULT_TEMPLATE_ID)

/**
 * A rule set with a single category, for rent only.
 */
const other: CategoryRuleset = {
  ...createRuleset({ name: 'Other', number: 2, now: NOW }),
  categories: [
    {
      id: toCategoryId('spending'),
      color: 'red',
      direction: CategoryDirection.OUT,
      children: [{ id: toCategoryId('everything') }],
    },
  ],
  mappings: { in: { hints: {}, keywords: {} }, out: { hints: { rent: toCategoryId('everything') }, keywords: {} } },
}

/**
 * With the standard categories, without library mappings.
 */
const toRuleset = (rules: TestRule[]) =>
  withRules({ ...standard, mappings: { in: { hints: {}, keywords: {} }, out: { hints: {}, keywords: {} } } }, rules)

type ResolveProps = {
  ruleset?: CategoryRuleset | null
  rules?: CategoryRule[]
  overrides?: CategoryOverride[]
  bankId?: string
}

const resolve = (
  transaction: Transaction,
  { ruleset = standard, rules = [], overrides = [], bankId }: ResolveProps = {},
) => {
  return resolveCategory({ transaction, engine: createCategoryEngine({ ruleset, rules, overrides }), bankId })
}

const category = (description: string, props?: ResolveProps) => resolve(toTransaction(description), props).category

describe('resolveCategory', () => {
  it('should categorise what the library recognises as the rule set maps it', () => {
    expect(category('OBI Markt 123')).toBe(toCategoryId('home'))
    expect(category('Müller Drogerie')).toBe(toCategoryId('personal_care'))
    expect(category('Internet Banking Payment: Luno (stb) 42')).toBe(toCategoryId('savings'))
    expect(category('#INT PYMT FEE', { bankId: 'fnb' })).toBe(toCategoryId('fees_interest'))
  })

  it('should not recognise keywords inside other words', () => {
    expect(category('T-Mobile Rechnung')).toBeNull()
    expect(category('Sparkasse Überweisung')).toBeNull()
    expect(category('Nettogehalt')).toBeNull()
  })

  it('should reference the library keyword and how the rule set maps it', () => {
    expect(resolve(toTransaction('REWE'))).toMatchObject({
      category: toCategoryId('groceries'),
      source: CategorySource.LIBRARY,
      library: {
        libraryKeyword: { id: 'de.rewe', name: 'REWE' },
        keyword: 'REWE',
        mapping: { type: 'hint', hint: 'supermarket' },
      },
    })
  })

  it('should map by the direction of the transaction', () => {
    expect(resolve(toTransaction('Interest Received', '5.00')).category).toBe(toCategoryId('investment_income'))
    expect(resolve(toTransaction('Debit Interest', '-5.00')).category).toBe(toCategoryId('fees_interest'))
    expect(resolve(toTransaction('Finanzamt Erstattung', '500.00')).category).toBe(toCategoryId('other_income'))
    expect(resolve(toTransaction('Finanzamt Einkommensteuer', '-500.00')).category).toBe(toCategoryId('taxes'))
  })

  it('should leave recognised transactions uncategorised when the rule set does not map them', () => {
    const ruleset = {
      ...standard,
      mappings: { ...standard.mappings, out: { ...standard.mappings.out, keywords: { 'de.obi': null } } },
    }

    expect(resolve(toTransaction('OBI Markt'), { ruleset })).toMatchObject({
      category: null,
      source: CategorySource.NONE,
      library: { libraryKeyword: { id: 'de.obi' }, mapping: { type: 'excluded' } },
    })
    expect(resolve(toTransaction('REWE'), { ruleset: other })).toMatchObject({
      category: null,
      source: CategorySource.NONE,
      library: { libraryKeyword: { id: 'de.rewe' }, mapping: { type: 'unmapped' } },
    })
  })

  it('should only apply rules the rule set maps, to categories it has', () => {
    const { rules } = toRuleset([toRule('REWE', toCategoryId('general_shopping'))])

    // Mapped by another rule set only, the library applies
    expect(resolve(toTransaction('REWE Markt'), { rules }).category).toBe(toCategoryId('groceries'))
    expect(category('REWE Markt', withRules(other, [toRule('REWE', toCategoryId('general_shopping'))]))).toBeNull()
  })

  it('should apply rules before the library', () => {
    const props = withRules(standard, [toRule('REWE', toCategoryId('general_shopping'))])

    expect(resolve(toTransaction('REWE Markt'), props)).toMatchObject({
      category: toCategoryId('general_shopping'),
      source: CategorySource.RULE,
    })
  })

  it('should prefer the longest matching keyword', () => {
    expect(category('STEAM PURCHASE AMAZON PRIM')).toBe(toCategoryId('entertainment'))
  })

  it('should apply the mappings of the active rule set only', () => {
    expect(resolve(toTransaction('Gehalt Oktober', '3000.00'), { ruleset: other }).category).toBeNull()
    expect(category('Miete Januar', { ruleset: other })).toBe(toCategoryId('everything'))
    expect(category('REWE', { ruleset: other })).toBeNull()
  })

  it('should leave transactions uncategorised by direction without a rule set', () => {
    expect(resolve(toTransaction('REWE'), { ruleset: null })).toMatchObject({
      category: null,
      source: CategorySource.NONE,
    })
    expect(resolve(toTransaction('Interest Received', '5.00'), { ruleset: null }).category).toBeNull()
  })

  it('should apply overrides of the rule set before all rules, only with its categories', () => {
    const transaction = toTransaction('REWE')
    const overrides = [
      { rulesetId: standard.id, transactionId: transaction.id, category: toCategoryId('rent'), created: NOW },
    ]

    expect(resolve(transaction, { overrides })).toEqual({
      category: toCategoryId('rent'),
      source: CategorySource.OVERRIDE,
    })
    // Of another rule set, its mappings apply
    expect(resolve(transaction, { overrides, ruleset: other }).category).toBeNull()
    // Overrides of another rule set don't apply
    expect(resolve(transaction, { overrides: [{ ...overrides[0], rulesetId: 'another' }] }).category).toBe(
      toCategoryId('groceries'),
    )
  })

  it('should reference stored rules', () => {
    const props = toRuleset([toRule('REWE', toCategoryId('groceries'), { id: 'a', number: 3 })])

    expect(resolve(toTransaction('REWE'), props)).toMatchObject({
      category: toCategoryId('groceries'),
      source: CategorySource.RULE,
      rule: { id: 'a', number: 3, keyword: 'REWE' },
    })
  })

  it('should match keywords at the start or the whole value', () => {
    const props = toRuleset([
      toRule('VISA NETTO', toCategoryId('groceries'), { match: CategoryRuleMatch.STARTS_WITH }),
      toRule('Rent', toCategoryId('rent'), { match: CategoryRuleMatch.EQUALS }),
    ])

    expect(category('visa netto Marken-Discount', props)).toBe(toCategoryId('groceries'))
    expect(category('Payment VISA NETTO', props)).toBeNull()
    expect(category('VISA NETTOS', props)).toBeNull()
    expect(category(' rent ', props)).toBe(toCategoryId('rent'))
    expect(category('Rent January', props)).toBeNull()
    expect(category('Parent', props)).toBeNull()
    expect(category('January Rent', props)).toBeNull()
    expect(category('Ren t', props)).toBeNull()
  })

  it('should match contained keywords inside words, unless matching whole words', () => {
    const props = toRuleset([
      toRule('box', toCategoryId('groceries')),
      toRule('OBI', toCategoryId('rent'), { match: CategoryRuleMatch.CONTAINS_WORD }),
    ])

    expect(category('Amazon Boxes', props)).toBe(toCategoryId('groceries'))
    expect(category('OBI Markt', props)).toBe(toCategoryId('rent'))
    expect(category('T-Mobile', props)).toBeNull()
  })

  it('should match contained keywords when all their words are found, in any order', () => {
    const props = toRuleset([
      toRule('here is text', toCategoryId('groceries')),
      toRule('OBI markt', toCategoryId('rent'), { match: CategoryRuleMatch.CONTAINS_WORD }),
    ])

    expect(category('Here is some TEXT', props)).toBe(toCategoryId('groceries'))
    expect(category('texts here, it is', props)).toBe(toCategoryId('groceries'))
    expect(category('here is some', props)).toBeNull()
    expect(category('Markt OBI 42', props)).toBe(toCategoryId('rent'))
    expect(category('Markt T-Mobile', props)).toBeNull()
  })

  it('should match the case of the keyword unless ignoring it', () => {
    const props = toRuleset([toRule('REWE', toCategoryId('children'), { ignoreCase: false })])

    expect(category('REWE Markt', props)).toBe(toCategoryId('children'))
    expect(category('Rewe Markt', props)).toBeNull()
  })

  it('should only apply rules to their direction', () => {
    const props = toRuleset([toRule('Refund', toCategoryId('other_income'), { direction: CategoryRuleDirection.IN })])

    expect(resolve(toTransaction('Refund', '5.00'), props).category).toBe(toCategoryId('other_income'))
    expect(resolve(toTransaction('Refund', '-5.00'), props).category).toBeNull()
  })

  it('should match the category of the file, but not use it', () => {
    const props = toRuleset([toRule('Groceries', toCategoryId('groceries'), { field: CategoryRuleField.CATEGORY })])

    expect(resolve(toTransaction('Shop 42', '-5.00', { category: 'Groceries' }), props).category).toBe(
      toCategoryId('groceries'),
    )
    expect(resolve(toTransaction('Groceries'), props).category).toBeNull()
  })

  it('should keep preset categories the rule set has in the demo only, categorise the others with its rules', () => {
    const engine = createCategoryEngine({ ruleset: standard, rules: [], overrides: [], usePresets: true })
    const transaction = toTransaction('REWE')

    expect(resolveCategory({ transaction, engine, preset: toCategoryId('workspace') })).toEqual({
      category: toCategoryId('workspace'),
      source: CategorySource.PRESET,
    })
    // Not a category of the rule set, the library applies
    expect(resolveCategory({ transaction, engine, preset: toCategoryId('unknown') }).category).toBe(
      toCategoryId('groceries'),
    )
    expect(
      resolveCategory({
        transaction: toTransaction('Miete Januar'),
        engine: createCategoryEngine({
          ruleset: other,
          rules: [],
          overrides: [],
          usePresets: true,
        }),
        preset: toCategoryId('rent'),
      }).category,
    ).toBe(toCategoryId('everything'))
    expect(
      resolveCategory({
        transaction,
        engine: createCategoryEngine({ ruleset: standard, rules: [], overrides: [] }),
        preset: toCategoryId('workspace'),
      }).category,
    ).toBe(toCategoryId('groceries'))
  })
})

describe('getRuleRef', () => {
  it('should pad the number', () => {
    expect(getRuleRef(14)).toBe('R-014')
  })
})

describe('getNewRuleEffect', () => {
  const rewe = toTransaction('REWE Markt Berlin')
  const manual = toTransaction('REWE City')
  const engine = createCategoryEngine({
    ...toRuleset([toRule('REWE Markt', toCategoryId('groceries'), { id: 'a', number: 1 })]),
    overrides: [{ rulesetId: standard.id, transactionId: manual.id, category: toCategoryId('rent'), created: NOW }],
  })
  const effect = (transaction: Transaction, keyword: string, editedId = '') =>
    getNewRuleEffect({
      transaction,
      engine,
      rule: compileRule({ rule: toRule(keyword, toCategoryId('groceries')) }),
      editedId,
    })

  it('should change the category unless a more specific rule or an override wins', () => {
    expect(effect(rewe, 'REWE Markt Berlin')).toBeNull()
    expect(effect(rewe, 'REWE')).toBe('rule')
    expect(effect(manual, 'REWE')).toBe('override')
    // The override of the edited transaction is removed
    expect(effect(manual, 'REWE', manual.id)).toBeNull()
  })
})

describe('getKeywordMappingEffect', () => {
  const rewe = toTransaction('REWE Markt Berlin')
  const ruled = toTransaction('REWE City')
  const manual = toTransaction('REWE Center')
  const engine = createCategoryEngine({
    ...withRules(standard, [toRule('REWE City', toCategoryId('general_shopping'))]),
    overrides: [{ rulesetId: standard.id, transactionId: manual.id, category: toCategoryId('rent'), created: NOW }],
  })

  it('should change the category unless a rule or an override wins, and highlight the keyword', () => {
    expect(getKeywordMappingEffect({ transaction: rewe, engine, editedId: '' })).toBeNull()
    expect(getKeywordMappingEffect({ transaction: ruled, engine, editedId: '' })).toBe('rule')
    expect(getKeywordMappingEffect({ transaction: manual, engine, editedId: '' })).toBe('override')
    expect(getKeywordMappingEffect({ transaction: manual, engine, editedId: manual.id })).toBeNull()
    expect(getLibraryDescriptionMatches(rewe, engine)).toEqual([[0, 4]])
  })
})
