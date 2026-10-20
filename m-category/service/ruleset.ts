import { isEqual, omit } from 'lodash'

import type {
  CategoryCode,
  CategoryDef,
  CategoryRule,
  CategoryRuleDraft,
  CategoryRuleset,
  CategoryTemplateDef,
  KeywordRuleDef,
  ParentCategoryCode,
  ParentCategoryDef,
} from '@/types'
import type { CategoryColor } from '@/types-enums'
import { CategoryDirection, CategoryRuleDirection, CategoryRuleField, CategoryRuleMatch } from '@/types-enums'
import { getParentCategoryCode, SYSTEM_CATEGORIES, TEMPLATES } from '@/utils/Category'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const randomCode = (length: number) => {
  const values = crypto.getRandomValues(new Uint32Array(length))
  return [...values].map((value) => CODE_CHARS[value % CODE_CHARS.length]).join('')
}

/**
 * Codes that are or were used by the templates and the system categories, so generated ones never clash with them.
 */
const RESERVED_PARENT_CODES = new Set([
  ...TEMPLATES.flatMap((template) =>
    [template.income, template.expense].flatMap((direction) => direction.categories.map((parent) => parent.code)),
  ),
  ...SYSTEM_CATEGORIES.map((parent) => parent.code),
])

/**
 * Random, so a category set for a single transaction (by its code) never ends up in another category, e.g. one created
 * after deleting it or one of another rule set. Parent codes start with "X", the templates use 3 letters.
 */
export const createCategoryCode = (parentCode?: ParentCategoryCode): string => {
  if (parentCode) {
    return `${parentCode}_${randomCode(6)}`
  }

  const code = `X${randomCode(6)}`
  return RESERVED_PARENT_CODES.has(code) ? createCategoryCode() : code
}

const toDirectionRules = (rules: KeywordRuleDef[], direction: CategoryRuleDirection): CategoryRuleDraft[] => {
  return rules.flatMap(({ category, keywords }) =>
    keywords.map((keyword) => ({
      field: CategoryRuleField.DESCRIPTION,
      match: CategoryRuleMatch.CONTAINS_WORD,
      ignoreCase: true,
      direction,
      category,
      keyword,
    })),
  )
}

/**
 * Rules of a template, one per keyword.
 */
export const toTemplateRules = (template: CategoryTemplateDef): CategoryRuleDraft[] => {
  return [
    ...toDirectionRules(template.income.rules, CategoryRuleDirection.IN),
    ...toDirectionRules(template.expense.rules, CategoryRuleDirection.OUT),
  ]
}

/**
 * Categories of a template, without labels (translated by their codes).
 */
export const toTemplateCategories = (template: CategoryTemplateDef): ParentCategoryDef[] => {
  const toParents = (direction: CategoryDirection) => {
    const { categories } = direction === CategoryDirection.IN ? template.income : template.expense
    return categories.map(({ code, color, children, isTransfer }) => ({
      code,
      color,
      direction,
      children: children.map((child) => (isTransfer ? { code: child, isTransfer } : { code: child })),
    }))
  }

  return [...toParents(CategoryDirection.IN), ...toParents(CategoryDirection.OUT)]
}

/**
 * Rules numbered from 1, with new IDs.
 */
export const toNumberedRules = (rules: CategoryRuleDraft[], startAt = 1): CategoryRule[] => {
  return rules.map((rule, index) => ({ ...rule, id: crypto.randomUUID(), number: startAt + index }))
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
   * Its categories and rules are copied, empty without.
   */
  template?: CategoryTemplateDef
  /**
   * Its categories and rules are copied (with new rule IDs), instead of a template's.
   */
  copyOf?: CategoryRuleset
}

export const createRuleset = ({ name, number, now, template, copyOf }: CreateRulesetProps): CategoryRuleset => {
  const rules = copyOf
    ? copyOf.rules.map((rule) => ({ ...rule, id: crypto.randomUUID() }))
    : toNumberedRules(template ? toTemplateRules(template) : [])

  return {
    id: crypto.randomUUID(),
    number,
    name,
    categories: copyOf ? copyOf.categories : template ? toTemplateCategories(template) : [],
    rules,
    created: now,
    modified: now,
  }
}

/**
 * Number of (sub)categories that can be assigned, with the system ones every rule set has.
 */
export const getCategoryCount = (categories: ParentCategoryDef[]) => {
  return [...categories, ...SYSTEM_CATEGORIES].reduce((count, parent) => count + parent.children.length, 0)
}

/**
 * Whether the rule set has the categories and rules of a template, unchanged (also when renamed).
 */
export const isUnchangedTemplate = (ruleset: CategoryRuleset) => {
  const rules = ruleset.rules.map((rule) => omit(rule, ['id', 'number']))
  return TEMPLATES.some(
    (template) =>
      isEqual(ruleset.categories, toTemplateCategories(template)) && isEqual(rules, toTemplateRules(template)),
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
  code?: ParentCategoryCode
}

export const addParentCategory =
  ({ label, direction, color, code = createCategoryCode() }: AddParentCategoryProps): RulesetUpdate =>
  (ruleset) => {
    // A parent category needs a subcategory to be assigned, it starts with one of the same name
    const parent: ParentCategoryDef = {
      code,
      label,
      color,
      direction,
      children: [{ code: createCategoryCode(code), label }],
    }
    return { ...ruleset, categories: [...ruleset.categories, parent] }
  }

type AddCategoryProps = {
  parentCode: ParentCategoryCode
  label: string
  isTransfer?: boolean
}

export const addCategory =
  ({ parentCode, label, isTransfer }: AddCategoryProps): RulesetUpdate =>
  (ruleset) => {
    const child = { code: createCategoryCode(parentCode), label, ...(isTransfer ? { isTransfer } : {}) }

    return {
      ...ruleset,
      categories: ruleset.categories.map((parent) =>
        parent.code === parentCode ? { ...parent, children: [...parent.children, child] } : parent,
      ),
    }
  }

type UpdateCategoryProps = {
  code: CategoryCode | ParentCategoryCode
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
  ({ code, label, color, isTransfer }: UpdateCategoryProps): RulesetUpdate =>
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
        parent.code === code
          ? { ...parent, label: toLabel(parent.label), color: color ?? parent.color }
          : {
              ...parent,
              children: parent.children.map((child) =>
                child.code === code ? toChild({ ...child, label: toLabel(child.label) }) : child,
              ),
            },
      ),
    }
  }

/**
 * Codes of the category, or of a parent category's subcategories.
 */
const getCategoryCodes = (ruleset: CategoryRuleset, code: CategoryCode | ParentCategoryCode) => {
  const parent = ruleset.categories.find((other) => other.code === code)
  return parent ? parent.children.map((child) => child.code) : [code]
}

/**
 * Rules assigning the category, or a subcategory of the parent category.
 */
export const getCategoryRules = (ruleset: CategoryRuleset, code: CategoryCode | ParentCategoryCode) => {
  const codes = getCategoryCodes(ruleset, code)
  return ruleset.rules.filter((rule) => codes.includes(rule.category))
}

/**
 * With the rules assigning it, its transactions are then uncategorised (categories set for single transactions too,
 * as the rule set no longer has it).
 */
export const removeCategory =
  (code: CategoryCode | ParentCategoryCode): RulesetUpdate =>
  (ruleset) => {
    const codes = getCategoryCodes(ruleset, code)

    return {
      ...ruleset,
      categories: ruleset.categories
        .filter((parent) => parent.code !== code)
        .map((parent) => ({ ...parent, children: parent.children.filter((child) => child.code !== code) })),
      rules: ruleset.rules.filter((rule) => !codes.includes(rule.category)),
    }
  }

type MoveCategoryProps = {
  code: CategoryCode | ParentCategoryCode
  step: -1 | 1
}

/**
 * One up or down among its siblings (parent categories of the same direction).
 */
export const moveCategory =
  ({ code, step }: MoveCategoryProps): RulesetUpdate =>
  (ruleset) => {
    const swap = <T extends { code: string }>(items: T[], isSibling: (item: T) => boolean) => {
      const siblings = items.filter(isSibling)
      const index = siblings.findIndex((item) => item.code === code)
      const other = siblings[index + step]

      if (index < 0 || !other) {
        return items
      }

      return items.map((item) => (item.code === code ? other : item.code === other.code ? siblings[index] : item))
    }

    const parent = ruleset.categories.find((other) => other.code === code)

    return {
      ...ruleset,
      categories: parent
        ? swap(ruleset.categories, (other) => other.direction === parent.direction)
        : ruleset.categories.map((other) =>
            other.code === getParentCategoryCode(code)
              ? { ...other, children: swap(other.children, () => true) }
              : other,
          ),
    }
  }

export const addRule =
  (rule: CategoryRuleDraft): RulesetUpdate =>
  (ruleset) => ({
    ...ruleset,
    rules: [...ruleset.rules, { ...rule, id: crypto.randomUUID(), number: getNextNumber(ruleset.rules) }],
  })

type UpdateRuleProps = {
  ruleId: string
  rule: Partial<CategoryRuleDraft>
}

export const updateRule =
  ({ ruleId, rule }: UpdateRuleProps): RulesetUpdate =>
  (ruleset) => ({
    ...ruleset,
    rules: ruleset.rules.map((other) => (other.id === ruleId ? { ...other, ...rule } : other)),
  })

export const removeRule =
  (ruleId: string): RulesetUpdate =>
  (ruleset) => ({ ...ruleset, rules: ruleset.rules.filter((rule) => rule.id !== ruleId) })

export const renameRuleset =
  (name: string): RulesetUpdate =>
  (ruleset) => ({ ...ruleset, name })
