import type { CategoryTemplateDef } from '@/types'

export const defineTemplate = <const Id extends string>(
  template: CategoryTemplateDef & { id: Id },
): CategoryTemplateDef & { id: Id } => {
  return template
}
