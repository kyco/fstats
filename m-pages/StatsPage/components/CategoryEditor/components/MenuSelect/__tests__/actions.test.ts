import { describe, expect, it } from 'vitest'

import { filterOptions } from '../actions'

const options = [
  { value: 'GRO_01', label: 'Supermarket', group: 'Groceries' },
  { value: 'GRO_02', label: 'Bakery', group: 'Groceries' },
  { value: 'TRN_01', label: 'Fuel', group: 'Transport' },
]

describe('filterOptions', () => {
  it('should keep all options without a query', () => {
    expect(filterOptions(options, ' ')).toBe(options)
  })

  it('should match labels and groups, ignoring case', () => {
    expect(filterOptions(options, 'bak').map((option) => option.value)).toEqual(['GRO_02'])
    expect(filterOptions(options, 'GROC').map((option) => option.value)).toEqual(['GRO_01', 'GRO_02'])
    expect(filterOptions(options, 'xyz')).toEqual([])
  })
})
