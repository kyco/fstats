import { describe, expect, it } from 'vitest'

import type { CategoryCode, CategoryOverride, CategoryRule, CategoryRuleset, Transaction } from '@/types'
import { CategoryRuleDirection, CategoryRuleField, CategoryRuleMatch, CategorySource } from '@/types-enums'
import { DEFAULT_RULESET_ID, MY_RULES_ID } from '@/utils/Category'

import { createCategoryEngine, getActiveRulesetIds, getCategoryConflicts, getRuleRef, resolveCategory } from '..'

const toTransaction = (description: string, value = '-10.00', extra: Transaction['extra'] = null): Transaction => ({
  id: `${description}|${value}`,
  date: '2026-01-01T00:00:00+00:00',
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

const toRuleset = (id: string, rules: CategoryRule[]): CategoryRuleset => ({
  id,
  number: 1,
  name: id,
  rules,
  created: '2026-01-01T00:00:00+00:00',
  modified: '2026-01-01T00:00:00+00:00',
})

type ResolveProps = {
  rulesetIds?: string[]
  rulesets?: CategoryRuleset[]
  overrides?: CategoryOverride[]
  preset?: CategoryCode | null
}

const resolve = (
  transaction: Transaction,
  { rulesetIds = [MY_RULES_ID, DEFAULT_RULESET_ID], rulesets = [], overrides = [], preset }: ResolveProps = {},
) => {
  return resolveCategory({ transaction, engine: createCategoryEngine({ rulesetIds, rulesets, overrides }), preset })
}

const category = (description: string, props?: ResolveProps) => resolve(toTransaction(description), props).category

describe('resolveCategory', () => {
  it('should match keywords of the default rule set as whole words, ignoring case', () => {
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

  it('should name the rule set of the matching rule', () => {
    expect(resolve(toTransaction('REWE'))).toEqual({
      category: 'GRO_01',
      source: CategorySource.RULESET,
      rulesetId: DEFAULT_RULESET_ID,
    })
  })

  it('should prefer the longest matching keyword', () => {
    expect(category('STEAM PURCHASE AMAZON PRIM')).toBe('FAM_06')
  })

  it('should apply the rules of the selected built-in rule set only', () => {
    const props = { rulesetIds: ['minimal_germany'] }

    expect(resolve(toTransaction('Gehalt Oktober', '3000.00'), props).category).toBe('SIN_01')
    expect(resolve(toTransaction('Nettogehalt', '3000.00'), props).category).toBe('TFI_02')
    expect(category('Deutsche Bahn Ticket', props)).toBe('SOU_04')
    expect(category('REWE', props)).toBe('TFO_02')
  })

  it('should combine the checked rule sets, the longest keyword and then the first rule set winning', () => {
    const rulesets = [toRuleset('custom', [toRule('Netto Marken-Discount', 'FAM_01'), toRule('TELEKOM', 'FAM_02')])]
    const props = { rulesets, rulesetIds: [DEFAULT_RULESET_ID, 'custom'] }

    expect(resolve(toTransaction('VISA NETTO MARKEN-DISCOUNT'), props)).toMatchObject({
      category: 'FAM_01',
      rulesetId: 'custom',
    })
    expect(resolve(toTransaction('TELEKOM Rechnung'), props)).toMatchObject({
      category: 'HOU_03',
      rulesetId: DEFAULT_RULESET_ID,
    })
  })

  it('should leave transactions uncategorised by direction without a rule set', () => {
    expect(resolve(toTransaction('REWE'), { rulesetIds: [MY_RULES_ID] })).toEqual({
      category: 'TFO_02',
      source: CategorySource.NONE,
    })
    expect(category('Interest Received', { rulesetIds: [MY_RULES_ID] })).toBe('TFO_02')
    expect(resolve(toTransaction('Interest Received', '5.00'), { rulesetIds: [MY_RULES_ID] }).category).toBe('TFI_02')
  })

  it('should apply my rules before the rule set, with every rule set', () => {
    const rulesets = [toRuleset(MY_RULES_ID, [toRule('REWE', 'FAM_01')])]

    expect(resolve(toTransaction('REWE'), { rulesets })).toMatchObject({
      category: 'FAM_01',
      source: CategorySource.MY_RULE,
      rulesetId: MY_RULES_ID,
      rule: { rulesetId: MY_RULES_ID, id: 'REWE|FAM_01', keyword: 'REWE' },
    })
    expect(category('REWE', { rulesets, rulesetIds: [MY_RULES_ID] })).toBe('FAM_01')
    // Unless unchecked
    expect(category('REWE', { rulesets, rulesetIds: [DEFAULT_RULESET_ID] })).toBe('GRO_01')
  })

  it('should apply overrides before all rules', () => {
    const transaction = toTransaction('REWE')
    const rulesets = [toRuleset(MY_RULES_ID, [toRule('REWE', 'FAM_01')])]
    const overrides = [{ transactionId: transaction.id, category: 'HOU_01', created: '2026-01-01T00:00:00+00:00' }]

    expect(resolve(transaction, { rulesets, overrides, rulesetIds: [MY_RULES_ID] })).toEqual({
      category: 'HOU_01',
      source: CategorySource.OVERRIDE,
    })
  })

  it('should only apply the rules of the selected custom rule set', () => {
    const rulesets = [toRuleset('custom', [toRule('Bakery', 'GRO_02')])]

    expect(category('Bakery', { rulesets, rulesetIds: ['custom'] })).toBe('GRO_02')
    // Built-in rules don't apply with a custom rule set
    expect(category('REWE', { rulesets, rulesetIds: ['custom'] })).toBe('TFO_02')
    expect(category('Bakery', { rulesets })).toBe('TFO_02')
  })

  it('should match keywords at the start or the whole value', () => {
    const rulesets = [
      toRuleset(MY_RULES_ID, [
        toRule('VISA NETTO', 'GRO_01', { match: CategoryRuleMatch.STARTS_WITH }),
        toRule('Rent', 'HOU_01', { match: CategoryRuleMatch.EQUALS }),
      ]),
    ]
    const props = { rulesets, rulesetIds: [MY_RULES_ID] }

    expect(category('visa netto Marken-Discount', props)).toBe('GRO_01')
    expect(category('Payment VISA NETTO', props)).toBe('TFO_02')
    expect(category('VISA NETTOS', props)).toBe('TFO_02')
    expect(category(' rent ', props)).toBe('HOU_01')
    expect(category('Rent January', props)).toBe('TFO_02')
  })

  it('should match the case of the keyword unless ignoring it', () => {
    const rulesets = [toRuleset(MY_RULES_ID, [toRule('REWE', 'FAM_01', { ignoreCase: false })])]
    const props = { rulesets, rulesetIds: [MY_RULES_ID] }

    expect(category('REWE Markt', props)).toBe('FAM_01')
    expect(category('Rewe Markt', props)).toBe('TFO_02')
  })

  it('should only apply rules to their direction', () => {
    const rulesets = [toRuleset(MY_RULES_ID, [toRule('Refund', 'OTH_04', { direction: CategoryRuleDirection.IN })])]

    expect(resolve(toTransaction('Refund', '5.00'), { rulesets }).category).toBe('OTH_04')
    expect(resolve(toTransaction('Refund', '-5.00'), { rulesets }).category).toBe('TFO_02')
  })

  it('should match the category of the file, but not use it', () => {
    const rulesets = [toRuleset(MY_RULES_ID, [toRule('Groceries', 'GRO_01', { field: CategoryRuleField.CATEGORY })])]

    expect(resolve(toTransaction('Shop 42', '-5.00', { category: 'Groceries' }), { rulesets }).category).toBe('GRO_01')
    expect(resolve(toTransaction('Groceries'), { rulesets, rulesetIds: [MY_RULES_ID] }).category).toBe('TFO_02')
  })

  it('should keep preset categories with a built-in rule set only', () => {
    expect(resolve(toTransaction('REWE'), { preset: 'BUS_02' })).toEqual({
      category: 'BUS_02',
      source: CategorySource.PRESET,
    })
    expect(category('REWE', { preset: 'BUS_02', rulesetIds: [MY_RULES_ID] })).toBe('TFO_02')
  })
})

describe('getCategoryConflicts', () => {
  it('should list other rule sets matching with a different category', () => {
    const rulesets = [
      toRuleset('custom', [toRule('TELEKOM', 'FAM_02')]),
      toRuleset(MY_RULES_ID, [toRule('Rechnung', 'HOU_03')]),
    ]
    const engine = createCategoryEngine({
      rulesetIds: [MY_RULES_ID, DEFAULT_RULESET_ID, 'custom'],
      rulesets,
      overrides: [],
    })
    const transaction = toTransaction('TELEKOM Rechnung')
    const resolved = resolveCategory({ transaction, engine })

    // "My rules" wins, the default rule set agrees with it
    expect(resolved).toMatchObject({ category: 'HOU_03', rulesetId: MY_RULES_ID })
    expect(getCategoryConflicts({ transaction, engine, resolved })).toEqual([
      { rulesetId: 'custom', category: 'FAM_02' },
    ])
  })
})

describe('getActiveRulesetIds', () => {
  it('should keep the checked rule sets that exist, in their order', () => {
    const rulesets = [toRuleset('custom', []), toRuleset(MY_RULES_ID, [])]

    expect(
      getActiveRulesetIds({ rulesetIds: ['custom', 'removed', DEFAULT_RULESET_ID, MY_RULES_ID], rulesets }),
    ).toEqual([DEFAULT_RULESET_ID, MY_RULES_ID, 'custom'])
    expect(getActiveRulesetIds({ rulesetIds: [], rulesets })).toEqual([])
  })
})

describe('getRuleRef', () => {
  it('should prefix the number with the rule set', () => {
    const rulesets = [{ ...toRuleset('custom', []), number: 2 }]

    expect(getRuleRef({ rulesetId: MY_RULES_ID, number: 3, rulesets })).toBe('MR-003')
    expect(getRuleRef({ rulesetId: 'custom', number: 14, rulesets })).toBe('R2-014')
  })
})
