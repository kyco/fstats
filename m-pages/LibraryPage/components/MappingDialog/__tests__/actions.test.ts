import { describe, expect, it } from 'vitest'

import type { CategoryRuleset } from '@/types'
import { CategoryDirection } from '@/types-enums'
import { createRuleset } from '@/m-category/service'
import { toCategoryId } from '@/utils/Category'

import { EXCLUDED, getMappingUpdates, getMappingValues, NOT_MAPPED, toMappingKey } from '../actions'

const NOW = '2026-01-01T00:00:00Z'

const withMappings = (ruleset: CategoryRuleset, mappings: CategoryRuleset['mappings']) => ({ ...ruleset, mappings })

const first = withMappings(createRuleset({ name: 'First', number: 1, now: NOW }), {
  [CategoryDirection.OUT]: { tags: { supermarket: toCategoryId('groceries') }, keywords: { 'de.rewe': null } },
  [CategoryDirection.IN]: { tags: {}, keywords: {} },
})
const second = createRuleset({ name: 'Second', number: 2, now: NOW })
const rulesets = [first, second]

describe('getMappingValues', () => {
  it('should be the option of each rule set and direction', () => {
    const tag = getMappingValues({ rulesets, target: { type: 'tag', key: 'supermarket', name: 'Supermarket' } })
    expect(tag[toMappingKey(first.id, CategoryDirection.OUT)]).toBe('groceries')
    expect(tag[toMappingKey(first.id, CategoryDirection.IN)]).toBe(NOT_MAPPED)
    expect(tag[toMappingKey(second.id, CategoryDirection.OUT)]).toBe(NOT_MAPPED)

    const keyword = getMappingValues({ rulesets, target: { type: 'keyword', key: 'de.rewe', name: 'REWE' } })
    expect(keyword[toMappingKey(first.id, CategoryDirection.OUT)]).toBe(EXCLUDED)
  })
})

describe('getMappingUpdates', () => {
  it('should change only the rule sets and directions that were changed', () => {
    const target = { type: 'keyword', key: 'de.rewe', name: 'REWE' } as const
    const initial = getMappingValues({ rulesets, target })
    const updates = getMappingUpdates({
      rulesets,
      target,
      initial,
      chosen: {
        ...initial,
        [toMappingKey(first.id, CategoryDirection.OUT)]: NOT_MAPPED,
        [toMappingKey(first.id, CategoryDirection.IN)]: 'refunds',
      },
    })

    expect(updates.map(({ rulesetId }) => rulesetId)).toEqual([first.id])
    const updated = updates[0].update(first)
    expect(updated.mappings.out.keywords).toEqual({})
    expect(updated.mappings.in.keywords).toEqual({ 'de.rewe': 'refunds' })
    expect(updated.mappings.out.tags).toEqual(first.mappings.out.tags)
  })
})
