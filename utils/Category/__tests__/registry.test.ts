import { describe, expect, it } from 'vitest'

import { zCategoryId } from '@/types'
import { LIBRARY, TAG_GROUPS, TAGS, TEMPLATES } from '@/utils/Category'

import deCategories from '../../../public/locales/categories/de.json'
import enCategories from '../../../public/locales/categories/en.json'
import deLocale from '../../../public/locales/de.json'
import enLocale from '../../../public/locales/en.json'

describe('TEMPLATES', () => {
  it('should have unique IDs', () => {
    const ids = TEMPLATES.map((template) => template.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should have unique, valid category IDs, never like generated ones', () => {
    TEMPLATES.forEach((template) => {
      const parents = [...template.income.categories, ...template.expense.categories]
      const ids = parents.flatMap((parent) => [parent.id, ...parent.children])

      expect(new Set(ids).size).toBe(ids.length)
      ids.forEach((id) => {
        expect(zCategoryId.safeParse(id).success).toBe(true)
        expect(id.startsWith('c_')).toBe(false)
      })
    })
  })

  it('should map tags and library keywords to its own categories', () => {
    const keywordIds = LIBRARY.flatMap((pack) =>
      pack.libraryKeywords.map((libraryKeyword) => `${pack.id}.${libraryKeyword.id}`),
    )

    TEMPLATES.forEach((template) => {
      ;[template.income, template.expense].forEach((direction) => {
        const ids = [template.income, template.expense].flatMap(({ categories }) =>
          categories.flatMap((parent) => parent.children),
        )

        Object.entries(direction.tags).forEach(([tag, id]) => {
          expect(TAGS).toContain(tag)
          expect(ids).toContain(id)
        })
        Object.entries(direction.keywords ?? {}).forEach(([keywordId, id]) => {
          expect(keywordIds).toContain(keywordId)
          if (id) {
            expect(ids).toContain(id)
          }
        })
      })
    })
  })

  it('should map every tag the library uses for money out', () => {
    const used = new Set(LIBRARY.flatMap((pack) => pack.libraryKeywords.map((libraryKeyword) => libraryKeyword.tag)))
    // Only money in, or deliberately left uncategorised (e.g. cash, which could be anything)
    const unmapped = ['salary', 'benefits', 'pension', 'dividends', 'cash']

    TEMPLATES.forEach((template) => {
      const tags = template.expense.tags as Record<string, string>
      const missing = [...used].filter((tag) => !tags[tag] && !unmapped.includes(tag))

      expect({ template: template.id, missing }).toEqual({ template: template.id, missing: [] })
    })
  })

  it('should list every tag once, in one group', () => {
    expect(new Set(TAGS).size).toBe(TAGS.length)
    expect(TAG_GROUPS.flatMap((group) => group.tags)).toEqual(TAGS)
  })

  it('should have translated names and category labels', () => {
    TEMPLATES.forEach((template) => {
      expect(enLocale.RULESETS_PAGE.TEMPLATES).toHaveProperty(template.id)
      expect(deLocale.RULESETS_PAGE.TEMPLATES).toHaveProperty(template.id)

      const parents = [...template.income.categories, ...template.expense.categories]
      parents
        .flatMap((parent) => [parent.id, ...parent.children])
        .forEach((id) => {
          expect(enCategories).toHaveProperty(id)
          expect(deCategories).toHaveProperty(id)
        })
    })
  })
})
