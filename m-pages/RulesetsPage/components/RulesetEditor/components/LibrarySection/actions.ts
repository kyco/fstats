import type { TFunction } from 'i18next'

import type { CategoryId, CategoryMappings, CategoryTree, LibraryKeyword, MenuSelectOption } from '@/types'
import { CategoryDirection } from '@/types-enums'
import { getCategoryLabel, getDirectionParents } from '@/m-category/service'

/**
 * Value of the option removing a mapping, e.g. "Not mapped".
 */
export const NO_MAPPING = ''

/**
 * Value of the option leaving a library keyword uncategorised, see `CategoryMappings.keywords`.
 */
export const EXCLUDED = 'excluded'

type GetKeywordHintMappingProps = {
  libraryKeyword: LibraryKeyword
  mappings: CategoryMappings
}

/**
 * The category the library keyword gets by its hint, see `mapLibraryKeyword`.
 */
export const getKeywordHintMapping = ({ libraryKeyword, mappings }: GetKeywordHintMappingProps): CategoryId | null => {
  return mappings.hints[libraryKeyword.hint] ?? null
}

type GetCategoryOptionsProps = {
  tree: CategoryTree
  direction: CategoryDirection
  t: TFunction
}

/**
 * The categories a mapping can choose, grouped by parent category (without "Uncategorised"), those of the direction
 * first. Also of the other one, e.g. so refunds reduce an expense category.
 */
export const getCategoryOptions = ({ tree, direction, t }: GetCategoryOptionsProps): MenuSelectOption[] => {
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
