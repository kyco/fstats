import type { CategoryId, CategoryMappings, CategoryRuleset, LibraryMappingTarget } from '@/types'
import { CategoryDirection } from '@/types-enums'
import type { RulesetUpdate } from '@/m-category/service'
import { setKeywordMapping, setTagMapping } from '@/m-category/service'
import { toCategoryId } from '@/utils/Category'

/**
 * Value of the option removing a mapping: a tag isn't mapped, a library keyword goes where its tag goes.
 */
export const NOT_MAPPED = ''

/**
 * Value of the option leaving a library keyword uncategorised, see `CategoryMappings.keywords`.
 */
export const EXCLUDED = 'excluded'

export const DIRECTIONS = [CategoryDirection.OUT, CategoryDirection.IN]

export const toMappingKey = (rulesetId: string, direction: CategoryDirection) => {
  return `${rulesetId}:${direction}`
}

const getMap = (mappings: CategoryMappings, type: LibraryMappingTarget['type']) => {
  return type === 'tag' ? mappings.tags : (mappings.keywords as Record<string, CategoryId | null>)
}

type GetMappingValuesProps = {
  rulesets: CategoryRuleset[]
  target: LibraryMappingTarget
}

/**
 * The option chosen for the tag or library keyword in each rule set and direction, by `toMappingKey`.
 */
export const getMappingValues = ({ rulesets, target }: GetMappingValuesProps) => {
  return Object.fromEntries(
    rulesets.flatMap((ruleset) =>
      DIRECTIONS.map((direction) => {
        const category = getMap(ruleset.mappings[direction], target.type)[target.key]
        return [toMappingKey(ruleset.id, direction), category === null ? EXCLUDED : (category ?? NOT_MAPPED)]
      }),
    ),
  ) as Record<string, string>
}

type GetMappingUpdatesProps = {
  rulesets: CategoryRuleset[]
  target: LibraryMappingTarget
  initial: Record<string, string>
  chosen: Record<string, string>
}

/**
 * One change per rule set whose options were changed, see `getMappingValues`.
 */
export const getMappingUpdates = ({ rulesets, target, initial, chosen }: GetMappingUpdatesProps) => {
  const setMapping = target.type === 'tag' ? setTagMapping : setKeywordMapping

  return rulesets.flatMap((ruleset) => {
    const changes = DIRECTIONS.flatMap((direction) => {
      const key = toMappingKey(ruleset.id, direction)
      const value = chosen[key] ?? NOT_MAPPED
      if (value === initial[key]) {
        return []
      }
      const category = value === EXCLUDED ? null : value ? toCategoryId(value) : undefined
      return [setMapping({ direction, key: target.key, category })]
    })

    if (!changes.length) {
      return []
    }

    const update: RulesetUpdate = (current) => changes.reduce((result, change) => change(result), current)
    return [{ rulesetId: ruleset.id, update }]
  })
}
