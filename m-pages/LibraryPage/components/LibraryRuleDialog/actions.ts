import type { TFunction } from 'i18next'

import type { CategoryRuleset, LibraryKeyword, LibraryRef, MenuSelectOption } from '@/types'

/**
 * Value of the option leaving the rule unmapped in a rule set.
 */
export const NOT_MAPPED = ''

/**
 * The category each rule set maps the rule to, `NOT_MAPPED` in those not using it (or a new rule).
 */
export const getRuleMappings = (rulesets: CategoryRuleset[], ruleId: string | undefined) => {
  return Object.fromEntries(
    rulesets.map((ruleset) => [ruleset.id, (ruleId && ruleset.rules[ruleId]) || NOT_MAPPED]),
  ) as Record<string, string>
}

type GetChangedMappingsProps = {
  initial: Record<string, string>
  chosen: Record<string, string>
}

/**
 * The rule sets whose category was changed, with the new one.
 */
export const getChangedMappings = ({ initial, chosen }: GetChangedMappingsProps) => {
  return Object.entries(chosen).filter(([rulesetId, category]) => initial[rulesetId] !== category)
}

/**
 * Value of the option of a rule not belonging to anything in the library.
 */
export const NO_LIBRARY = ''

export const toLibraryRefValue = (library: LibraryRef | undefined) => {
  return library ? `${library.type}:${library.key}` : NO_LIBRARY
}

export const fromLibraryRefValue = (value: string): LibraryRef | undefined => {
  const index = value.indexOf(':')
  const type = value.slice(0, index)
  return type === 'tag' || type === 'keyword' ? { type, key: value.slice(index + 1) } : undefined
}

type GetLibraryRefOptionsProps = {
  tags: readonly string[]
  libraryKeywords: LibraryKeyword[]
  t: TFunction
}

/**
 * What a rule can belong to: the tags, then the library keywords (with their tag).
 */
export const getLibraryRefOptions = ({ tags, libraryKeywords, t }: GetLibraryRefOptionsProps): MenuSelectOption[] => {
  return [
    ...tags.map((tag) => ({
      value: toLibraryRefValue({ type: 'tag', key: tag }),
      label: t(tag, { ns: 'tags' }),
      group: t('RULESETS_PAGE.LIBRARY.TAGS'),
    })),
    ...libraryKeywords.map((libraryKeyword) => ({
      value: toLibraryRefValue({ type: 'keyword', key: libraryKeyword.id }),
      label: libraryKeyword.name,
      description: t(libraryKeyword.tag, { ns: 'tags' }),
      group: t('RULESETS_PAGE.LIBRARY.KEYWORDS'),
    })),
  ]
}
