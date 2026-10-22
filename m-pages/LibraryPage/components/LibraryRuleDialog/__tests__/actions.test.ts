import { describe, expect, it } from 'vitest'

import { fromLibraryRefValue, NO_LIBRARY, toLibraryRefValue } from '../actions'

describe('toLibraryRefValue', () => {
  it('should round-trip tags and library keywords', () => {
    expect(fromLibraryRefValue(toLibraryRefValue({ type: 'tag', key: 'benefits' }))).toEqual({
      type: 'tag',
      key: 'benefits',
    })
    expect(fromLibraryRefValue(toLibraryRefValue({ type: 'keyword', key: 'de.rewe' }))).toEqual({
      type: 'keyword',
      key: 'de.rewe',
    })
    expect(toLibraryRefValue(undefined)).toBe(NO_LIBRARY)
    expect(fromLibraryRefValue(NO_LIBRARY)).toBeUndefined()
  })
})
