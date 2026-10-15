import { describe, expect, it } from 'vitest'

import { resizePanes } from '../actions'

describe('resizePanes', () => {
  it('should move the divider between two panes and keep the others', () => {
    expect(resizePanes({ sizes: [20, 50, 30], index: 1, delta: 10 })).toEqual([20, 60, 20])
  })

  it('should keep the minimum size on both sides', () => {
    expect(resizePanes({ sizes: [20, 50, 30], index: 0, delta: -15 })).toEqual([10, 60, 30])
    expect(resizePanes({ sizes: [50, 50], index: 0, delta: 45 })).toEqual([90, 10])
  })
})
