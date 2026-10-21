import type { TFunction } from 'i18next'

import type {
  CategoryId,
  CategoryMappingRef,
  CategoryRule,
  CategoryRuleset,
  CategoryTree,
  LibraryKeyword,
  MenuSelectOption,
} from '@/types'
import type { CategoryDirection } from '@/types-enums'
import type { RulesetUpdate } from '@/m-category/service'
import { getCategoryLabel, setHintMapping, setKeywordMapping, setRuleMapping } from '@/m-category/service'
import { HINTS } from '@/utils/Category'

type GetLibraryPickerOptionsProps = {
  ruleset: CategoryRuleset
  /**
   * The user's rules (their library).
   */
  rules: CategoryRule[]
  libraryKeywords: LibraryKeyword[]
  /**
   * The subcategory they're added to, with the direction of its parent category.
   */
  id: CategoryId
  direction: CategoryDirection
  tree: CategoryTree
  t: TFunction
}

/**
 * What can be added to a subcategory from the library: hints, the user's rules and the built-in library keywords, without those
 * already mapped to it. Others show where they're mapped now (adding them moves them).
 */
export const getLibraryPickerOptions = ({
  ruleset,
  rules,
  libraryKeywords,
  id,
  direction,
  tree,
  t,
}: GetLibraryPickerOptionsProps): MenuSelectOption[] => {
  const { hints, keywords: keywordMap } = ruleset.mappings[direction]
  const toCurrent = (current: CategoryId | null | undefined) =>
    current ? t('RULESETS_PAGE.LIBRARY.CURRENTLY', { category: getCategoryLabel({ id: current, tree, t }) }) : undefined

  return [
    ...rules
      .filter((rule) => ruleset.rules[rule.id] !== id)
      .map((rule) => ({
        value: `rule:${rule.id}`,
        label: rule.keyword,
        description: toCurrent(ruleset.rules[rule.id]),
        group: t('RULESETS_PAGE.LIBRARY.YOUR_RULES'),
      })),
    ...HINTS.filter((hint) => hints[hint] !== id).map((hint) => ({
      value: `hint:${hint}`,
      label: t(hint, { ns: 'hints' }),
      description: toCurrent(hints[hint]) ?? hint,
      group: t('RULESETS_PAGE.LIBRARY.HINTS'),
    })),
    ...libraryKeywords
      .filter((libraryKeyword) => keywordMap[libraryKeyword.id] !== id)
      .map((libraryKeyword) => ({
        value: `keyword:${libraryKeyword.id}`,
        label: libraryKeyword.name,
        description: toCurrent(keywordMap[libraryKeyword.id]) ?? libraryKeyword.keywords.join(', '),
        group: t('RULESETS_PAGE.LIBRARY.KEYWORDS'),
      })),
  ]
}

type ToLibraryMappingProps = {
  /**
   * Of an option, see `getLibraryPickerOptions`.
   */
  value: string
  id: CategoryId
  direction: CategoryDirection
}

/**
 * Maps what was picked from the library to the subcategory.
 */
export const toLibraryMapping = ({ value, id, direction }: ToLibraryMappingProps): RulesetUpdate => {
  const [type, key] = [value.slice(0, value.indexOf(':')), value.slice(value.indexOf(':') + 1)]

  if (type === 'rule') {
    return setRuleMapping({ ruleId: key, category: id })
  }

  return type === 'hint'
    ? setHintMapping({ direction, key, category: id })
    : setKeywordMapping({ direction, key, category: id })
}

type GetMappedKeywordsProps = {
  mapping: CategoryMappingRef
  ruleset: CategoryRuleset
  libraryKeywords: LibraryKeyword[]
}

/**
 * The library keywords a hint or library keyword mapping categorises: of a hint, those with the hint (not those mapped
 * on their own).
 */
export const getMappedKeywords = ({ mapping, ruleset, libraryKeywords }: GetMappedKeywordsProps) => {
  if (mapping.type === 'keyword') {
    return libraryKeywords.filter((libraryKeyword) => libraryKeyword.id === mapping.key)
  }

  const keywordMap = ruleset.mappings[mapping.direction].keywords
  return libraryKeywords.filter(
    (libraryKeyword) => libraryKeyword.hint === mapping.key && !(libraryKeyword.id in keywordMap),
  )
}

/**
 * What an option of the library picker is (see `getLibraryPickerOptions`), for `LibraryRef`.
 */
export const toLibraryRefProps = (value: string, rules: CategoryRule[] = []) => {
  const [type, key] = [value.slice(0, value.indexOf(':')), value.slice(value.indexOf(':') + 1)]
  return type === 'rule'
    ? { type: 'rule' as const, number: rules.find((rule) => rule.id === key)?.number }
    : { type: type === 'hint' ? ('hint' as const) : ('keyword' as const) }
}
