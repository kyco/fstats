import type { i18n as I18n, TFunction } from 'i18next'

type GetTemplateLabelProps = {
  id: string
  i18n: I18n
  t: TFunction
}

/**
 * Translated label of a template's category, `undefined` for categories created by the user.
 */
export const getTemplateLabel = ({ id, i18n, t }: GetTemplateLabelProps) => {
  return i18n.exists(id, { ns: 'categories' }) ? t(id, { ns: 'categories' }) : undefined
}
