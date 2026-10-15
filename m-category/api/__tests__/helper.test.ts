import { describe, expect, it } from 'vitest'

import type { CategoryRulesetAtRest } from '@/types'
import { CategoryRuleDirection, CategoryRuleField, CategoryRuleMatch } from '@/types-enums'
import { MY_RULES_ID } from '@/utils/Category'

import { getNextNumber, withNumbers } from '../helper'

const toRule = (id: string, number?: number) => ({
  id,
  number,
  field: CategoryRuleField.DESCRIPTION,
  match: CategoryRuleMatch.CONTAINS,
  ignoreCase: true,
  keyword: id,
  direction: CategoryRuleDirection.ANY,
  category: 'GRO_01',
})

const toRuleset = (id: string, created: string, rules = [toRule('a')], number?: number): CategoryRulesetAtRest => ({
  id,
  number,
  name: id,
  rules,
  created,
  modified: created,
})

describe('withNumbers', () => {
  it('should number rules and rule sets stored without, after the highest number', () => {
    const result = withNumbers([
      toRuleset('second', '2026-01-02T00:00:00+00:00'),
      toRuleset(MY_RULES_ID, '2026-01-03T00:00:00+00:00', [toRule('a'), toRule('b', 5), toRule('c')]),
      toRuleset('first', '2026-01-01T00:00:00+00:00', [toRule('a', 1)], 1),
    ])

    expect(result.map(({ ruleset }) => [ruleset.id, ruleset.number])).toEqual([
      ['first', 1],
      ['second', 2],
      [MY_RULES_ID, 0],
    ])
    expect(result[2].ruleset.rules.map((rule) => rule.number)).toEqual([6, 5, 7])
    expect(result.map(({ isChanged }) => isChanged)).toEqual([false, true, true])
  })
})

describe('getNextNumber', () => {
  it('should count up from the highest number, never reusing one', () => {
    expect(getNextNumber([])).toBe(1)
    expect(getNextNumber([{ number: 1 }, { number: 4 }])).toBe(5)
  })
})
