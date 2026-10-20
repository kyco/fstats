import type { TFunction } from 'i18next'

import type {
  CategoryCode,
  CategoryTree,
  ParentCategoryCode,
  ParentCategoryDef,
  ParentCategoryNode,
  Transaction,
} from '@/types'
import { CategoryDirection } from '@/types-enums'
import { CATEGORY_COLORS } from '@/common'
import { getTemplate, SYSTEM_CATEGORIES } from '@/utils/Category'
import { isExpense } from '@/utils/Stats'

import { toTemplateCategories } from './ruleset'

const toParentNode = (parent: ParentCategoryDef, isSystem: boolean): ParentCategoryNode => {
  return {
    ...parent,
    children: parent.children.map((child) => ({ ...child, parentCode: parent.code })),
    isSystem,
  }
}

/**
 * The categories with the system categories (last of their direction), income first.
 */
export const buildCategoryTree = (categories: ParentCategoryDef[]): CategoryTree => {
  const parents = [CategoryDirection.IN, CategoryDirection.OUT].flatMap((direction) => [
    ...categories.filter((parent) => parent.direction === direction).map((parent) => toParentNode(parent, false)),
    ...SYSTEM_CATEGORIES.filter((parent) => parent.direction === direction).map((parent) => toParentNode(parent, true)),
  ])

  return {
    parents,
    parentsByCode: new Map(parents.map((parent) => [parent.code, parent])),
    categoriesByCode: new Map(parents.flatMap((parent) => parent.children.map((child) => [child.code, child]))),
  }
}

const templateTrees = new Map<string, CategoryTree>()

/**
 * Of a template, e.g. for the demo data.
 */
export const getTemplateTree = (templateId: string): CategoryTree => {
  const cached = templateTrees.get(templateId)
  if (cached) {
    return cached
  }

  const template = getTemplate(templateId)
  const tree = buildCategoryTree(template ? toTemplateCategories(template) : [])
  templateTrees.set(templateId, tree)
  return tree
}

export const getDirectionParents = (tree: CategoryTree, direction: CategoryDirection) => {
  return tree.parents.filter((parent) => parent.direction === direction)
}

/**
 * The parent category of a (sub)category of the tree.
 */
export const getParentCategory = (tree: CategoryTree, code: CategoryCode | ParentCategoryCode | null) => {
  if (!code) {
    return undefined
  }

  return tree.parentsByCode.get(tree.categoriesByCode.get(code)?.parentCode ?? code)
}

type GetCategoryLabelProps = {
  code: CategoryCode | ParentCategoryCode | null
  tree: CategoryTree
  t: TFunction
}

/**
 * As named by the user, otherwise translated (categories of the templates), the code itself when unknown.
 */
export const getCategoryLabel = ({ code, tree, t }: GetCategoryLabelProps): string => {
  const node = code ? (tree.categoriesByCode.get(code) ?? tree.parentsByCode.get(code)) : undefined
  return node?.label ?? t(code ?? 'UNCATEGORISED', { ns: 'categories' })
}

/**
 * Of the parent category, `undefined` when not in the tree.
 */
export const getCategoryColor = (tree: CategoryTree, code: CategoryCode | ParentCategoryCode | null) => {
  const parent = getParentCategory(tree, code)
  return parent ? CATEGORY_COLORS[parent.color] : undefined
}

/**
 * By the direction of its category (so e.g. a refund of an expense stays an expense), by its amount without a
 * category of the tree.
 */
export const isExpenseCategory = (tree: CategoryTree, transaction: Transaction) => {
  const parent = getParentCategory(tree, transaction.category)
  return parent ? parent.direction === CategoryDirection.OUT : isExpense(transaction)
}

/**
 * Transfers between the user's own accounts, excluded from profit and loss, see `CategoryDef.isTransfer`.
 */
export const isTransferCategory = (tree: CategoryTree, code: CategoryCode | null) => {
  return !!code && !!tree.categoriesByCode.get(code)?.isTransfer
}

/**
 * Whether the code is a category of the tree, e.g. not of another rule set.
 */
export const hasCategory = (tree: CategoryTree, code: CategoryCode) => {
  return tree.categoriesByCode.has(code)
}
