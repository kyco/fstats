import { describe, expect, it } from 'vitest'

import type { CategoryCode, CategoryOverride, CategoryRule, CategoryRuleset, Transaction } from '@/types'
import { CategoryRuleDirection, CategoryRuleField, CategoryRuleMatch, CategorySource } from '@/types-enums'
import { DEFAULT_TEMPLATE_ID, getTemplate } from '@/utils/Category'

import { compileRule, createCategoryEngine, createRuleset, getNewRuleEffect, getRuleRef, resolveCategory } from '..'

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

const toRule = (keyword: string, category: CategoryCode, rule: Partial<CategoryRule> = {}): CategoryRule => ({
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
 * With the standard categories.
 */
const toRuleset = (rules: CategoryRule[]): CategoryRuleset => ({ ...fromTemplate(DEFAULT_TEMPLATE_ID), rules })

type ResolveProps = {
  ruleset?: CategoryRuleset | null
  overrides?: CategoryOverride[]
}

const standard = fromTemplate(DEFAULT_TEMPLATE_ID)

const resolve = (transaction: Transaction, { ruleset = standard, overrides = [] }: ResolveProps = {}) => {
  return resolveCategory({ transaction, engine: createCategoryEngine({ ruleset, overrides }) })
}

const category = (description: string, props?: ResolveProps) => resolve(toTransaction(description), props).category

describe('resolveCategory', () => {
  it('should match keywords of the standard template as whole words, ignoring case', () => {
    expect(category('OBI Markt 123')).toBe('HOU_05')
    expect(category('Lastschrift spar Filiale')).toBe('GRO_01')
    expect(category('Müller Drogerie')).toBe('HLT_02')
  })

  it('should not match keywords inside other words', () => {
    expect(category('T-Mobile Rechnung')).toBe('TFO_02')
    expect(category('Sparkasse Überweisung')).toBe('TFO_02')
    expect(category('Nettogehalt')).toBe('TFO_02')
  })

  it('should match keywords with non-word edges', () => {
    expect(category('#INT PYMT FEE')).toBe('FIN_05')
    expect(category('Internet Banking Payment: Luno (stb) 42')).toBe('FIN_04')
  })

  it('should reference the matching rule', () => {
    expect(resolve(toTransaction('REWE'))).toMatchObject({
      category: 'GRO_01',
      source: CategorySource.RULE,
      rule: { rulesetId: standard.id, keyword: 'REWE' },
    })
  })

  it('should prefer the longest matching keyword', () => {
    expect(category('STEAM PURCHASE AMAZON PRIM')).toBe('FAM_06')
  })

  it('should apply the rules of the active rule set only', () => {
    const ruleset = fromTemplate('minimal_germany')

    expect(resolve(toTransaction('Gehalt Oktober', '3000.00'), { ruleset }).category).toBe('SIN_01')
    expect(resolve(toTransaction('Nettogehalt', '3000.00'), { ruleset }).category).toBe('TFI_02')
    expect(category('Deutsche Bahn Ticket', { ruleset })).toBe('SOU_04')
    expect(category('REWE', { ruleset })).toBe('TFO_02')
  })

  it('should leave transactions uncategorised by direction without a rule set', () => {
    expect(resolve(toTransaction('REWE'), { ruleset: null })).toEqual({
      category: 'TFO_02',
      source: CategorySource.NONE,
    })
    expect(resolve(toTransaction('Interest Received', '5.00'), { ruleset: null }).category).toBe('TFI_02')
  })

  it('should apply overrides before all rules, only with categories of the rule set', () => {
    const transaction = toTransaction('REWE')
    const overrides = [{ transactionId: transaction.id, category: 'HOU_01', created: NOW }]

    expect(resolve(transaction, { overrides })).toEqual({ category: 'HOU_01', source: CategorySource.OVERRIDE })
    // The minimal template has no "HOU_01", its rules apply
    expect(resolve(transaction, { overrides, ruleset: fromTemplate('minimal_germany') }).category).toBe('TFO_02')
    // The system categories are in every rule set
    expect(resolve(transaction, { overrides: [{ ...overrides[0], category: 'TFO_02' }], ruleset: null }).category).toBe(
      'TFO_02',
    )
  })

  it('should match keywords at the start or the whole value', () => {
    const ruleset = toRuleset([
      toRule('VISA NETTO', 'GRO_01', { match: CategoryRuleMatch.STARTS_WITH }),
      toRule('Rent', 'HOU_01', { match: CategoryRuleMatch.EQUALS }),
    ])
    const props = { ruleset }

    expect(category('visa netto Marken-Discount', props)).toBe('GRO_01')
    expect(category('Payment VISA NETTO', props)).toBe('TFO_02')
    expect(category('VISA NETTOS', props)).toBe('TFO_02')
    expect(category(' rent ', props)).toBe('HOU_01')
    expect(category('Rent January', props)).toBe('TFO_02')
    expect(category('Parent', props)).toBe('TFO_02')
    expect(category('January Rent', props)).toBe('TFO_02')
    expect(category('Ren t', props)).toBe('TFO_02')
  })

  it('should match contained keywords inside words, unless matching whole words', () => {
    const ruleset = toRuleset([
      toRule('box', 'GRO_01'),
      toRule('OBI', 'HOU_01', { match: CategoryRuleMatch.CONTAINS_WORD }),
    ])

    expect(category('Amazon Boxes', { ruleset })).toBe('GRO_01')
    expect(category('OBI Markt', { ruleset })).toBe('HOU_01')
    expect(category('T-Mobile', { ruleset })).toBe('TFO_02')
  })

  it('should match contained keywords when all their words are found, in any order', () => {
    const ruleset = toRuleset([
      toRule('here is text', 'GRO_01'),
      toRule('OBI markt', 'HOU_01', { match: CategoryRuleMatch.CONTAINS_WORD }),
    ])

    expect(category('Here is some TEXT', { ruleset })).toBe('GRO_01')
    expect(category('texts here, it is', { ruleset })).toBe('GRO_01')
    expect(category('here is some', { ruleset })).toBe('TFO_02')
    expect(category('Markt OBI 42', { ruleset })).toBe('HOU_01')
    expect(category('Markt T-Mobile', { ruleset })).toBe('TFO_02')
  })

  it('should match the case of the keyword unless ignoring it', () => {
    const ruleset = toRuleset([toRule('REWE', 'FAM_01', { ignoreCase: false })])

    expect(category('REWE Markt', { ruleset })).toBe('FAM_01')
    expect(category('Rewe Markt', { ruleset })).toBe('TFO_02')
  })

  it('should only apply rules to their direction', () => {
    const ruleset = toRuleset([toRule('Refund', 'OTH_04', { direction: CategoryRuleDirection.IN })])

    expect(resolve(toTransaction('Refund', '5.00'), { ruleset }).category).toBe('OTH_04')
    expect(resolve(toTransaction('Refund', '-5.00'), { ruleset }).category).toBe('TFO_02')
  })

  it('should match the category of the file, but not use it', () => {
    const ruleset = toRuleset([toRule('Groceries', 'GRO_01', { field: CategoryRuleField.CATEGORY })])

    expect(resolve(toTransaction('Shop 42', '-5.00', { category: 'Groceries' }), { ruleset }).category).toBe('GRO_01')
    expect(resolve(toTransaction('Groceries'), { ruleset }).category).toBe('TFO_02')
  })

  it('should keep preset categories the rule set has in the demo only, categorise the others with its rules', () => {
    const engine = createCategoryEngine({ ruleset: standard, overrides: [], usePresets: true })
    const transaction = toTransaction('REWE')

    expect(resolveCategory({ transaction, engine, preset: 'BUS_02' })).toEqual({
      category: 'BUS_02',
      source: CategorySource.PRESET,
    })
    // Not in the standard categories, its rules apply
    expect(resolveCategory({ transaction, engine, preset: 'SOU_01' }).category).toBe('GRO_01')
    expect(
      resolveCategory({
        transaction: toTransaction('Miete Januar'),
        engine: createCategoryEngine({ ruleset: fromTemplate('minimal_germany'), overrides: [], usePresets: true }),
        preset: 'HOU_01',
      }).category,
    ).toBe('SOU_01')
    expect(
      resolveCategory({
        transaction,
        engine: createCategoryEngine({ ruleset: standard, overrides: [] }),
        preset: 'BUS_02',
      }).category,
    ).toBe('GRO_01')
  })
})

describe('getRuleRef', () => {
  it('should prefix the number with the rule set', () => {
    const rulesets = [{ ...standard, number: 2 }]

    expect(getRuleRef({ rulesetId: standard.id, number: 14, rulesets })).toBe('R2-014')
    expect(getRuleRef({ rulesetId: 'removed', number: 3, rulesets })).toBe('R?-003')
  })
})

describe('getNewRuleEffect', () => {
  const rewe = toTransaction('REWE Markt Berlin')
  const manual = toTransaction('REWE City')
  const engine = createCategoryEngine({
    ruleset: toRuleset([toRule('REWE Markt', 'GRO_01', { id: 'a', number: 1 })]),
    overrides: [{ transactionId: manual.id, category: 'HOU_01', created: NOW }],
  })
  const effect = (transaction: Transaction, keyword: string, editedId = '') =>
    getNewRuleEffect({ transaction, engine, rule: compileRule(toRule(keyword, 'TFO_02')), editedId })

  it('should change the category unless a more specific rule or an override wins', () => {
    expect(effect(rewe, 'REWE Markt Berlin')).toBeNull()
    expect(effect(rewe, 'REWE')).toBe('rule')
    expect(effect(manual, 'REWE')).toBe('override')
    // The override of the edited transaction is removed
    expect(effect(manual, 'REWE', manual.id)).toBeNull()
  })
})
