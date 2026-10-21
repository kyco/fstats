import type { CategoryId, CategoryTemplateDef, LibraryPackDef } from '@/types'

export const defineTemplate = <const Id extends string>(
  template: CategoryTemplateDef & { id: Id },
): CategoryTemplateDef & { id: Id } => {
  return template
}

export const defineLibraryPack = <const Id extends string>(
  pack: LibraryPackDef & { id: Id },
): LibraryPackDef & { id: Id } => {
  return pack
}

/**
 * A category ID of a template or a select (validated when stored).
 */
export const toCategoryId = (value: string) => {
  return value as CategoryId
}
