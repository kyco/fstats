import { describe, expect, it } from 'vitest'

import { countIn, getCheckState, toggleKey, toggleKeys } from '..'

describe('toggleKey', () => {
  it('should add a missing key and remove an existing one, without changing the set', () => {
    const set = new Set(['a'])

    expect([...toggleKey(set, 'b')]).toEqual(['a', 'b'])
    expect([...toggleKey(set, 'a')]).toEqual([])
    expect([...set]).toEqual(['a'])
  })
})

describe('toggleKeys', () => {
  it('should remove all keys if any is in the set, otherwise add them', () => {
    const excluded = new Set(['HOU_01', 'INC_01'])

    expect([...toggleKeys(excluded, ['HOU_01', 'HOU_02'])]).toEqual(['INC_01'])
    expect([...toggleKeys(new Set(), ['HOU_01', 'HOU_02'])]).toEqual(['HOU_01', 'HOU_02'])
  })
})

describe('getCheckState', () => {
  it('should be checked without excluded items and indeterminate with some', () => {
    const excluded = new Set(['HOU_01', 'INC_01'])

    expect(getCheckState(countIn(excluded, ['HOU_01', 'HOU_02']), 2)).toEqual({ checked: false, indeterminate: true })
    expect(getCheckState(0, 2)).toEqual({ checked: true, indeterminate: false })
    expect(getCheckState(2, 2)).toEqual({ checked: false, indeterminate: false })
  })
})
