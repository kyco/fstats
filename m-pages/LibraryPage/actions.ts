import type { TFunction } from 'i18next'

import type {
  CategoryRule,
  CategoryRuleset,
  CategoryTree,
  LibraryKeyword,
  LibraryMappingTarget,
  LibraryRef,
} from '@/types'
import { CategoryDirection } from '@/types-enums'
import { buildCategoryTree, getCategoryLabel, getLibraryKeyword } from '@/m-category/service'

/**
 * DOM ID of a tag or library keyword, scrolled to when linked.
 */
export const toAnchorId = (type: 'tag' | 'keyword' | 'rule', id: string) => {
  return `${type}-${id.replaceAll('.', '-')}`
}

type GetExpandedTagsProps = {
  tag: string | null
  libraryKeyword: LibraryKeyword | undefined
}

/**
 * Tags to expand to show the linked tag, or the tag of the linked library keyword.
 */
export const getExpandedTags = ({ tag, libraryKeyword }: GetExpandedTagsProps) => {
  return [...(tag ? [tag] : []), ...(libraryKeyword ? [libraryKeyword.tag] : [])]
}

type GetRuleUsesProps = {
  rule: CategoryRule
  rulesets: CategoryRuleset[]
  t: TFunction
}

/**
 * The rule sets mapping the rule, with the category, e.g. "Standard → Groceries". A rule belonging to a tag or
 * library keyword is also used where that is mapped, e.g. "Standard → Money in: Benefits (like Benefits)".
 */
export const getRuleUses = ({ rule, rulesets, t }: GetRuleUsesProps) => {
  return rulesets.flatMap((ruleset) => {
    const tree = buildCategoryTree(ruleset.categories)
    const id = ruleset.rules[rule.id]
    if (id) {
      return [`${ruleset.name} → ${getCategoryLabel({ id, tree, t })}`]
    }

    const summary = rule.library ? getLibraryRefSummary({ ruleset, tree, library: rule.library, t }) : null
    return summary && rule.library
      ? [`${ruleset.name} → ${summary} (${t('LIBRARY_PAGE.LIKE_NAME', { name: getLibraryRefName(rule.library, t) })})`]
      : []
  })
}

/**
 * Of a tag or library keyword, as shown.
 */
export const getLibraryRefName = (library: LibraryRef, t: TFunction) => {
  return library.type === 'tag' ? t(library.key, { ns: 'tags' }) : (getLibraryKeyword(library.key)?.name ?? library.key)
}

/**
 * Whether the rule belongs to the tag, or to one of its library keywords.
 */
export const belongsToTag = (rule: CategoryRule, tag: string) => {
  return rule.library?.type === 'tag'
    ? rule.library.key === tag
    : !!rule.library && getLibraryKeyword(rule.library.key)?.tag === tag
}

type SearchRulesProps = {
  rules: CategoryRule[]
  query: string
}

/**
 * The user's rules whose keyword contains the query, ignoring case.
 */
export const searchRules = ({ rules, query }: SearchRulesProps) => {
  const needle = query.trim().toLowerCase()
  return rules.filter((rule) => rule.keyword.toLowerCase().includes(needle))
}

type GetMappingSummaryProps = {
  ruleset: CategoryRuleset
  tree: CategoryTree
  target: Pick<LibraryMappingTarget, 'type' | 'key'>
  t: TFunction
}

/**
 * Where the rule set puts the tag or library keyword, e.g. "Money out: Groceries · Money in: Refunds", without the
 * directions it doesn't map (`null` when none).
 */
export const getMappingSummary = ({ ruleset, tree, target, t }: GetMappingSummaryProps) => {
  const parts = [CategoryDirection.OUT, CategoryDirection.IN].flatMap((direction) => {
    const mappings = ruleset.mappings[direction]
    const category = target.type === 'tag' ? mappings.tags[target.key] : mappings.keywords[target.key]
    if (category === undefined) {
      return []
    }
    const label = category === null ? t('RULESETS_PAGE.LIBRARY.EXCLUDED') : getCategoryLabel({ id: category, tree, t })
    const directionLabel = t(
      direction === CategoryDirection.OUT ? 'RULESETS_PAGE.LIBRARY.MONEY_OUT' : 'RULESETS_PAGE.LIBRARY.MONEY_IN',
    )
    return [`${directionLabel}: ${label}`]
  })

  return parts.length ? parts.join(' · ') : null
}

type GetLibraryRefSummaryProps = {
  ruleset: CategoryRuleset
  tree: CategoryTree
  library: LibraryRef
  t: TFunction
}

/**
 * Where the rule set puts the tag or library keyword (see `getMappingSummary`), a library keyword where its tag goes
 * unless mapped on its own.
 */
export const getLibraryRefSummary = ({ ruleset, tree, library, t }: GetLibraryRefSummaryProps) => {
  const own = getMappingSummary({ ruleset, tree, target: library, t })
  if (own || library.type === 'tag') {
    return own
  }

  const tag = getLibraryKeyword(library.key)?.tag
  return tag ? getMappingSummary({ ruleset, tree, target: { type: 'tag', key: tag }, t }) : null
}

type ToRulesetMappingProps = {
  /**
   * Of the rule set, none without one.
   */
  name: string | null
  mapping: string
  t: TFunction
}

/**
 * Where a rule set puts a tag or library keyword, named, e.g. "Standard: Money out: Groceries".
 */
export const toRulesetMapping = ({ name, mapping, t }: ToRulesetMappingProps) => {
  return name ? t('LIBRARY_PAGE.IN_RULESET', { name, mapping }) : mapping
}
