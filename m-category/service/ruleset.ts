import { isEqual, mapValues, omit, sortBy } from 'lodash'

import type {
  CategoryDef,
  CategoryId,
  CategoryMappingRef,
  CategoryMappings,
  CategoryRule,
  CategoryRuleset,
  CategoryTemplateDef,
  ParentCategoryDef,
  TemplateDirectionDef,
} from '@/types'
import type { CategoryColor } from '@/types-enums'
import { CategoryDirection, zCategoryColor } from '@/types-enums'
import { TEMPLATES, toCategoryId } from '@/utils/Category'

const ID_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789'

/**
 * Random ID of a category created by the user, e.g. 'c_k3m9qz7w'. Never one of the templates' (they have no prefix), so
 * an override never ends up in another category, e.g. one created after deleting it.
 */
export const createCategoryId = (): CategoryId => {
  const values = crypto.getRandomValues(new Uint32Array(8))
  return toCategoryId(`c_${[...values].map((value) => ID_CHARS[value % ID_CHARS.length]).join('')}`)
}

const toMappings = ({ tags, keywords = {} }: TemplateDirectionDef): CategoryMappings => {
  return {
    tags: mapValues(tags, (id) => toCategoryId(id!)),
    keywords: mapValues(keywords, (id) => (id === null ? null : toCategoryId(id))),
  }
}

/**
 * How a template maps library keywords to its categories, by direction.
 */
export const toTemplateMappings = (template: CategoryTemplateDef): CategoryRuleset['mappings'] => {
  return { in: toMappings(template.income), out: toMappings(template.expense) }
}

const EMPTY_MAPPINGS: CategoryRuleset['mappings'] = {
  in: { tags: {}, keywords: {} },
  out: { tags: {}, keywords: {} },
}

/**
 * Categories of a template, without labels (translated by their IDs).
 */
export const toTemplateCategories = (template: CategoryTemplateDef): ParentCategoryDef[] => {
  const toParents = (direction: CategoryDirection) => {
    const { categories } = direction === CategoryDirection.IN ? template.income : template.expense
    return categories.map(({ id, color, children, isTransfer }) => ({
      id: toCategoryId(id),
      color,
      direction,
      children: children.map((child) =>
        isTransfer ? { id: toCategoryId(child), isTransfer } : { id: toCategoryId(child) },
      ),
    }))
  }

  return [...toParents(CategoryDirection.IN), ...toParents(CategoryDirection.OUT)]
}

/**
 * Next number of a rule in a rule set, or of a rule set, never reused.
 */
export const getNextNumber = (items: { number: number }[]) => {
  return Math.max(0, ...items.map((item) => item.number)) + 1
}

type CreateRulesetProps = {
  name: string
  number: number
  now: string
  /**
   * Its categories and mappings are copied, empty without. Later changes of the template don't affect the rule set.
   */
  template?: CategoryTemplateDef
  /**
   * Its categories, rules (with new IDs) and mappings are copied, instead of a template's.
   */
  copyOf?: CategoryRuleset
}

export const createRuleset = ({ name, number, now, template, copyOf }: CreateRulesetProps): CategoryRuleset => {
  return {
    id: crypto.randomUUID(),
    number,
    name,
    categories: copyOf ? copyOf.categories : template ? toTemplateCategories(template) : [],
    rules: copyOf ? copyOf.rules : {},
    mappings: copyOf ? copyOf.mappings : template ? toTemplateMappings(template) : EMPTY_MAPPINGS,
    created: now,
    modified: now,
  }
}

/**
 * Number of (sub)categories that can be assigned.
 */
export const getCategoryCount = (categories: ParentCategoryDef[]) => {
  return categories.reduce((count, parent) => count + parent.children.length, 0)
}

/**
 * Whether the rule set has the categories and mappings of a template, unchanged and without rules (also when renamed).
 */
export const isUnchangedTemplate = (ruleset: CategoryRuleset) => {
  return (
    !Object.keys(ruleset.rules).length &&
    TEMPLATES.some(
      (template) =>
        isEqual(ruleset.categories, toTemplateCategories(template)) &&
        isEqual(ruleset.mappings, toTemplateMappings(template)),
    )
  )
}

// -------------------------------------------------------
// Changes, applied to the stored rule set by `useMutateUpdateRuleset`
// -------------------------------------------------------

export type RulesetUpdate = (ruleset: CategoryRuleset) => CategoryRuleset

type AddParentCategoryProps = {
  label: string
  direction: CategoryDirection
  color: CategoryColor
  /**
   * Created before, e.g. to expand it once added. A new one by default.
   */
  id?: CategoryId
  /**
   * Of its first subcategory, created before, e.g. to select it once added. A new one by default.
   */
  childId?: CategoryId
}

export const addParentCategory =
  ({ label, direction, color, id = createCategoryId(), childId }: AddParentCategoryProps): RulesetUpdate =>
  (ruleset) => {
    // A parent category needs a subcategory to be assigned, it starts with one of the same name
    const parent: ParentCategoryDef = {
      id,
      label,
      color,
      direction,
      children: [{ id: childId ?? createCategoryId(), label }],
    }
    return { ...ruleset, categories: [...ruleset.categories, parent] }
  }

/**
 * The first colour not used by a parent category yet, so new ones stand out.
 */
export const getNextColor = (ruleset: CategoryRuleset): CategoryColor => {
  const used = new Set(ruleset.categories.map((parent) => parent.color))
  const colors = zCategoryColor.options
  return colors.find((color) => !used.has(color)) ?? colors[ruleset.categories.length % colors.length]
}

type AddNamedCategoryProps = {
  ruleset: CategoryRuleset
  label: string
  /**
   * Adds a subcategory to it. Without, a new parent category of the direction with a subcategory of the same name.
   */
  parentId?: CategoryId | null
  direction: CategoryDirection
}

/**
 * A category created while choosing one, e.g. in the category form. With the ID of the (sub)category, to assign it.
 */
export const addNamedCategory = ({ ruleset, label, parentId, direction }: AddNamedCategoryProps) => {
  if (parentId) {
    const id = createCategoryId()
    return { id, update: addCategory({ parentId, label, id }) }
  }

  const id = createCategoryId()
  const childId = createCategoryId()
  const update = addParentCategory({ label, direction, color: getNextColor(ruleset), id, childId })
  return { id: childId, update }
}

type AddCategoryProps = {
  parentId: CategoryId
  label: string
  isTransfer?: boolean
  /**
   * Created before, e.g. to select it once added. A new one by default.
   */
  id?: CategoryId
}

export const addCategory =
  ({ parentId, label, isTransfer, id = createCategoryId() }: AddCategoryProps): RulesetUpdate =>
  (ruleset) => {
    const child = { id, label, ...(isTransfer ? { isTransfer } : {}) }

    return {
      ...ruleset,
      categories: ruleset.categories.map((parent) =>
        parent.id === parentId ? { ...parent, children: [...parent.children, child] } : parent,
      ),
    }
  }

type UpdateCategoryProps = {
  id: string
  /**
   * Empty for the translated label of the templates' categories.
   */
  label?: string
  /**
   * Only of parent categories.
   */
  color?: CategoryColor
  /**
   * Only of subcategories, see `CategoryDef.isTransfer`.
   */
  isTransfer?: boolean
}

export const updateCategory =
  ({ id, label, color, isTransfer }: UpdateCategoryProps): RulesetUpdate =>
  (ruleset) => {
    const toLabel = (current?: string) => (label === undefined ? current : label.trim() || undefined)
    // Without the flag when off, like the templates' categories
    const toChild = (child: CategoryDef) => {
      const { isTransfer: current, ...rest } = child
      const next = isTransfer ?? current
      return next ? { ...rest, isTransfer: next } : rest
    }

    return {
      ...ruleset,
      categories: ruleset.categories.map((parent) =>
        parent.id === id
          ? { ...parent, label: toLabel(parent.label), color: color ?? parent.color }
          : {
              ...parent,
              children: parent.children.map((child) =>
                child.id === id ? toChild({ ...child, label: toLabel(child.label) }) : child,
              ),
            },
      ),
    }
  }

/**
 * Codes of the category, or of a parent category's subcategories.
 */
const getCategoryIds = (ruleset: CategoryRuleset, id: string) => {
  const parent = ruleset.categories.find((other) => other.id === id)
  return parent ? parent.children.map((child) => child.id) : [id]
}

/**
 * Rules assigning the category, or a subcategory of the parent category.
 */
type GetCategoryRulesProps = {
  ruleset: CategoryRuleset
  /**
   * The user's rules (their library).
   */
  rules: CategoryRule[]
  id: string
}

/**
 * The user's rules the rule set maps to the category, or a subcategory of the parent category, newest first.
 */
export const getCategoryRules = ({ ruleset, rules, id }: GetCategoryRulesProps) => {
  const ids = getCategoryIds(ruleset, id)
  return sortBy(
    rules.filter((rule) => ids.includes(ruleset.rules[rule.id] ?? '')),
    'number',
  ).reverse()
}

/**
 * Number of the user's rules the rule set maps, also of deleted ones (cleaned up on deleting).
 */
export const getRuleCount = (ruleset: CategoryRuleset) => {
  return Object.keys(ruleset.rules).length
}

/**
 * Library tags and keywords mapped to the category, or a subcategory of the parent category, by direction.
 */
export const getCategoryMappings = (ruleset: CategoryRuleset, id: string): CategoryMappingRef[] => {
  const ids = getCategoryIds(ruleset, id)
  const toRefs = (
    type: CategoryMappingRef['type'],
    direction: CategoryDirection,
    map: Record<string, CategoryId | null>,
  ) =>
    Object.keys(map)
      .filter((key) => !!map[key] && ids.includes(map[key]))
      .map((key) => ({ type, key, direction }))

  return [CategoryDirection.OUT, CategoryDirection.IN].flatMap((direction) => [
    ...toRefs('tag', direction, ruleset.mappings[direction].tags),
    ...toRefs('keyword', direction, ruleset.mappings[direction].keywords),
  ])
}

/**
 * Removes a mapping, see `getCategoryMappings`. Its transactions are then categorised by broader tags, or not at all.
 */
export const removeMapping = ({ type, key, direction }: CategoryMappingRef): RulesetUpdate => {
  return type === 'tag'
    ? setTagMapping({ direction, key, category: undefined })
    : setKeywordMapping({ direction, key, category: undefined })
}

/**
 * With the rules and mappings assigning it, its transactions are then uncategorised (categories set for single
 * transactions too, as the rule set no longer has it).
 */
export const removeCategory =
  (id: string): RulesetUpdate =>
  (ruleset) => {
    const ids = getCategoryIds(ruleset, id)
    const withoutIds = <T extends CategoryId | null>(map: Record<string, T>) =>
      Object.fromEntries(Object.entries(map).filter(([, value]) => !value || !ids.includes(value)))
    const toRemaining = ({ tags, keywords }: CategoryMappings): CategoryMappings => ({
      tags: withoutIds(tags),
      keywords: withoutIds(keywords),
    })

    return {
      ...ruleset,
      categories: ruleset.categories
        .filter((parent) => parent.id !== id)
        .map((parent) => ({ ...parent, children: parent.children.filter((child) => child.id !== id) })),
      rules: withoutIds(ruleset.rules),
      mappings: { in: toRemaining(ruleset.mappings.in), out: toRemaining(ruleset.mappings.out) },
    }
  }

type MoveCategoryProps = {
  id: string
  step: -1 | 1
}

/**
 * One up or down among its siblings (parent categories of the same direction).
 */
export const moveCategory =
  ({ id, step }: MoveCategoryProps): RulesetUpdate =>
  (ruleset) => {
    const swap = <T extends { id: string }>(items: T[], isSibling: (item: T) => boolean) => {
      const siblings = items.filter(isSibling)
      const index = siblings.findIndex((item) => item.id === id)
      const other = siblings[index + step]

      if (index < 0 || !other) {
        return items
      }

      return items.map((item) => (item.id === id ? other : item.id === other.id ? siblings[index] : item))
    }

    const parent = ruleset.categories.find((other) => other.id === id)

    return {
      ...ruleset,
      categories: parent
        ? swap(ruleset.categories, (other) => other.direction === parent.direction)
        : ruleset.categories.map((other) =>
            other.children.some((child) => child.id === id)
              ? { ...other, children: swap(other.children, () => true) }
              : other,
          ),
    }
  }

type SetRuleMappingProps = {
  ruleId: string
  /**
   * `undefined` removes the rule from the rule set (it stays in the user's library).
   */
  category: CategoryId | undefined
}

/**
 * Maps one of the user's rules to a category of the rule set, see `CategoryRuleset.rules`.
 */
export const setRuleMapping =
  ({ ruleId, category }: SetRuleMappingProps): RulesetUpdate =>
  (ruleset) => ({
    ...ruleset,
    rules: category === undefined ? omit(ruleset.rules, ruleId) : { ...ruleset.rules, [ruleId]: category },
  })

type SetMappingProps = {
  direction: CategoryDirection
  /**
   * A tag (see `TAGS`) or a library keyword ID.
   */
  key: string
  /**
   * `undefined` removes the mapping (inherited from a broader tag, or unmapped). Only keywords can be mapped to `null`,
   * which leaves them uncategorised.
   */
  category: CategoryId | null | undefined
}

const setMapping = <T extends CategoryId | null>(map: Record<string, T>, key: string, value: T | undefined) => {
  return value === undefined ? omit(map, key) : { ...map, [key]: value }
}

/**
 * Maps the library tag to a category, for transactions of the direction.
 */
export const setTagMapping =
  ({ direction, key, category }: SetMappingProps): RulesetUpdate =>
  (ruleset) => {
    const mappings = ruleset.mappings[direction]
    const tags = setMapping(mappings.tags, key, category ?? undefined)
    return { ...ruleset, mappings: { ...ruleset.mappings, [direction]: { ...mappings, tags } } }
  }

/**
 * Maps the library keyword to a category (before its tags), for transactions of the direction.
 */
export const setKeywordMapping =
  ({ direction, key, category }: SetMappingProps): RulesetUpdate =>
  (ruleset) => {
    const mappings = ruleset.mappings[direction]
    const keywords = setMapping(mappings.keywords, key, category)
    return { ...ruleset, mappings: { ...ruleset.mappings, [direction]: { ...mappings, keywords } } }
  }

export const renameRuleset =
  (name: string): RulesetUpdate =>
  (ruleset) => ({ ...ruleset, name })
