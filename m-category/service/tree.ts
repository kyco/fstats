import type { TFunction } from 'i18next'

import type { CategoryTree, ParentCategoryDef, ParentCategoryNode, Transaction } from '@/types'
import { CategoryDirection } from '@/types-enums'
import { CATEGORY_COLORS } from '@/common'
import { getTemplate } from '@/utils/Category'
import { isExpense } from '@/utils/Stats'

import { toTemplateCategories } from './ruleset'

const toParentNode = (parent: ParentCategoryDef): ParentCategoryNode => {
  return { ...parent, children: parent.children.map((child) => ({ ...child, parentId: parent.id })) }
}

/**
 * The categories, income first.
 */
export const buildCategoryTree = (categories: ParentCategoryDef[]): CategoryTree => {
  const parents = [CategoryDirection.IN, CategoryDirection.OUT].flatMap((direction) =>
    categories.filter((parent) => parent.direction === direction).map(toParentNode),
  )

  return {
    parents,
    parentsById: new Map(parents.map((parent) => [parent.id, parent])),
    categoriesById: new Map(parents.flatMap((parent) => parent.children.map((child) => [child.id, child]))),
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
export const getParentCategory = (tree: CategoryTree, id: string | null) => {
  if (!id) {
    return undefined
  }

  return tree.parentsById.get(tree.categoriesById.get(id)?.parentId ?? id)
}

type GetCategoryLabelProps = {
  id: string | null
  tree: CategoryTree
  t: TFunction
}

/**
 * As named by the user, otherwise translated (categories of the templates), the ID itself when unknown.
 */
export const getCategoryLabel = ({ id, tree, t }: GetCategoryLabelProps): string => {
  const node = id ? (tree.categoriesById.get(id) ?? tree.parentsById.get(id)) : undefined
  return node?.label ?? t(id ?? 'UNCATEGORISED', { ns: 'categories' })
}

/**
 * Of the parent category, `undefined` when not in the tree.
 */
export const getCategoryColor = (tree: CategoryTree, id: string | null) => {
  const parent = getParentCategory(tree, id)
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
export const isTransferCategory = (tree: CategoryTree, id: string | null) => {
  return !!id && !!tree.categoriesById.get(id)?.isTransfer
}

/**
 * Whether the ID is a category of the tree, e.g. not of another rule set.
 */
export const hasCategory = (tree: CategoryTree, id: string) => {
  return tree.categoriesById.has(id)
}

type GetCategoryOptionsProps = {
  tree: CategoryTree
  direction: CategoryDirection
  t: TFunction
}

/**
 * The categories a mapping or rule can choose, grouped by parent category (without "Uncategorised"), those of the direction
 * first. Also of the other one, e.g. so refunds reduce an expense category.
 */
export const getCategoryOptions = ({ tree, direction, t }: GetCategoryOptionsProps) => {
  const directions = [CategoryDirection.IN, CategoryDirection.OUT]

  return (direction === CategoryDirection.IN ? directions : directions.toReversed()).flatMap((parentDirection) =>
    getDirectionParents(tree, parentDirection).flatMap((parent) =>
      parent.children.map((child) => ({
        value: child.id,
        label: getCategoryLabel({ id: child.id, tree, t }),
        group: `${getCategoryLabel({ id: parent.id, tree, t })} · ${t(parentDirection === CategoryDirection.IN ? 'MISC.INCOME' : 'MISC.EXPENSES')}`,
      })),
    ),
  )
}
