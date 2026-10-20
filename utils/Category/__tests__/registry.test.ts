import { describe, expect, it } from 'vitest'

import { zCategoryCode, zParentCategoryCode } from '@/types'
import { SYSTEM_CATEGORIES, TEMPLATES } from '@/utils/Category'

import deCategories from '../../../public/locales/categories/de.json'
import enCategories from '../../../public/locales/categories/en.json'
import deLocale from '../../../public/locales/de.json'
import enLocale from '../../../public/locales/en.json'

const SYSTEM_CODES = SYSTEM_CATEGORIES.flatMap((parent) => parent.children.map((child) => child.code))

describe('TEMPLATES', () => {
  it('should have unique IDs', () => {
    const ids = TEMPLATES.map((template) => template.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should have unique, valid category codes, children prefixed by their parent', () => {
    TEMPLATES.forEach((template) => {
      const parents = [...template.income.categories, ...template.expense.categories]
      const codes = parents.flatMap((parent) => [parent.code, ...parent.children])

      expect(new Set(codes).size).toBe(codes.length)
      parents.forEach((parent) => {
        expect(zParentCategoryCode.safeParse(parent.code).success).toBe(true)
        expect(SYSTEM_CATEGORIES.map((system) => system.code)).not.toContain(parent.code)
        parent.children.forEach((child) => {
          expect(zCategoryCode.safeParse(child).success).toBe(true)
          expect(child.startsWith(`${parent.code}_`)).toBe(true)
        })
      })
    })
  })

  it('should only use its own categories of the right direction, or the system ones', () => {
    TEMPLATES.forEach((template) => {
      const toCodes = (direction: typeof template.income) => [
        ...direction.categories.flatMap((parent) => parent.children),
        ...SYSTEM_CODES,
      ]

      template.income.rules.forEach((rule) => expect(toCodes(template.income)).toContain(rule.category))
      template.expense.rules.forEach((rule) => expect(toCodes(template.expense)).toContain(rule.category))
    })
  })

  it('should have translated names and category labels', () => {
    TEMPLATES.forEach((template) => {
      expect(enLocale.RULESETS_PAGE.TEMPLATES).toHaveProperty(template.id)
      expect(deLocale.RULESETS_PAGE.TEMPLATES).toHaveProperty(template.id)

      const parents = [...template.income.categories, ...template.expense.categories, ...SYSTEM_CATEGORIES]
      parents
        .flatMap((parent) => [
          parent.code,
          ...parent.children.map((child) => (typeof child === 'string' ? child : child.code)),
        ])
        .forEach((code) => {
          expect(enCategories).toHaveProperty(code)
          expect(deCategories).toHaveProperty(code)
        })
    })
  })
})
